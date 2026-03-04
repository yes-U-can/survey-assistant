import { CreditTxnType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { applyCreditMutationWithPrisma, CreditLedgerError } from "@/lib/credit-ledger";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const analyzeSchema = z
  .object({
    packageId: z.string().trim().min(1),
    question: z.string().trim().min(1).max(4000),
    mode: z.enum(["BYOK", "MANAGED"]).default("BYOK"),
    provider: z.enum(["openai"]).default("openai"),
    apiKey: z.string().trim().min(20).max(300).optional(),
    model: z.string().trim().min(1).max(120).optional(),
    temperature: z.number().min(0).max(2).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "BYOK" && !value.apiKey) {
      ctx.addIssue({
        code: "custom",
        message: "apiKey is required when mode is BYOK",
        path: ["apiKey"],
      });
    }
  });

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

type TemplateSummary = {
  templateId: string;
  title: string;
  type: string;
  responseCount: number;
  likertQuestionStats: Record<
    string,
    {
      count: number;
      mean: number;
      min: number;
      max: number;
    }
  >;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseInteger(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const asInt = Math.trunc(parsed);
  return Math.min(Math.max(asInt, min), max);
}

function parseDecimal(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), max);
}

function safeJson(value: Prisma.JsonValue): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => safeJson(item as Prisma.JsonValue));
  }

  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    output[key] = safeJson(nested as Prisma.JsonValue);
  }
  return output;
}

function buildTemplateSummary(params: {
  templates: Array<{ templateId: string; title: string; type: string }>;
  responses: Array<{ templateId: string; responseJson: Prisma.JsonValue }>;
}) {
  const summaries: Record<string, TemplateSummary> = {};

  for (const template of params.templates) {
    summaries[template.templateId] = {
      templateId: template.templateId,
      title: template.title,
      type: template.type,
      responseCount: 0,
      likertQuestionStats: {},
    };
  }

  for (const response of params.responses) {
    const summary = summaries[response.templateId];
    if (!summary) {
      continue;
    }
    summary.responseCount += 1;

    if (!isObject(response.responseJson)) {
      continue;
    }

    const rawAnswers = response.responseJson.answers;
    if (!isObject(rawAnswers)) {
      continue;
    }

    for (const [questionId, rawValue] of Object.entries(rawAnswers)) {
      const numeric = Number(rawValue);
      if (!Number.isFinite(numeric)) {
        continue;
      }

      const prev = summary.likertQuestionStats[questionId];
      if (!prev) {
        summary.likertQuestionStats[questionId] = {
          count: 1,
          mean: numeric,
          min: numeric,
          max: numeric,
        };
        continue;
      }

      const nextCount = prev.count + 1;
      const nextMean = (prev.mean * prev.count + numeric) / nextCount;
      summary.likertQuestionStats[questionId] = {
        count: nextCount,
        mean: Number(nextMean.toFixed(4)),
        min: Math.min(prev.min, numeric),
        max: Math.max(prev.max, numeric),
      };
    }
  }

  return Object.values(summaries);
}

async function runOpenAiChat(params: {
  apiKey: string;
  model: string;
  temperature: number;
  systemPrompt: string;
  userPrompt: string;
}) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      temperature: params.temperature,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });

  const payload = (await response.json().catch(() => null)) as OpenAiChatResponse | null;
  if (!response.ok || !payload) {
    return {
      ok: false as const,
      status: 502,
      error: "provider_error",
    };
  }

  const answer = payload.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    return {
      ok: false as const,
      status: 502,
      error: "provider_empty_response",
    };
  }

  return {
    ok: true as const,
    answer,
    usage: {
      promptTokens: payload.usage?.prompt_tokens ?? null,
      completionTokens: payload.usage?.completion_tokens ?? null,
      totalTokens: payload.usage?.total_tokens ?? null,
    },
  };
}

