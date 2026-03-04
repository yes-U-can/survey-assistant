import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

export async function GET(request: Request) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200)
    : 50;

  const [aggregate, recentPurchases, sellerGroups] = await Promise.all([
    prisma.templatePurchase.aggregate({
      _count: { _all: true },
      _sum: {
        priceCredits: true,
        sellerCredit: true,
        platformFeeCredits: true,
      },
    }),
    prisma.templatePurchase.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        listingId: true,
        templateId: true,
        buyerId: true,
        sellerId: true,
        priceCredits: true,
        sellerCredit: true,
        platformFeeCredits: true,
        createdAt: true,
        buyer: {
          select: {
            id: true,
            loginId: true,
            displayName: true,
            role: true,
          },
        },
        seller: {
          select: {
            id: true,
            loginId: true,
            displayName: true,
            role: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
            version: true,
          },
        },
      },
    }),
    prisma.templatePurchase.groupBy({
      by: ["sellerId"],
      _count: { _all: true },
      _sum: {
        sellerCredit: true,
        platformFeeCredits: true,
        priceCredits: true,
      },
      orderBy: {
        _sum: {
          sellerCredit: "desc",
        },
      },
      take: 20,
    }),
  ]);

  const sellerIds = sellerGroups.map((row) => row.sellerId);
  const sellers = await prisma.user.findMany({
    where: {
      id: { in: sellerIds },
    },
    select: {
      id: true,
      loginId: true,
      displayName: true,
      role: true,
    },
  });
  const sellerMap = new Map(sellers.map((seller) => [seller.id, seller]));

  return NextResponse.json({
    ok: true,
    summary: {
      purchaseCount: aggregate._count._all,
      totalPriceCredits: aggregate._sum.priceCredits ?? 0,
      totalSellerCredits: aggregate._sum.sellerCredit ?? 0,
      totalPlatformFeeCredits: aggregate._sum.platformFeeCredits ?? 0,
    },
    recentPurchases: recentPurchases.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    sellerSettlements: sellerGroups.map((row) => ({
      seller: sellerMap.get(row.sellerId) ?? {
        id: row.sellerId,
        loginId: null,
        displayName: null,
        role: "UNKNOWN",
      },
      salesCount: row._count._all,
      totalPriceCredits: row._sum.priceCredits ?? 0,
      totalSellerCredits: row._sum.sellerCredit ?? 0,
      totalPlatformFeeCredits: row._sum.platformFeeCredits ?? 0,
    })),
  });
}
