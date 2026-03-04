import { CreditTxnType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type LedgerMutationInput = {
  userId: string;
  type: CreditTxnType;
  amount: number;
  memo?: string | null;
  referenceId?: string | null;
};

export class CreditLedgerError extends Error {
  constructor(public readonly code: "invalid_amount" | "insufficient_balance") {
    super(code);
    this.name = "CreditLedgerError";
  }
}

function resolveDelta(type: CreditTxnType, amount: number): number {
  if (!Number.isInteger(amount) || amount === 0) {
    throw new CreditLedgerError("invalid_amount");
  }

  if (type === CreditTxnType.ISSUE || type === CreditTxnType.REFUND || type === CreditTxnType.REWARD) {
    if (amount < 0) {
      throw new CreditLedgerError("invalid_amount");
    }
    return amount;
  }

  if (type === CreditTxnType.SPEND) {
    if (amount < 0) {
      throw new CreditLedgerError("invalid_amount");
    }
    return -amount;
  }

  return amount;
}

export async function applyCreditMutation(
  tx: Prisma.TransactionClient,
  input: LedgerMutationInput,
) {
  const delta = resolveDelta(input.type, input.amount);

  const wallet = await tx.creditWallet.upsert({
    where: { userId: input.userId },
    update: {},
    create: {
      userId: input.userId,
      balance: 0,
    },
    select: {
      id: true,
      balance: true,
    },
  });

  const nextBalance = wallet.balance + delta;
  if (nextBalance < 0) {
    throw new CreditLedgerError("insufficient_balance");
  }

  const updatedWallet = await tx.creditWallet.update({
    where: { id: wallet.id },
    data: {
      balance: {
        increment: delta,
      },
    },
    select: {
      id: true,
      balance: true,
      updatedAt: true,
    },
  });

  const createdTransaction = await tx.creditTransaction.create({
    data: {
      walletId: wallet.id,
      type: input.type,
      amount: delta,
      memo: input.memo ?? null,
      referenceId: input.referenceId ?? null,
    },
    select: {
      id: true,
      type: true,
      amount: true,
      memo: true,
      referenceId: true,
      createdAt: true,
    },
  });

  return {
    delta,
    wallet: updatedWallet,
    transaction: createdTransaction,
  };
}

export async function applyCreditMutationWithPrisma(input: LedgerMutationInput) {
  return prisma.$transaction((tx) => applyCreditMutation(tx, input));
}
