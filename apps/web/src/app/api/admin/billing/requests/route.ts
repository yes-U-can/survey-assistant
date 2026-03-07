import { BillingPlanCode, BillingRequestStatus, BillingRequestType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestIp, rateLimitedResponse } from "@/lib/rate-limit";
import { requireAdminSession } from "@/lib/session-guard";

const billingRequestSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SUBSCRIPTION"),
    requestedPlanCode: z.enum(["CLOUD_BASIC", "CLOUD_PRO"]),
    requestNote: z.string().trim().max(2000).optional(),
  }),
  z.object({
    type: z.literal("CREDIT_TOPUP"),
    requestedCreditAmount: z.number().int().min(1).max(1_000_000),
    requestNote: z.string().trim().max(2000).optional(),
  }),
]);

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    writeAuditLog({
      action: "admin.billing_request.create",
      result: "FAILURE",
      request,
      targetType: "billing_request",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const ip = getRequestIp(request);
  const rateDecision = await consumeRateLimit({
    bucketKey: `admin:billing-request:${ip}:${session.user.id}`,
    limit: 12,
    windowSec: 600,
  });
  if (!rateDecision.allowed) {
    writeAuditLog({
      action: "admin.billing_request.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "billing_request",
      statusCode: 429,
      errorCode: "rate_limited",
      detail: {
        retryAfterSec: rateDecision.retryAfterSec,
      },
    });
    return rateLimitedResponse(rateDecision.retryAfterSec);
  }

  const body = await request.json().catch(() => null);
  const parsed = billingRequestSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "admin.billing_request.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "billing_request",
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const created = await prisma.billingRequest.create({
    data: {
      requesterId: session.user.id,
      type:
        parsed.data.type === "SUBSCRIPTION"
          ? BillingRequestType.SUBSCRIPTION
          : BillingRequestType.CREDIT_TOPUP,
      status: BillingRequestStatus.REQUESTED,
      requestedPlanCode:
        parsed.data.type === "SUBSCRIPTION"
          ? parsed.data.requestedPlanCode === "CLOUD_PRO"
            ? BillingPlanCode.CLOUD_PRO
            : BillingPlanCode.CLOUD_BASIC
          : null,
      requestedCreditAmount:
        parsed.data.type === "CREDIT_TOPUP" ? parsed.data.requestedCreditAmount : null,
      requestNote: parsed.data.requestNote?.trim() || null,
    },
    select: {
      id: true,
      type: true,
      status: true,
      requestedPlanCode: true,
      requestedCreditAmount: true,
      requestNote: true,
      adminNote: true,
      requestedAt: true,
      resolvedAt: true,
    },
  });

  writeAuditLog({
    action: "admin.billing_request.create",
    result: "SUCCESS",
    request,
    actorId: session.user.id,
    actorRole: session.user.role,
    targetType: "billing_request",
    targetId: created.id,
    statusCode: 201,
    detail: {
      type: created.type,
      requestedPlanCode: created.requestedPlanCode,
      requestedCreditAmount: created.requestedCreditAmount,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      request: {
        ...created,
        requestedAt: created.requestedAt.toISOString(),
        resolvedAt: created.resolvedAt?.toISOString() ?? null,
      },
    },
    { status: 201 },
  );
}
