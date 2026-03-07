import { CreditTxnType, SkillBookStatus, SkillBookVisibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { applyCreditMutation, CreditLedgerError } from "@/lib/credit-ledger";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const createPurchaseSchema = z.object({
  listingId: z.string().trim().min(1),
});

const PLATFORM_FEE_PERCENT = 20;

class SkillBookPurchaseError extends Error {
  constructor(
    public readonly code:
      | "listing_not_found"
      | "listing_inactive"
      | "invalid_listing_skillbook"
      | "self_purchase_not_allowed"
      | "duplicate_purchase"
      | "invalid_price",
  ) {
    super(code);
    this.name = "SkillBookPurchaseError";
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPurchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const idempotencySeed =
    request.headers.get("x-idempotency-key")?.trim() ??
    `skillbook_purchase:${session.user.id}:${parsed.data.listingId}`;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const listing = await tx.skillBookListing.findUnique({
        where: { id: parsed.data.listingId },
        include: {
          skillBook: {
            include: {
              sources: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });

      if (!listing) {
        throw new SkillBookPurchaseError("listing_not_found");
      }
      if (!listing.isActive) {
        throw new SkillBookPurchaseError("listing_inactive");
      }
      if (listing.sellerId === session.user.id) {
        throw new SkillBookPurchaseError("self_purchase_not_allowed");
      }
      if (
        listing.skillBook.visibility !== SkillBookVisibility.STORE ||
        listing.skillBook.status !== SkillBookStatus.READY
      ) {
        throw new SkillBookPurchaseError("invalid_listing_skillbook");
      }

      const existingPurchase = await tx.skillBookPurchase.findUnique({
        where: {
          listingId_buyerId: {
            listingId: listing.id,
            buyerId: session.user.id,
          },
        },
        select: { id: true },
      });
      if (existingPurchase) {
        throw new SkillBookPurchaseError("duplicate_purchase");
      }

      const priceCredits = listing.priceCredits;
      const platformFeeCredits = Math.floor((priceCredits * PLATFORM_FEE_PERCENT) / 100);
      const sellerCredit = priceCredits - platformFeeCredits;
      if (!Number.isInteger(priceCredits) || priceCredits < 1 || sellerCredit < 1) {
        throw new SkillBookPurchaseError("invalid_price");
      }

      const purchase = await tx.skillBookPurchase.create({
        data: {
          listingId: listing.id,
          skillBookId: listing.skillBookId,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          priceCredits,
          sellerCredit,
          platformFeeCredits,
        },
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
        },
      });

      const buyerMutation = await applyCreditMutation(tx, {
        userId: session.user.id,
        type: CreditTxnType.SPEND,
        amount: priceCredits,
        memo: `skillbook_purchase:${listing.id}`,
        referenceId: purchase.id,
        idempotencyKey: `${idempotencySeed}:buyer_spend`,
      });

      const sellerMutation = await applyCreditMutation(tx, {
        userId: listing.sellerId,
        type: CreditTxnType.REWARD,
        amount: sellerCredit,
        memo: `skillbook_sale:${listing.id}`,
        referenceId: purchase.id,
        idempotencyKey: `${idempotencySeed}:seller_reward`,
      });

      const copiedSkillBook = await tx.skillBook.create({
        data: {
          ownerId: session.user.id,
          title: listing.skillBook.title,
          description: listing.skillBook.description?.trim()
            ? `${listing.skillBook.description}\n\n[Purchased via skillbook listing ${listing.id}]`
            : `[Purchased via skillbook listing ${listing.id}]`,
          locale: listing.skillBook.locale,
          visibility: SkillBookVisibility.PRIVATE,
          status: SkillBookStatus.READY,
          body: listing.skillBook.body,
          compiledPrompt: listing.skillBook.compiledPrompt,
          sources: listing.skillBook.sources.length
            ? {
                create: listing.skillBook.sources.map((source) => ({
                  label: source.label,
                  content: source.content,
                  orderIndex: source.orderIndex,
                })),
              }
            : undefined,
        },
        select: {
          id: true,
          title: true,
          visibility: true,
          status: true,
          createdAt: true,
        },
      });

        return {
          purchase,
          buyerBalance: buyerMutation.wallet.balance,
          sellerBalance: sellerMutation.wallet.balance,
          copiedSkillBook,
        };
      },
      {
        maxWait: 15_000,
        timeout: 15_000,
      },
    );

    return NextResponse.json(
      {
        ok: true,
        purchase: {
          ...result.purchase,
          createdAt: result.purchase.createdAt.toISOString(),
        },
        wallet: {
          buyerBalance: result.buyerBalance,
          sellerBalance: result.sellerBalance,
        },
        copiedSkillBook: {
          ...result.copiedSkillBook,
          createdAt: result.copiedSkillBook.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SkillBookPurchaseError) {
      const status =
        error.code === "listing_not_found"
          ? 404
          : error.code === "duplicate_purchase"
            ? 409
            : 400;
      return NextResponse.json({ ok: false, error: error.code }, { status });
    }

    if (error instanceof CreditLedgerError) {
      if (error.code === "insufficient_balance") {
        return NextResponse.json({ ok: false, error: "insufficient_balance" }, { status: 409 });
      }
      return NextResponse.json({ ok: false, error: error.code }, { status: 400 });
    }

    const detail =
      process.env.NODE_ENV === "production"
        ? undefined
        : error instanceof Error
          ? error.message
          : String(error);

    return NextResponse.json({ ok: false, error: "internal_error", detail }, { status: 500 });
  }
}
