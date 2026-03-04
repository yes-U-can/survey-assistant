import { CreditTxnType, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { notFoundOrNoAccessResponse, withOwnerScope } from "@/lib/admin-scope";
import { applyCreditMutationWithPrisma, CreditLedgerError } from "@/lib/credit-ledger";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestIp, rateLimitedResponse } from "@/lib/rate-limit";
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

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    writeAuditLog({
      action: "admin.ai.analyze",
      result: "FAILURE",
      request,
      targetType: "survey_package",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const ip = getRequestIp(request);
  const rateDecision = await consumeRateLimit({
    bucketKey: `admin:ai-analyze:${ip}:${session.user.id}`,
    limit: 30,
    windowSec: 60,
  });
  if (!rateDecision.allowed) {
    writeAuditLog({
      action: "admin.ai.analyze",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      statusCode: 429,
      errorCode: "rate_limited",
      detail: {
        retryAfterSec: rateDecision.retryAfterSec,
      },
    });
    return rateLimitedResponse(rateDecision.retryAfterSec);
  }

  const body = await request.json().catch(() => null);
  const parsed = analyzeSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "admin.ai.analyze",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const idempotencySeed = request.headers.get("x-idempotency-key")?.trim() ?? null;
  if (parsed.data.mode === "MANAGED" && !idempotencySeed) {
    writeAuditLog({
      action: "admin.ai.analyze",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: parsed.data.packageId,
      statusCode: 400,
      errorCode: "missing_idempotency_key",
    });
    return NextResponse.json({ ok: false, error: "missing_idempotency_key" }, { status: 400 });
  }

  const targetPackage = await prisma.surveyPackage.findFirst({
    where: withOwnerScope(session.user.id, {
      id: parsed.data.packageId,
    }),
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
    writeAuditLog({
      action: "admin.ai.analyze",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: parsed.data.packageId,
      statusCode: 404,
      errorCode: "not_found_or_no_access",
    });
    return notFoundOrNoAccessResponse();
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

  const managedChargePerRequest = parseInteger(
    process.env.AI_MANAGED_CREDIT_PER_REQUEST,
    1,
    1,
    1_000_000,
  );

  const apiKey =
    parsed.data.mode === "BYOK"
      ? parsed.data.apiKey ?? null
      : process.env.OPENAI_API_KEY ?? null;

  if (!apiKey) {
    const errorCode =
      parsed.data.mode === "BYOK"
        ? "missing_byok_api_key"
        : "missing_managed_provider_api_key";
    writeAuditLog({
      action: "admin.ai.analyze",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: targetPackage.id,
      statusCode: 400,
      errorCode,
      detail: {
        mode: parsed.data.mode,
      },
    });
    return NextResponse.json(
      {
        ok: false,
        error: errorCode,
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

  let managedChargeMutation:
    | {
        charged: number;
        balanceAfter: number;
        transactionId: string;
      }
    | null = null;

  if (parsed.data.mode === "MANAGED") {
    try {
      const result = await applyCreditMutationWithPrisma({
        userId: session.user.id,
        type: CreditTxnType.SPEND,
        amount: managedChargePerRequest,
        memo: `managed_ai_charge_start:${targetPackage.code}`,
        referenceId: targetPackage.id,
        idempotencyKey: `ai_spend:${session.user.id}:${idempotencySeed}`,
      });

      managedChargeMutation = {
        charged: managedChargePerRequest,
        balanceAfter: result.wallet.balance,
        transactionId: result.transaction.id,
      };
    } catch (error) {
      if (error instanceof CreditLedgerError && error.code === "insufficient_balance") {
        writeAuditLog({
          action: "admin.ai.analyze",
          result: "FAILURE",
          request,
          actorId: session.user.id,
          actorRole: session.user.role,
          targetType: "survey_package",
          targetId: targetPackage.id,
          statusCode: 402,
          errorCode: "insufficient_balance",
          detail: {
            mode: parsed.data.mode,
          },
        });
        return NextResponse.json({ ok: false, error: "insufficient_balance" }, { status: 402 });
      }
      writeAuditLog({
        action: "admin.ai.analyze",
        result: "FAILURE",
        request,
        actorId: session.user.id,
        actorRole: session.user.role,
        targetType: "survey_package",
        targetId: targetPackage.id,
        statusCode: 500,
        errorCode: "credit_ledger_error",
        severity: "ERROR",
      });
      return NextResponse.json({ ok: false, error: "credit_ledger_error" }, { status: 500 });
    }
  }

  const aiResult = await runOpenAiChat({
    apiKey,
    model,
    temperature,
    systemPrompt,
    userPrompt,
  });

  if (!aiResult.ok) {
    if (parsed.data.mode === "MANAGED" && managedChargeMutation) {
      try {
        const refund = await applyCreditMutationWithPrisma({
          userId: session.user.id,
          type: CreditTxnType.REFUND,
          amount: managedChargeMutation.charged,
          memo: `managed_ai_refund:${targetPackage.code}`,
          referenceId: managedChargeMutation.transactionId,
          idempotencyKey: `ai_refund:${session.user.id}:${idempotencySeed}`,
        });

        writeAuditLog({
          action: "admin.ai.analyze",
          result: "FAILURE",
          request,
          actorId: session.user.id,
          actorRole: session.user.role,
          targetType: "survey_package",
          targetId: targetPackage.id,
          statusCode: aiResult.status,
          errorCode: aiResult.error,
          detail: {
            mode: parsed.data.mode,
            refunded: true,
            refundTransactionId: refund.transaction.id,
          },
        });

        return NextResponse.json(
          {
            ok: false,
            error: aiResult.error,
            refunded: true,
            refundTransactionId: refund.transaction.id,
          },
          { status: aiResult.status },
        );
      } catch {
        writeAuditLog({
          action: "admin.ai.analyze",
          result: "FAILURE",
          request,
          actorId: session.user.id,
          actorRole: session.user.role,
          targetType: "survey_package",
          targetId: targetPackage.id,
          statusCode: 500,
          errorCode: "refund_failed_after_provider_error",
          severity: "ERROR",
          detail: {
            providerError: aiResult.error,
          },
        });
        return NextResponse.json(
          {
            ok: false,
            error: "refund_failed_after_provider_error",
          },
          { status: 500 },
        );
      }
    }

    writeAuditLog({
      action: "admin.ai.analyze",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: targetPackage.id,
      statusCode: aiResult.status,
      errorCode: aiResult.error,
      detail: {
        mode: parsed.data.mode,
      },
    });
    return NextResponse.json({ ok: false, error: aiResult.error }, { status: aiResult.status });
  }

  const creditMutation =
    parsed.data.mode === "MANAGED" && managedChargeMutation
      ? {
          charged: managedChargeMutation.charged,
          balanceAfter: managedChargeMutation.balanceAfter,
          transactionId: managedChargeMutation.transactionId,
          policyMode: "immediate_charge_refund",
          refunded: false,
        }
      : null;

  writeAuditLog({
    action: "admin.ai.analyze",
    result: "SUCCESS",
    request,
    actorId: session.user.id,
    actorRole: session.user.role,
    targetType: "survey_package",
    targetId: targetPackage.id,
    statusCode: 200,
    detail: {
      mode: parsed.data.mode,
      provider: parsed.data.provider,
      model,
      chargedCredits: creditMutation?.charged ?? 0,
      refunded: creditMutation?.refunded ?? false,
    },
  });

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
