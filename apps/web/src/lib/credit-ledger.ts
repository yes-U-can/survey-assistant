import { CreditTxnType, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type LedgerMutationInput = {
  userId: string;
  type: CreditTxnType;
  amount: number;
  memo?: string | null;
  referenceId?: string | null;
  idempotencyKey?: string | null;
};

type TransactionRow = {
  id: string;
  walletId: string;
  type: CreditTxnType;
  amount: number;
  memo: string | null;
  referenceId: string | null;
  idempotencyKey: string | null;
  createdAt: Date;
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

function normalizeIdempotencyKey(input: string | null | undefined) {
  const value = input?.trim() ?? "";
  if (!value) {
    return null;
  }
  if (value.length > 128) {
    throw new CreditLedgerError("invalid_amount");
  }
  return value;
}

async function findExistingIdempotentResult(
  tx: Prisma.TransactionClient,
  idempotencyKey: string,
) {
  const existing = await tx.creditTransaction.findUnique({
    where: { idempotencyKey },
    select: {
      id: true,
      walletId: true,
      type: true,
      amount: true,
      memo: true,
      referenceId: true,
      idempotencyKey: true,
      createdAt: true,
    },
  });

  if (!existing) {
    return null;
  }

  const wallet = await tx.creditWallet.findUnique({
    where: { id: existing.walletId },
    select: {
      id: true,
      balance: true,
      updatedAt: true,
    },
  });

  if (!wallet) {
    throw new Error("wallet_missing_for_idempotent_transaction");
  }

  return {
    delta: existing.amount,
    wallet,
    transaction: existing,
    idempotentReplay: true as const,
  };
}

async function createWalletIfMissing(tx: Prisma.TransactionClient, userId: string) {
  return tx.creditWallet.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      balance: 0,
    },
    select: {
      id: true,
    },
  });
}

async function debitWalletAtomically(params: {
  tx: Prisma.TransactionClient;
  walletId: string;
  debitAmount: number;
}) {
  const updated = await params.tx.creditWallet.updateMany({
    where: {
      id: params.walletId,
      balance: {
        gte: params.debitAmount,
      },
    },
    data: {
      balance: {
        decrement: params.debitAmount,
      },
    },
  });

  if (updated.count === 0) {
    throw new CreditLedgerError("insufficient_balance");
  }
}

async function creditWallet(params: {
  tx: Prisma.TransactionClient;
  walletId: string;
  creditAmount: number;
}) {
  await params.tx.creditWallet.update({
    where: { id: params.walletId },
    data: {
      balance: {
        increment: params.creditAmount,
      },
    },
  });
}

async function loadWallet(tx: Prisma.TransactionClient, walletId: string) {
  const wallet = await tx.creditWallet.findUnique({
    where: { id: walletId },
    select: {
      id: true,
      balance: true,
      updatedAt: true,
    },
  });

  if (!wallet) {
    throw new Error("wallet_not_found_after_mutation");
  }

  return wallet;
}

function toTransactionOutput(row: TransactionRow) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    memo: row.memo,
    referenceId: row.referenceId,
    idempotencyKey: row.idempotencyKey,
    createdAt: row.createdAt,
  };
}

export async function applyCreditMutation(
  tx: Prisma.TransactionClient,
  input: LedgerMutationInput,
) {
  const delta = resolveDelta(input.type, input.amount);
  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);

  if (idempotencyKey) {
    const replay = await findExistingIdempotentResult(tx, idempotencyKey);
    if (replay) {
      return {
        delta: replay.delta,
        wallet: replay.wallet,
        transaction: toTransactionOutput(replay.transaction),
        idempotentReplay: replay.idempotentReplay,
      };
    }
  }

  const wallet = await createWalletIfMissing(tx, input.userId);

  if (delta < 0) {
    await debitWalletAtomically({
      tx,
      walletId: wallet.id,
      debitAmount: Math.abs(delta),
    });
  } else {
    await creditWallet({
      tx,
      walletId: wallet.id,
      creditAmount: delta,
    });
  }

  const updatedWallet = await loadWallet(tx, wallet.id);

  let createdTransaction: TransactionRow;
  try {
    createdTransaction = await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        type: input.type,
        amount: delta,
        memo: input.memo ?? null,
        referenceId: input.referenceId ?? null,
        idempotencyKey,
      },
      select: {
        id: true,
        walletId: true,
        type: true,
        amount: true,
        memo: true,
        referenceId: true,
        idempotencyKey: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (
      idempotencyKey &&
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const replay = await findExistingIdempotentResult(tx, idempotencyKey);
      if (replay) {
        return {
          delta: replay.delta,
          wallet: replay.wallet,
          transaction: toTransactionOutput(replay.transaction),
          idempotentReplay: replay.idempotentReplay,
        };
      }
    }
    throw error;
  }

  return {
    delta,
    wallet: updatedWallet,
    transaction: toTransactionOutput(createdTransaction),
    idempotentReplay: false,
  };
}

export async function applyCreditMutationWithPrisma(input: LedgerMutationInput) {
  return prisma.$transaction((tx) => applyCreditMutation(tx, input), {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });
}

