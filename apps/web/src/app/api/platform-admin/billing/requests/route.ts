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

  const requests = await prisma.billingRequest.findMany({
    take: limit,
    orderBy: { requestedAt: "desc" },
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

  return NextResponse.json({
    ok: true,
    requests: requests.map((item) => ({
      ...item,
      requestedAt: item.requestedAt.toISOString(),
      resolvedAt: item.resolvedAt?.toISOString() ?? null,
    })),
  });
}
