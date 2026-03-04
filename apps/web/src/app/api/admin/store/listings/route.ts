import { TemplateType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const createListingSchema = z.object({
  templateId: z.string().trim().min(1),
  priceCredits: z.number().int().min(1).max(1_000_000),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 300)
    : 100;

  const [ownedSpecialTemplates, myListings, purchasedRows] = await Promise.all([
    prisma.template.findMany({
      where: {
        ownerId: session.user.id,
        type: TemplateType.SPECIAL,
        isArchived: false,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        version: true,
        updatedAt: true,
      },
    }),
    prisma.templateStoreListing.findMany({
      where: { sellerId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        templateId: true,
        priceCredits: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        template: {
          select: {
            id: true,
            title: true,
            description: true,
            version: true,
            isArchived: true,
          },
        },
      },
    }),
    prisma.templatePurchase.findMany({
      where: { buyerId: session.user.id },
      select: { listingId: true },
    }),
  ]);

  const purchasedListingIds = new Set(purchasedRows.map((row) => row.listingId));

  const marketListings = await prisma.templateStoreListing.findMany({
    where: {
      isActive: true,
      sellerId: { not: session.user.id },
      template: {
        type: TemplateType.SPECIAL,
        isArchived: false,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      templateId: true,
      sellerId: true,
      priceCredits: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
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
          description: true,
          version: true,
          isArchived: true,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    ownedSpecialTemplates: ownedSpecialTemplates.map((tpl) => ({
      ...tpl,
      updatedAt: tpl.updatedAt.toISOString(),
    })),
    myListings: myListings.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    marketListings: marketListings.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      alreadyPurchased: purchasedListingIds.has(item.id),
      canPurchase: !purchasedListingIds.has(item.id) && item.isActive && !item.template.isArchived,
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const ownedTemplate = await prisma.template.findFirst({
    where: {
      id: parsed.data.templateId,
      ownerId: session.user.id,
      type: TemplateType.SPECIAL,
      isArchived: false,
    },
    select: {
      id: true,
      title: true,
      description: true,
      version: true,
    },
  });

  if (!ownedTemplate) {
    return NextResponse.json({ ok: false, error: "template_not_found_or_not_special" }, { status: 404 });
  }

  const existing = await prisma.templateStoreListing.findUnique({
    where: { templateId: ownedTemplate.id },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ ok: false, error: "listing_already_exists" }, { status: 409 });
  }

  const created = await prisma.templateStoreListing.create({
    data: {
      templateId: ownedTemplate.id,
      sellerId: session.user.id,
      priceCredits: parsed.data.priceCredits,
      isActive: parsed.data.isActive ?? true,
    },
    select: {
      id: true,
      templateId: true,
      priceCredits: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      template: {
        select: {
          id: true,
          title: true,
          description: true,
          version: true,
          isArchived: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      ok: true,
      listing: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
