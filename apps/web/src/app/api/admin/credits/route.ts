import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 100)
    : 20;

  const wallet = await prisma.creditWallet.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      balance: true,
      updatedAt: true,
    },
  });

  const transactions = wallet
    ? await prisma.creditTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          memo: true,
          referenceId: true,
          createdAt: true,
        },
      })
    : [];

  return NextResponse.json({
    ok: true,
    wallet: wallet
      ? {
          id: wallet.id,
          balance: wallet.balance,
          updatedAt: wallet.updatedAt.toISOString(),
        }
      : {
          id: null,
          balance: 0,
          updatedAt: null,
        },
    transactions: transactions.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}
