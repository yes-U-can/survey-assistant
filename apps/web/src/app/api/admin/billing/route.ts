import { NextResponse } from "next/server";

import { serializeBillingPlanCatalog } from "@/lib/billing/plans";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

function parseLimit(raw: string | null) {
  const fallback = 20;
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(Math.trunc(parsed), 100));
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"));

  const [profile, requests, wallet] = await Promise.all([
    prisma.billingProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        planCode: true,
        autoRenew: true,
        currentPeriodStartsAt: true,
        currentPeriodEndsAt: true,
        note: true,
        updatedAt: true,
      },
    }),
    prisma.billingRequest.findMany({
      where: { requesterId: session.user.id },
      orderBy: { requestedAt: "desc" },
      take: limit,
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
    }),
    prisma.creditWallet.findUnique({
      where: { userId: session.user.id },
      select: {
        balance: true,
        updatedAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    profile: profile
      ? {
          ...profile,
          currentPeriodStartsAt: profile.currentPeriodStartsAt?.toISOString() ?? null,
          currentPeriodEndsAt: profile.currentPeriodEndsAt?.toISOString() ?? null,
          updatedAt: profile.updatedAt.toISOString(),
        }
      : {
          id: null,
          planCode: "FREE",
          autoRenew: false,
          currentPeriodStartsAt: null,
          currentPeriodEndsAt: null,
          note: null,
          updatedAt: null,
        },
    wallet: wallet
      ? {
          balance: wallet.balance,
          updatedAt: wallet.updatedAt.toISOString(),
        }
      : {
          balance: 0,
          updatedAt: null,
        },
    plans: serializeBillingPlanCatalog(session.user.locale === "en" ? "en" : "ko"),
    requests: requests.map((item) => ({
      ...item,
      requestedAt: item.requestedAt.toISOString(),
      resolvedAt: item.resolvedAt?.toISOString() ?? null,
    })),
  });
}
