import { CreditTxnType } from "@prisma/client";
import { Locale } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundOrNoAccessResponse } from "@/lib/admin-scope";
import { writeAuditLog } from "@/lib/audit-log";
import { getManagedChatCreditCost, getManagedProviderApiKey, getManagedProviderModel } from "@/lib/ai/managed";
import { runByokChat, ByokProviderError, getDefaultModel, type AiProvider } from "@/lib/ai/providers";
import { applyCreditMutationWithPrisma, CreditLedgerError } from "@/lib/credit-ledger";
import { buildPackageChatContext, loadOwnedPackageDataset } from "@/lib/package-dataset";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestIp, rateLimitedResponse } from "@/lib/rate-limit";
import { requireAdminSession } from "@/lib/session-guard";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(12_000),
});

const chatSchema = z.object({
  packageId: z.string().trim().min(1),
  mode: z.enum(["BYOK", "MANAGED"]).default("BYOK"),
  provider: z.enum(["OPENAI", "GEMINI", "ANTHROPIC"]),
  model: z.string().trim().min(1).max(200).optional(),
  apiKey: z.string().trim().min(10).max(400).optional(),
  skillBookId: z.string().trim().min(1).optional(),
  messages: z.array(messageSchema).min(1).max(40),
  temperature: z.number().min(0).max(2).optional(),
}).superRefine((value, ctx) => {
  if (value.mode === "BYOK" && !value.apiKey?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "apiKey is required when mode is BYOK",
      path: ["apiKey"],
    });
  }
});

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    writeAuditLog({
      action: "admin.ai.chat",
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
    bucketKey: `admin:ai-chat:${ip}:${session.user.id}`,
    limit: 20,
    windowSec: 60,
  });
  if (!rateDecision.allowed) {
    return rateLimitedResponse(rateDecision.retryAfterSec);
  }

  const body = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const idempotencySeed = request.headers.get("x-idempotency-key")?.trim() ?? null;
  if (parsed.data.mode === "MANAGED" && !idempotencySeed) {
    return NextResponse.json({ ok: false, error: "missing_idempotency_key" }, { status: 400 });
  }

  const dataset = await loadOwnedPackageDataset(session.user.id, parsed.data.packageId);
  if (!dataset) {
    return notFoundOrNoAccessResponse();
  }

  const skillBook = parsed.data.skillBookId
    ? await prisma.skillBook.findFirst({
        where: {
          id: parsed.data.skillBookId,
          ownerId: session.user.id,
          status: { not: "ARCHIVED" },
        },
        select: {
          id: true,
          title: true,
          body: true,
          compiledPrompt: true,
        },
      })
    : null;

  if (parsed.data.skillBookId && !skillBook) {
    return notFoundOrNoAccessResponse();
  }

  try {
    const locale = session.user.locale === Locale.en ? Locale.en : Locale.ko;
    const { systemPrompt, artifacts } = buildPackageChatContext({
      dataset,
      skillBook,
      locale,
    });

    const apiKey =
      parsed.data.mode === "BYOK"
        ? parsed.data.apiKey!.trim()
        : getManagedProviderApiKey(parsed.data.provider as AiProvider);

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "missing_managed_provider_api_key" },
        { status: 400 },
      );
    }

    let charge:
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
          amount: getManagedChatCreditCost(),
          memo: `managed_ai_chat_start:${dataset.code}`,
          referenceId: dataset.id,
          idempotencyKey: `managed_ai_chat_spend:${session.user.id}:${idempotencySeed}`,
        });

        charge = {
          charged: getManagedChatCreditCost(),
          balanceAfter: result.wallet.balance,
          transactionId: result.transaction.id,
        };
      } catch (error) {
        if (error instanceof CreditLedgerError && error.code === "insufficient_balance") {
          return NextResponse.json({ ok: false, error: "insufficient_balance" }, { status: 402 });
        }
        return NextResponse.json({ ok: false, error: "credit_ledger_error" }, { status: 500 });
      }
    }

    const result = await runByokChat({
      provider: parsed.data.provider as AiProvider,
      apiKey,
      model: getManagedProviderModel(parsed.data.provider as AiProvider, parsed.data.model) ?? parsed.data.model,
      temperature: parsed.data.temperature,
      systemPrompt,
      messages: parsed.data.messages,
    });

    writeAuditLog({
      action: "admin.ai.chat",
      result: "SUCCESS",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: parsed.data.packageId,
      statusCode: 200,
      detail: {
        mode: parsed.data.mode,
        provider: parsed.data.provider,
        model: result.model,
        skillBookId: skillBook?.id ?? null,
        chargedCredits: charge?.charged ?? 0,
      },
    });

    return NextResponse.json({
      ok: true,
      assistantMessage: result.message,
      model: result.model,
      usage: result.usage,
      credits:
        parsed.data.mode === "MANAGED" && charge
          ? {
              charged: charge.charged,
              balanceAfter: charge.balanceAfter,
              refunded: false,
              policyMode: "immediate_charge_refund",
            }
          : null,
      context: {
        packageCode: dataset.code,
        skillBookTitle: skillBook?.title ?? null,
        exportShape: {
          codebookBytes: artifacts.codebookCsv.length,
          masterCsvBytes: artifacts.masterCsv.length,
        },
      },
    });
  } catch (error) {
    if (error instanceof ByokProviderError) {
      if (parsed.data.mode === "MANAGED" && idempotencySeed) {
        try {
          const refund = await applyCreditMutationWithPrisma({
            userId: session.user.id,
            type: CreditTxnType.REFUND,
            amount: getManagedChatCreditCost(),
            memo: `managed_ai_chat_refund:${dataset.code}`,
            referenceId: parsed.data.packageId,
            idempotencyKey: `managed_ai_chat_refund:${session.user.id}:${idempotencySeed}`,
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

      return NextResponse.json(
        { ok: false, error: error.code },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
    }

    if (parsed.data.mode === "MANAGED" && idempotencySeed) {
      try {
        const refund = await applyCreditMutationWithPrisma({
          userId: session.user.id,
          type: CreditTxnType.REFUND,
          amount: getManagedChatCreditCost(),
          memo: `managed_ai_chat_refund:${dataset.code}`,
          referenceId: parsed.data.packageId,
          idempotencyKey: `managed_ai_chat_refund:${session.user.id}:${idempotencySeed}`,
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

    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    providers: [
      { code: "OPENAI", defaultModel: getDefaultModel("OPENAI") },
      { code: "GEMINI", defaultModel: getDefaultModel("GEMINI") },
      { code: "ANTHROPIC", defaultModel: getDefaultModel("ANTHROPIC") },
    ],
  });
}
