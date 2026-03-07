import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

function parseLimit(raw: string | null) {
  const fallback = 100;
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(Math.trunc(parsed), 200));
}

export async function GET(request: Request) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"));

  const profiles = await prisma.billingProfile.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      planCode: true,
      autoRenew: true,
      currentPeriodStartsAt: true,
      currentPeriodEndsAt: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          role: true,
          loginId: true,
          displayName: true,
          isActive: true,
          wallet: {
            select: {
              balance: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    profiles: profiles.map((item) => ({
      ...item,
      currentPeriodStartsAt: item.currentPeriodStartsAt?.toISOString() ?? null,
      currentPeriodEndsAt: item.currentPeriodEndsAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      user: {
        ...item.user,
        walletBalance: item.user.wallet?.balance ?? 0,
      },
    })),
  });
}
