import { SkillBookStatus, SkillBookVisibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundOrNoAccessResponse } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const createListingSchema = z.object({
  skillBookId: z.string().trim().min(1),
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

  const [ownedSkillBooks, myListings, purchasedRows] = await Promise.all([
    prisma.skillBook.findMany({
      where: {
        ownerId: session.user.id,
        status: { not: SkillBookStatus.ARCHIVED },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        locale: true,
        visibility: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.skillBookListing.findMany({
      where: { sellerId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        skillBookId: true,
        sellerId: true,
        priceCredits: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        skillBook: {
          select: {
            id: true,
            title: true,
            description: true,
            locale: true,
            visibility: true,
            status: true,
          },
        },
      },
    }),
    prisma.skillBookPurchase.findMany({
      where: { buyerId: session.user.id },
      select: { listingId: true },
    }),
  ]);

  const purchasedListingIds = new Set(purchasedRows.map((row) => row.listingId));

  const marketListings = await prisma.skillBookListing.findMany({
    where: {
      isActive: true,
      sellerId: { not: session.user.id },
      skillBook: {
        visibility: SkillBookVisibility.STORE,
        status: SkillBookStatus.READY,
      },
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      skillBookId: true,
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
      skillBook: {
        select: {
          id: true,
          title: true,
          description: true,
          locale: true,
          visibility: true,
          status: true,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    ownedSkillBooks: ownedSkillBooks.map((skillBook) => ({
      ...skillBook,
      updatedAt: skillBook.updatedAt.toISOString(),
    })),
    myListings: myListings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    })),
    marketListings: marketListings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
      alreadyPurchased: purchasedListingIds.has(listing.id),
      canPurchase: !purchasedListingIds.has(listing.id),
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

  const ownedSkillBook = await prisma.skillBook.findFirst({
    where: {
      id: parsed.data.skillBookId,
      ownerId: session.user.id,
      visibility: SkillBookVisibility.STORE,
      status: SkillBookStatus.READY,
    },
    select: {
      id: true,
      title: true,
      description: true,
      locale: true,
      visibility: true,
      status: true,
    },
  });
  if (!ownedSkillBook) {
    return notFoundOrNoAccessResponse();
  }

  const existing = await prisma.skillBookListing.findUnique({
    where: { skillBookId: ownedSkillBook.id },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ ok: false, error: "listing_already_exists" }, { status: 409 });
  }

  const created = await prisma.skillBookListing.create({
    data: {
      skillBookId: ownedSkillBook.id,
      sellerId: session.user.id,
      priceCredits: parsed.data.priceCredits,
      isActive: parsed.data.isActive ?? true,
    },
    select: {
      id: true,
      skillBookId: true,
      sellerId: true,
      priceCredits: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      skillBook: {
        select: {
          id: true,
          title: true,
          description: true,
          locale: true,
          visibility: true,
          status: true,
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
