import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

export async function GET() {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const purchases = await prisma.skillBookPurchase.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      listingId: true,
      skillBookId: true,
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
      skillBook: {
        select: {
          id: true,
          title: true,
          locale: true,
        },
      },
    },
  });

  const summary = purchases.reduce(
    (acc, item) => {
      acc.purchaseCount += 1;
      acc.totalPriceCredits += item.priceCredits;
      acc.totalSellerCredits += item.sellerCredit;
      acc.totalPlatformFeeCredits += item.platformFeeCredits;
      return acc;
    },
    {
      purchaseCount: 0,
      totalPriceCredits: 0,
      totalSellerCredits: 0,
      totalPlatformFeeCredits: 0,
    },
  );

  const sellerMap = new Map<
    string,
    {
      seller: {
        id: string;
        loginId: string | null;
        displayName: string | null;
        role: string;
      };
      salesCount: number;
      totalPriceCredits: number;
      totalSellerCredits: number;
      totalPlatformFeeCredits: number;
    }
  >();

  for (const item of purchases) {
    const prev = sellerMap.get(item.seller.id) ?? {
      seller: item.seller,
      salesCount: 0,
      totalPriceCredits: 0,
      totalSellerCredits: 0,
      totalPlatformFeeCredits: 0,
    };
    prev.salesCount += 1;
    prev.totalPriceCredits += item.priceCredits;
    prev.totalSellerCredits += item.sellerCredit;
    prev.totalPlatformFeeCredits += item.platformFeeCredits;
    sellerMap.set(item.seller.id, prev);
  }

  return NextResponse.json({
    ok: true,
    summary,
    purchases: purchases.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    sellerSettlements: [...sellerMap.values()].sort((a, b) => b.totalSellerCredits - a.totalSellerCredits),
  });
}
