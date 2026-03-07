import { Locale } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundOrNoAccessResponse } from "@/lib/admin-scope";
import { writeAuditLog } from "@/lib/audit-log";
import { runByokChat, ByokProviderError, getDefaultModel, type AiProvider } from "@/lib/ai/providers";
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
  provider: z.enum(["OPENAI", "GEMINI", "ANTHROPIC"]),
  model: z.string().trim().min(1).max(200).optional(),
  apiKey: z.string().trim().min(10).max(400),
  skillBookId: z.string().trim().min(1).optional(),
  messages: z.array(messageSchema).min(1).max(40),
  temperature: z.number().min(0).max(2).optional(),
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

    const result = await runByokChat({
      provider: parsed.data.provider as AiProvider,
      apiKey: parsed.data.apiKey,
      model: parsed.data.model,
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
        provider: parsed.data.provider,
        model: result.model,
        skillBookId: skillBook?.id ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      assistantMessage: result.message,
      model: result.model,
      usage: result.usage,
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
      return NextResponse.json(
        { ok: false, error: error.code },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 },
      );
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
