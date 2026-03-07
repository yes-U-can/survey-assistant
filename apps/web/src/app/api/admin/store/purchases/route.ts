import { CreditTxnType, Prisma, TemplateType, TemplateVisibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { applyCreditMutation, CreditLedgerError } from "@/lib/credit-ledger";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const createPurchaseSchema = z.object({
  listingId: z.string().trim().min(1),
});

const PLATFORM_FEE_PERCENT = 20;

class StorePurchaseError extends Error {
  constructor(
    public readonly code:
      | "listing_not_found"
      | "listing_inactive"
      | "invalid_listing_template"
      | "self_purchase_not_allowed"
      | "duplicate_purchase"
      | "invalid_price",
  ) {
    super(code);
    this.name = "StorePurchaseError";
  }
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200)
    : 50;

  const [purchases, sales] = await Promise.all([
    prisma.templatePurchase.findMany({
      where: { buyerId: session.user.id },
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
        listing: {
          select: {
            id: true,
            priceCredits: true,
            template: {
              select: {
                id: true,
                title: true,
                version: true,
              },
            },
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
      },
    }),
    prisma.templatePurchase.findMany({
      where: { sellerId: session.user.id },
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
        listing: {
          select: {
            id: true,
            priceCredits: true,
            template: {
              select: {
                id: true,
                title: true,
                version: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            loginId: true,
            displayName: true,
            role: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    purchases: purchases.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    sales: sales.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    writeAuditLog({
      action: "admin.store.purchase",
      result: "FAILURE",
      request,
      targetType: "template_store_listing",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPurchaseSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "admin.store.purchase",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "template_store_listing",
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const idempotencySeed =
    request.headers.get("x-idempotency-key")?.trim() ??
    `store_purchase:${session.user.id}:${parsed.data.listingId}`;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const listing = await tx.templateStoreListing.findUnique({
        where: { id: parsed.data.listingId },
        select: {
          id: true,
          templateId: true,
          sellerId: true,
          priceCredits: true,
          isActive: true,
          template: {
            select: {
              id: true,
              title: true,
              description: true,
              version: true,
              schemaJson: true,
              type: true,
              isArchived: true,
            },
          },
        },
      });

      if (!listing) {
        throw new StorePurchaseError("listing_not_found");
      }
      if (!listing.isActive) {
        throw new StorePurchaseError("listing_inactive");
      }
      if (listing.sellerId === session.user.id) {
        throw new StorePurchaseError("self_purchase_not_allowed");
      }
      if (listing.template.type !== TemplateType.SPECIAL || listing.template.isArchived) {
        throw new StorePurchaseError("invalid_listing_template");
      }

      const existingPurchase = await tx.templatePurchase.findUnique({
        where: {
          listingId_buyerId: {
            listingId: listing.id,
            buyerId: session.user.id,
          },
        },
        select: { id: true },
      });
      if (existingPurchase) {
        throw new StorePurchaseError("duplicate_purchase");
      }

      const priceCredits = listing.priceCredits;
      if (!Number.isInteger(priceCredits) || priceCredits < 1) {
        throw new StorePurchaseError("invalid_price");
      }

      const platformFeeCredits = Math.floor((priceCredits * PLATFORM_FEE_PERCENT) / 100);
      const sellerCredit = priceCredits - platformFeeCredits;
      if (sellerCredit < 1) {
        throw new StorePurchaseError("invalid_price");
      }

      const purchase = await tx.templatePurchase.create({
        data: {
          listingId: listing.id,
          templateId: listing.templateId,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          priceCredits,
          sellerCredit,
          platformFeeCredits,
        },
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
        },
      });

      const buyerMutation = await applyCreditMutation(tx, {
        userId: session.user.id,
        type: CreditTxnType.SPEND,
        amount: priceCredits,
        memo: `store_purchase:${listing.id}`,
        referenceId: purchase.id,
        idempotencyKey: `${idempotencySeed}:buyer_spend`,
      });

      const sellerMutation = await applyCreditMutation(tx, {
        userId: listing.sellerId,
        type: CreditTxnType.REWARD,
        amount: sellerCredit,
        memo: `store_sale:${listing.id}`,
        referenceId: purchase.id,
        idempotencyKey: `${idempotencySeed}:seller_reward`,
      });

      const copiedTemplate = await tx.template.create({
        data: {
          ownerId: session.user.id,
          type: TemplateType.SPECIAL,
          visibility: TemplateVisibility.PRIVATE,
          title: listing.template.title,
          description: listing.template.description?.trim()
            ? `${listing.template.description}\n\n[Purchased via store listing ${listing.id}]`
            : `[Purchased via store listing ${listing.id}]`,
          version: listing.template.version,
          schemaJson: listing.template.schemaJson as Prisma.InputJsonValue,
        },
        select: {
          id: true,
          title: true,
          description: true,
          version: true,
          type: true,
          visibility: true,
          createdAt: true,
        },
      });

        return {
          purchase,
          buyerBalance: buyerMutation.wallet.balance,
          sellerBalance: sellerMutation.wallet.balance,
          copiedTemplate,
        };
      },
      {
        maxWait: 15_000,
        timeout: 15_000,
      },
    );

    writeAuditLog({
      action: "admin.store.purchase",
      result: "SUCCESS",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "template_store_listing",
      targetId: parsed.data.listingId,
      statusCode: 201,
      detail: {
        purchaseId: result.purchase.id,
        priceCredits: result.purchase.priceCredits,
        sellerCredit: result.purchase.sellerCredit,
        platformFeeCredits: result.purchase.platformFeeCredits,
      },
    });

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
        copiedTemplate: {
          ...result.copiedTemplate,
          createdAt: result.copiedTemplate.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof StorePurchaseError) {
      const status =
        error.code === "listing_not_found"
          ? 404
          : error.code === "duplicate_purchase"
            ? 409
            : 400;
      writeAuditLog({
        action: "admin.store.purchase",
        result: "FAILURE",
        request,
        actorId: session.user.id,
        actorRole: session.user.role,
        targetType: "template_store_listing",
        targetId: parsed.data.listingId,
        statusCode: status,
        errorCode: error.code,
      });
      return NextResponse.json({ ok: false, error: error.code }, { status });
    }

    if (error instanceof CreditLedgerError) {
      if (error.code === "insufficient_balance") {
        writeAuditLog({
          action: "admin.store.purchase",
          result: "FAILURE",
          request,
          actorId: session.user.id,
          actorRole: session.user.role,
          targetType: "template_store_listing",
          targetId: parsed.data.listingId,
          statusCode: 402,
          errorCode: "insufficient_balance",
        });
        return NextResponse.json({ ok: false, error: "insufficient_balance" }, { status: 402 });
      }
      writeAuditLog({
        action: "admin.store.purchase",
        result: "FAILURE",
        request,
        actorId: session.user.id,
        actorRole: session.user.role,
        targetType: "template_store_listing",
        targetId: parsed.data.listingId,
        statusCode: 400,
        errorCode: "invalid_amount",
      });
      return NextResponse.json({ ok: false, error: "invalid_amount" }, { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      writeAuditLog({
        action: "admin.store.purchase",
        result: "FAILURE",
        request,
        actorId: session.user.id,
        actorRole: session.user.role,
        targetType: "template_store_listing",
        targetId: parsed.data.listingId,
        statusCode: 409,
        errorCode: "duplicate_purchase",
      });
      return NextResponse.json({ ok: false, error: "duplicate_purchase" }, { status: 409 });
    }

    writeAuditLog({
      action: "admin.store.purchase",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "template_store_listing",
      targetId: parsed.data.listingId,
      statusCode: 500,
      errorCode: "internal_error",
      severity: "ERROR",
    });
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
