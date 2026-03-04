import { SpecialTemplateRequestStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { withRequesterScope } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestIp, rateLimitedResponse } from "@/lib/rate-limit";
import { requireAdminSession } from "@/lib/session-guard";

const createRequestSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(8000),
  consentPublicSource: z.literal(true),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const requests = await prisma.specialTemplateRequest.findMany({
    where: withRequesterScope(session.user.id),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      consentPublicSource: true,
      consentAt: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    requests: requests.map((item) => ({
      ...item,
      consentAt: item.consentAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    writeAuditLog({
      action: "admin.special_request.create",
      result: "FAILURE",
      request,
      targetType: "special_template_request",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const ip = getRequestIp(request);
  const rateDecision = await consumeRateLimit({
    bucketKey: `admin:special-request:${ip}:${session.user.id}`,
    limit: 20,
    windowSec: 60,
  });
  if (!rateDecision.allowed) {
    writeAuditLog({
      action: "admin.special_request.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "special_template_request",
      statusCode: 429,
      errorCode: "rate_limited",
      detail: {
        retryAfterSec: rateDecision.retryAfterSec,
      },
    });
    return rateLimitedResponse(rateDecision.retryAfterSec);
  }

  const body = await request.json().catch(() => null);
  const parsed = createRequestSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "admin.special_request.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "special_template_request",
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const created = await prisma.specialTemplateRequest.create({
    data: {
      requesterId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      status: SpecialTemplateRequestStatus.REQUESTED,
      consentPublicSource: true,
      consentAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      consentPublicSource: true,
      consentAt: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  writeAuditLog({
    action: "admin.special_request.create",
    result: "SUCCESS",
    request,
    actorId: session.user.id,
    actorRole: session.user.role,
    targetType: "special_template_request",
    targetId: created.id,
    statusCode: 201,
    detail: {
      consentPublicSource: created.consentPublicSource,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      request: {
        ...created,
        consentAt: created.consentAt.toISOString(),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
