import {
  BillingPlanCode,
  BillingRequestStatus,
  BillingRequestType,
  CreditTxnType,
  Prisma,
} from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { applyCreditMutation, CreditLedgerError } from "@/lib/credit-ledger";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

const updateBillingRequestSchema = z.object({
  status: z.enum(["REQUESTED", "REVIEWING", "APPROVED", "FULFILLED", "REJECTED", "CANCELED"]),
  adminNote: z.string().trim().max(2000).optional(),
  grantedPlanCode: z.enum(["FREE", "CLOUD_BASIC", "CLOUD_PRO"]).optional(),
  grantCreditAmount: z.number().int().min(1).max(1_000_000).optional(),
  currentPeriodEndsAt: z.string().datetime().nullable().optional(),
  autoRenew: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{ requestId: string }>;
};

function toBillingStatus(input: z.infer<typeof updateBillingRequestSchema>["status"]) {
  switch (input) {
    case "REVIEWING":
      return BillingRequestStatus.REVIEWING;
    case "APPROVED":
      return BillingRequestStatus.APPROVED;
    case "FULFILLED":
      return BillingRequestStatus.FULFILLED;
    case "REJECTED":
      return BillingRequestStatus.REJECTED;
    case "CANCELED":
      return BillingRequestStatus.CANCELED;
    default:
      return BillingRequestStatus.REQUESTED;
  }
}

function toPlanCode(input: "FREE" | "CLOUD_BASIC" | "CLOUD_PRO" | undefined | null) {
  if (!input) return null;
  if (input === "CLOUD_BASIC") return BillingPlanCode.CLOUD_BASIC;
  if (input === "CLOUD_PRO") return BillingPlanCode.CLOUD_PRO;
  return BillingPlanCode.FREE;
}

function isTerminalStatus(status: BillingRequestStatus) {
  return (
    status === BillingRequestStatus.FULFILLED ||
    status === BillingRequestStatus.REJECTED ||
    status === BillingRequestStatus.CANCELED
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    writeAuditLog({
      action: "platform.billing_request.update",
      result: "FAILURE",
      request,
      targetType: "billing_request",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { requestId } = await context.params;
  if (!requestId) {
    return NextResponse.json({ ok: false, error: "missing_request_id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateBillingRequestSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "platform.billing_request.update",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "billing_request",
      targetId: requestId,
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const targetStatus = toBillingStatus(parsed.data.status);
  const adminNote = parsed.data.adminNote?.trim() || null;
  const parsedPeriodEnd =
    parsed.data.currentPeriodEndsAt === undefined || parsed.data.currentPeriodEndsAt === null
      ? null
      : new Date(parsed.data.currentPeriodEndsAt);
  if (parsedPeriodEnd && Number.isNaN(parsedPeriodEnd.getTime())) {
    return NextResponse.json({ ok: false, error: "invalid_current_period_ends_at" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.billingRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          requesterId: true,
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

      if (!existing) {
        return { error: "billing_request_not_found" as const };
      }

      if (existing.status === BillingRequestStatus.FULFILLED && targetStatus === BillingRequestStatus.FULFILLED) {
        const replayed = await tx.billingRequest.findUnique({
          where: { id: requestId },
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
            requester: {
              select: {
                id: true,
                role: true,
                loginId: true,
                displayName: true,
              },
            },
          },
        });
        return { request: replayed };
      }

      if (targetStatus === BillingRequestStatus.FULFILLED) {
        if (existing.type === BillingRequestType.SUBSCRIPTION) {
          const planCode = toPlanCode(parsed.data.grantedPlanCode) ?? existing.requestedPlanCode;
          if (!planCode) {
            return { error: "missing_granted_plan_code" as const };
          }
          const now = new Date();
          await tx.billingProfile.upsert({
            where: { userId: existing.requesterId },
            update: {
              planCode,
              autoRenew: parsed.data.autoRenew ?? false,
              currentPeriodStartsAt: now,
              currentPeriodEndsAt: parsedPeriodEnd,
              note: adminNote,
            },
            create: {
              userId: existing.requesterId,
              planCode,
              autoRenew: parsed.data.autoRenew ?? false,
              currentPeriodStartsAt: now,
              currentPeriodEndsAt: parsedPeriodEnd,
              note: adminNote,
            },
          });
        } else {
          const amount = parsed.data.grantCreditAmount ?? existing.requestedCreditAmount;
          if (!amount || amount < 1) {
            return { error: "missing_grant_credit_amount" as const };
          }
          await applyCreditMutation(tx, {
            userId: existing.requesterId,
            type: CreditTxnType.ISSUE,
            amount,
            memo: `billing_topup_fulfilled:${requestId}`,
            referenceId: requestId,
            idempotencyKey: `billing_topup_${requestId}`,
          });
        }
      }

      await tx.billingRequest.update({
        where: { id: requestId },
        data: {
          status: targetStatus,
          adminNote,
          resolvedAt: isTerminalStatus(targetStatus) ? new Date() : null,
        },
      });

      const updated = await tx.billingRequest.findUnique({
        where: { id: requestId },
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
          requester: {
            select: {
              id: true,
              role: true,
              loginId: true,
              displayName: true,
            },
          },
        },
      });

      return { request: updated };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    if ("error" in result && result.error) {
      const statusCode =
        result.error === "billing_request_not_found"
          ? 404
          : result.error === "missing_granted_plan_code" || result.error === "missing_grant_credit_amount"
            ? 400
            : 500;
      writeAuditLog({
        action: "platform.billing_request.update",
        result: "FAILURE",
        request,
        actorId: session.user.id,
        actorRole: session.user.role,
        targetType: "billing_request",
        targetId: requestId,
        statusCode,
        errorCode: result.error,
      });
      return NextResponse.json({ ok: false, error: result.error }, { status: statusCode });
    }

    writeAuditLog({
      action: "platform.billing_request.update",
      result: "SUCCESS",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "billing_request",
      targetId: requestId,
      statusCode: 200,
      detail: {
        status: result.request?.status ?? null,
      },
    });

    return NextResponse.json({
      ok: true,
      request: result.request
        ? {
            ...result.request,
            requestedAt: result.request.requestedAt.toISOString(),
            resolvedAt: result.request.resolvedAt?.toISOString() ?? null,
          }
        : null,
    });
  } catch (error) {
    const errorCode =
      error instanceof CreditLedgerError && error.code === "insufficient_balance"
        ? "credit_ledger_error"
        : "billing_request_update_failed";
    writeAuditLog({
      action: "platform.billing_request.update",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "billing_request",
      targetId: requestId,
      statusCode: 500,
      errorCode,
    });
    return NextResponse.json({ ok: false, error: errorCode }, { status: 500 });
  }
}
