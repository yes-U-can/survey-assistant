import { CreditTxnType, Locale } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getManagedProviderApiKey, getManagedProviderModel, getSkillBookBuilderCreditCost } from "@/lib/ai/managed";
import { runByokChat, ByokProviderError, type AiProvider } from "@/lib/ai/providers";
import { applyCreditMutationWithPrisma, CreditLedgerError } from "@/lib/credit-ledger";
import { compileSkillBookPrompt } from "@/lib/skillbooks";
import { consumeRateLimit, getRequestIp, rateLimitedResponse } from "@/lib/rate-limit";
import { requireAdminSession } from "@/lib/session-guard";

const builderSchema = z.object({
  provider: z.enum(["OPENAI", "GEMINI", "ANTHROPIC"]).default("OPENAI"),
  model: z.string().trim().min(1).max(200).optional(),
  titleHint: z.string().trim().min(1).max(120).optional(),
  descriptionHint: z.string().trim().max(1000).optional(),
  methodologyNotes: z.string().trim().min(1).max(20_000),
  goal: z.string().trim().min(1).max(2000),
  locale: z.enum(["ko", "en"]).default("ko"),
});

type BuilderDraft = {
  title: string;
  description: string;
  body: string;
  sourceSummary: string;
};

function parseDraftJson(input: string): BuilderDraft | null {
  const trimmed = input.trim();
  const jsonCandidate =
    trimmed.startsWith("```")
      ? trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "")
      : trimmed;

  try {
    const parsed = JSON.parse(jsonCandidate) as Partial<BuilderDraft>;
    if (
      typeof parsed.title === "string" &&
      typeof parsed.description === "string" &&
      typeof parsed.body === "string" &&
      typeof parsed.sourceSummary === "string"
    ) {
      return {
        title: parsed.title.trim(),
        description: parsed.description.trim(),
        body: parsed.body.trim(),
        sourceSummary: parsed.sourceSummary.trim(),
      };
    }
  } catch {
    return null;
  }

  return null;
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const ip = getRequestIp(request);
  const rateDecision = await consumeRateLimit({
    bucketKey: `admin:skillbook-builder:${ip}:${session.user.id}`,
    limit: 10,
    windowSec: 60,
  });
  if (!rateDecision.allowed) {
    return rateLimitedResponse(rateDecision.retryAfterSec);
  }

  const idempotencySeed = request.headers.get("x-idempotency-key")?.trim() ?? null;
  if (!idempotencySeed) {
    return NextResponse.json({ ok: false, error: "missing_idempotency_key" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = builderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const provider = parsed.data.provider as AiProvider;
  const apiKey = getManagedProviderApiKey(provider);
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "missing_managed_provider_api_key" },
      { status: 400 },
    );
  }

  const locale = parsed.data.locale === "en" ? Locale.en : Locale.ko;
  const creditCost = getSkillBookBuilderCreditCost();

  try {
    await applyCreditMutationWithPrisma({
      userId: session.user.id,
      type: CreditTxnType.SPEND,
      amount: creditCost,
      memo: "skillbook_builder_start",
      referenceId: null,
      idempotencyKey: `skillbook_builder_spend:${session.user.id}:${idempotencySeed}`,
    });
  } catch (error) {
    if (error instanceof CreditLedgerError && error.code === "insufficient_balance") {
      return NextResponse.json({ ok: false, error: "insufficient_balance" }, { status: 402 });
    }
    return NextResponse.json({ ok: false, error: "credit_ledger_error" }, { status: 500 });
  }

  const systemPrompt =
    locale === Locale.ko
      ? [
          "당신은 Survey Assistant의 SkillBook Builder입니다.",
          "연구자의 메모를 읽고 AI가 그대로 따를 수 있는 방법론 SkillBook 초안을 만듭니다.",
          "반드시 JSON만 반환하세요.",
          '형식: {"title":"...", "description":"...", "body":"...", "sourceSummary":"..."}',
          "body는 한국어로, 연구 해석 규칙과 분석 절차를 바로 사용할 수 있게 구체적으로 작성하세요.",
          "설명문이 아니라 실행 규칙 중심으로 정리하세요.",
        ].join(" ")
      : [
          "You are the Survey Assistant SkillBook Builder.",
          "Read the researcher's notes and turn them into an AI-ready methodology SkillBook draft.",
          "Return JSON only.",
          'Format: {"title":"...", "description":"...", "body":"...", "sourceSummary":"..."}',
          "Write body as practical methodology and interpretation rules, not as marketing copy.",
        ].join(" ");

  const userPrompt = [
    `Title hint: ${parsed.data.titleHint ?? "-"}`,
    `Description hint: ${parsed.data.descriptionHint ?? "-"}`,
    `Goal: ${parsed.data.goal}`,
    "",
    "Methodology Notes:",
    parsed.data.methodologyNotes,
  ].join("\n");

  try {
    const result = await runByokChat({
      provider,
      apiKey,
      model: getManagedProviderModel(provider, parsed.data.model) ?? parsed.data.model,
      temperature: 0.2,
      systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const draft = parseDraftJson(result.message);
    if (!draft) {
      const refund = await applyCreditMutationWithPrisma({
        userId: session.user.id,
        type: CreditTxnType.REFUND,
        amount: creditCost,
        memo: "skillbook_builder_refund_parse_failed",
        referenceId: null,
        idempotencyKey: `skillbook_builder_refund:${session.user.id}:${idempotencySeed}`,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "builder_invalid_response",
          refunded: true,
          refundTransactionId: refund.transaction.id,
        },
        { status: 502 },
      );
    }

    const compiledPrompt = compileSkillBookPrompt({
      title: draft.title || parsed.data.titleHint || (locale === Locale.ko ? "새 SkillBook" : "New SkillBook"),
      description: draft.description || parsed.data.descriptionHint || null,
      body: draft.body,
      locale,
      sources: [{ label: locale === Locale.ko ? "원본 메모" : "Source Notes", content: draft.sourceSummary || parsed.data.methodologyNotes }],
    });

    return NextResponse.json({
      ok: true,
      draft: {
        title: draft.title || parsed.data.titleHint || (locale === Locale.ko ? "새 SkillBook" : "New SkillBook"),
        description: draft.description || parsed.data.descriptionHint || "",
        body: draft.body,
        sourceSummary: draft.sourceSummary || parsed.data.methodologyNotes,
        compiledPrompt,
      },
      credits: {
        charged: creditCost,
        refunded: false,
        policyMode: "immediate_charge_refund",
      },
      usage: result.usage,
      model: result.model,
      provider,
    });
  } catch (error) {
    if (error instanceof ByokProviderError) {
      try {
        const refund = await applyCreditMutationWithPrisma({
          userId: session.user.id,
          type: CreditTxnType.REFUND,
          amount: creditCost,
          memo: "skillbook_builder_refund_provider_error",
          referenceId: null,
          idempotencyKey: `skillbook_builder_refund:${session.user.id}:${idempotencySeed}`,
        });

        return NextResponse.json(
          {
            ok: false,
            error: error.code,
            refunded: true,
            refundTransactionId: refund.transaction.id,
          },
          { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
        );
      } catch {
        return NextResponse.json(
          { ok: false, error: "refund_failed_after_provider_error" },
          { status: 500 },
        );
      }
    }

    try {
      const refund = await applyCreditMutationWithPrisma({
        userId: session.user.id,
        type: CreditTxnType.REFUND,
        amount: creditCost,
        memo: "skillbook_builder_refund_internal_error",
        referenceId: null,
        idempotencyKey: `skillbook_builder_refund:${session.user.id}:${idempotencySeed}`,
      });

      return NextResponse.json(
        {
          ok: false,
          error: "internal_error",
          refunded: true,
          refundTransactionId: refund.transaction.id,
        },
        { status: 500 },
      );
    } catch {
      return NextResponse.json(
        { ok: false, error: "refund_failed_after_internal_error" },
        { status: 500 },
      );
    }
  }
}