function calculateManagedCreditCharge(params: {
  usage: { promptTokens: number | null; completionTokens: number | null; totalTokens: number | null };
}) {
  const minPerRequest = parseInteger(
    process.env.AI_MANAGED_CREDIT_MIN_PER_REQUEST,
    1,
    0,
    1_000_000,
  );
  const fallbackPerRequest = parseInteger(
    process.env.AI_MANAGED_CREDIT_PER_REQUEST,
    1,
    0,
    1_000_000,
  );
  const inputPer1k = parseDecimal(
    process.env.AI_MANAGED_CREDIT_PER_1K_INPUT_TOKENS,
    0,
    0,
    1_000_000,
  );
  const outputPer1k = parseDecimal(
    process.env.AI_MANAGED_CREDIT_PER_1K_OUTPUT_TOKENS,
    0,
    0,
    1_000_000,
  );

  const tokenPricingEnabled = inputPer1k > 0 || outputPer1k > 0;
  if (!tokenPricingEnabled) {
    return {
      charged: Math.max(minPerRequest, fallbackPerRequest),
      policy: {
        mode: "per_request_fallback" as const,
        minPerRequest,
        fallbackPerRequest,
        inputPer1k,
        outputPer1k,
      },
    };
  }

  const promptTokens = Math.max(params.usage.promptTokens ?? 0, 0);
  const completionTokens = Math.max(params.usage.completionTokens ?? 0, 0);
  const rawCharge = (promptTokens / 1000) * inputPer1k + (completionTokens / 1000) * outputPer1k;
  const roundedCharge = Math.ceil(rawCharge);
  const tokenBasedCharge = Math.max(minPerRequest, roundedCharge);

  if (params.usage.totalTokens === null && tokenBasedCharge === minPerRequest) {
    return {
      charged: Math.max(minPerRequest, fallbackPerRequest),
      policy: {
        mode: "token_pricing_missing_usage_fallback" as const,
        minPerRequest,
        fallbackPerRequest,
        inputPer1k,
        outputPer1k,
      },
    };
  }

  return {
    charged: tokenBasedCharge,
    policy: {
      mode: "token_pricing" as const,
      minPerRequest,
      fallbackPerRequest,
      inputPer1k,
      outputPer1k,
    },
  };
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const targetPackage = await prisma.surveyPackage.findFirst({
    where: {
      id: parsed.data.packageId,
      ownerId: session.user.id,
    },
    select: {
      id: true,
      code: true,
      title: true,
      mode: true,
      status: true,
      startsAt: true,
      endsAt: true,
      maxResponsesPerParticipant: true,
      templates: {
        orderBy: { orderIndex: "asc" },
        select: {
          templateId: true,
          orderIndex: true,
          template: {
            select: {
              title: true,
              type: true,
            },
          },
        },
      },
    },
  });

  if (!targetPackage) {
    return NextResponse.json({ ok: false, error: "package_not_found" }, { status: 404 });
  }

  const [responseCount, participantCount, recentResponses] = await Promise.all([
    prisma.response.count({
      where: { packageId: targetPackage.id },
    }),
    prisma.response.groupBy({
      by: ["participantId"],
      where: { packageId: targetPackage.id },
      _count: { _all: true },
    }),
    prisma.response.findMany({
      where: { packageId: targetPackage.id },
      orderBy: [{ submittedAt: "desc" }, { attemptNo: "desc" }],
      take: 200,
      select: {
        templateId: true,
        attemptNo: true,
        submittedAt: true,
        responseJson: true,
      },
    }),
  ]);

  const minimumManagedCharge = parseInteger(
    process.env.AI_MANAGED_CREDIT_MIN_PER_REQUEST,
    1,
    0,
    1_000_000,
  );

  if (parsed.data.mode === "MANAGED") {
    const balance = await prisma.creditWallet.findUnique({
      where: { userId: session.user.id },
      select: { balance: true },
    });
    if ((balance?.balance ?? 0) < minimumManagedCharge) {
      return NextResponse.json({ ok: false, error: "insufficient_balance" }, { status: 402 });
    }
  }

  const apiKey =
    parsed.data.mode === "BYOK"
      ? parsed.data.apiKey ?? null
      : process.env.OPENAI_API_KEY ?? null;

  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          parsed.data.mode === "BYOK"
            ? "missing_byok_api_key"
            : "missing_managed_provider_api_key",
      },
      { status: 400 },
    );
  }

  const model = parsed.data.model ?? process.env.AI_OPENAI_MODEL ?? "gpt-4.1-mini";
  const temperature =
    typeof parsed.data.temperature === "number"
      ? parsed.data.temperature
      : Number(process.env.AI_OPENAI_TEMPERATURE ?? "0.2");

  const templateSummary = buildTemplateSummary({
    templates: targetPackage.templates.map((item) => ({
      templateId: item.templateId,
      title: item.template.title,
      type: item.template.type,
    })),
    responses: recentResponses.map((row) => ({
      templateId: row.templateId,
      responseJson: row.responseJson,
    })),
  });

  const analysisPayload = {
    package: {
      id: targetPackage.id,
      code: targetPackage.code,
      title: targetPackage.title,
      mode: targetPackage.mode,
      status: targetPackage.status,
      startsAt: targetPackage.startsAt?.toISOString() ?? null,
      endsAt: targetPackage.endsAt?.toISOString() ?? null,
      maxResponsesPerParticipant: targetPackage.maxResponsesPerParticipant,
      templateCount: targetPackage.templates.length,
      responseCount,
      participantCount: participantCount.length,
    },
    templateSummary,
    recentResponses: recentResponses.slice(0, 80).map((row) => ({
      templateId: row.templateId,
      attemptNo: row.attemptNo,
      submittedAt: row.submittedAt.toISOString(),
      responseJson: safeJson(row.responseJson),
    })),
  };

  const systemPrompt = [
    "You are Survey Assistant AI analyst for research admins.",
    "Use only the provided package data.",
    "Clearly separate factual summary from interpretation.",
    "Do not provide medical diagnosis or definitive clinical judgment.",
    "When data is insufficient, explicitly state limitations.",
  ].join(" ");

  const userPrompt = [
    `Question: ${parsed.data.question}`,
    "",
    "Dataset:",
    JSON.stringify(analysisPayload),
  ].join("\n");

  const aiResult = await runOpenAiChat({
    apiKey,
    model,
    temperature,
    systemPrompt,
    userPrompt,
  });

  if (!aiResult.ok) {
    return NextResponse.json({ ok: false, error: aiResult.error }, { status: aiResult.status });
  }

  const managedCharge =
    parsed.data.mode === "MANAGED"
      ? calculateManagedCreditCharge({
          usage: aiResult.usage,
        })
      : null;

  let creditMutation:
    | {
        charged: number;
        balanceAfter: number;
        transactionId: string;
        policyMode: string;
      }
    | null = null;

  if (parsed.data.mode === "MANAGED") {
    if (!managedCharge) {
      return NextResponse.json({ ok: false, error: "managed_charge_calc_error" }, { status: 500 });
    }

    try {
      const result = await applyCreditMutationWithPrisma({
        userId: session.user.id,
        type: CreditTxnType.SPEND,
        amount: managedCharge.charged,
        memo: `managed_ai_analysis:${targetPackage.code}`,
        referenceId: targetPackage.id,
      });

      creditMutation = {
        charged: managedCharge.charged,
        balanceAfter: result.wallet.balance,
        transactionId: result.transaction.id,
        policyMode: managedCharge.policy.mode,
      };
    } catch (error) {
      if (error instanceof CreditLedgerError && error.code === "insufficient_balance") {
        return NextResponse.json({ ok: false, error: "insufficient_balance" }, { status: 402 });
      }
      return NextResponse.json({ ok: false, error: "credit_ledger_error" }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    mode: parsed.data.mode,
    provider: parsed.data.provider,
    model,
    answer: aiResult.answer,
    usage: aiResult.usage,
    credits: creditMutation,
    package: {
      id: targetPackage.id,
      code: targetPackage.code,
      title: targetPackage.title,
    },
  });
}
