import { CreditTxnType, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

const issueCreditSchema = z.object({
  loginId: z.string().trim().min(1).max(120),
  amount: z.number().int().min(1).max(1_000_000),
  memo: z.string().trim().max(300).optional(),
});

export async function GET(request: Request) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 100)
    : 20;

  const [wallets, transactions] = await Promise.all([
    prisma.creditWallet.findMany({
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        balance: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            role: true,
            loginId: true,
            displayName: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.creditTransaction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        amount: true,
        memo: true,
        referenceId: true,
        createdAt: true,
        wallet: {
          select: {
            user: {
              select: {
                id: true,
                role: true,
                loginId: true,
                displayName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    wallets: wallets.map((wallet) => ({
      id: wallet.id,
      balance: wallet.balance,
      updatedAt: wallet.updatedAt.toISOString(),
      user: wallet.user,
    })),
    transactions: transactions.map((txn) => ({
      id: txn.id,
      type: txn.type,
      amount: txn.amount,
      memo: txn.memo,
      referenceId: txn.referenceId,
      createdAt: txn.createdAt.toISOString(),
      user: txn.wallet.user,
    })),
  });
}

export async function POST(request: Request) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = issueCreditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const loginId = parsed.data.loginId.trim();
  const target = await prisma.user.findUnique({
    where: { loginId },
    select: {
      id: true,
      role: true,
      loginId: true,
      displayName: true,
      isActive: true,
    },
  });

  if (!target) {
    return NextResponse.json({ ok: false, error: "target_not_found" }, { status: 404 });
  }
  if (target.role !== UserRole.PARTICIPANT) {
    return NextResponse.json(
      { ok: false, error: "target_role_not_supported" },
      { status: 400 },
    );
  }
  if (!target.isActive) {
    return NextResponse.json({ ok: false, error: "target_inactive" }, { status: 400 });
  }

  const memo = parsed.data.memo?.trim() ? parsed.data.memo.trim() : null;

  const result = await prisma.$transaction(async (tx) => {
    const wallet = await tx.creditWallet.upsert({
      where: { userId: target.id },
      update: {},
      create: {
        userId: target.id,
        balance: 0,
      },
      select: {
        id: true,
      },
    });

    const updatedWallet = await tx.creditWallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: parsed.data.amount,
        },
      },
      select: {
        id: true,
        balance: true,
        updatedAt: true,
      },
    });

    const transaction = await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        type: CreditTxnType.ISSUE,
        amount: parsed.data.amount,
        memo,
        referenceId: null,
      },
      select: {
        id: true,
        type: true,
        amount: true,
        memo: true,
        createdAt: true,
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
    };
  });

  return NextResponse.json(
    {
      ok: true,
      target: {
        id: target.id,
        loginId: target.loginId,
        displayName: target.displayName,
      },
      wallet: {
        ...result.wallet,
        updatedAt: result.wallet.updatedAt.toISOString(),
      },
      transaction: {
        ...result.transaction,
        createdAt: result.transaction.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
