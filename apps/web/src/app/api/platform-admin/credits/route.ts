import { CreditTxnType, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { applyCreditMutationWithPrisma, CreditLedgerError } from "@/lib/credit-ledger";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

const baseSchema = z.object({
  targetUserId: z.string().trim().min(1),
  memo: z.string().trim().max(300).optional(),
});

const standardMutationSchema = baseSchema.extend({
  type: z.enum(["ISSUE", "SPEND", "REFUND", "REWARD"]),
  amount: z.number().int().min(1).max(1_000_000),
});

const adjustmentMutationSchema = baseSchema.extend({
  type: z.literal("ADJUSTMENT"),
  amount: z.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0),
});

const mutateCreditSchema = z.union([standardMutationSchema, adjustmentMutationSchema]);

const adminRoles: UserRole[] = [UserRole.RESEARCH_ADMIN, UserRole.PLATFORM_ADMIN];

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

  const [adminUsers, wallets, transactions] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { in: adminRoles },
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        loginId: true,
        displayName: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.creditWallet.findMany({
      where: {
        user: {
          role: { in: adminRoles },
        },
      },
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
      where: {
        wallet: {
          user: {
            role: { in: adminRoles },
          },
        },
      },
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
    adminUsers: adminUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })),
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
  const parsed = mutateCreditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: parsed.data.targetUserId },
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
  if (target.role !== UserRole.RESEARCH_ADMIN && target.role !== UserRole.PLATFORM_ADMIN) {
    return NextResponse.json(
      { ok: false, error: "target_role_not_supported" },
      { status: 400 },
    );
  }
  if (!target.isActive) {
    return NextResponse.json({ ok: false, error: "target_inactive" }, { status: 400 });
  }

  const amount = parsed.data.amount;
  const mutationType =
    parsed.data.type === "ISSUE"
      ? CreditTxnType.ISSUE
      : parsed.data.type === "SPEND"
        ? CreditTxnType.SPEND
        : parsed.data.type === "REFUND"
          ? CreditTxnType.REFUND
          : parsed.data.type === "REWARD"
            ? CreditTxnType.REWARD
            : CreditTxnType.ADJUSTMENT;

  const memo = parsed.data.memo?.trim() ? parsed.data.memo.trim() : null;

  try {
    const result = await applyCreditMutationWithPrisma({
      userId: target.id,
      type: mutationType,
      amount,
      memo,
      referenceId: null,
    });

    return NextResponse.json(
      {
        ok: true,
        target: {
          id: target.id,
          role: target.role,
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
  } catch (error) {
    if (error instanceof CreditLedgerError) {
      if (error.code === "insufficient_balance") {
        return NextResponse.json({ ok: false, error: "insufficient_balance" }, { status: 400 });
      }
      return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
