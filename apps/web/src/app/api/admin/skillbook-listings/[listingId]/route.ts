import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundOrNoAccessResponse } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const patchListingSchema = z
  .object({
    priceCredits: z.number().int().min(1).max(1_000_000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.priceCredits !== undefined || value.isActive !== undefined, {
    message: "at least one field is required",
  });

type RouteContext = {
  params: Promise<{ listingId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { listingId } = await context.params;
  if (!listingId) {
    return NextResponse.json({ ok: false, error: "missing_listing_id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const updated = await prisma.skillBookListing.updateMany({
    where: {
      id: listingId,
      sellerId: session.user.id,
    },
    data: {
      ...(parsed.data.priceCredits !== undefined ? { priceCredits: parsed.data.priceCredits } : {}),
      ...(parsed.data.isActive !== undefined ? { isActive: parsed.data.isActive } : {}),
    },
  });

  if (updated.count === 0) {
    return notFoundOrNoAccessResponse();
  }

  const listing = await prisma.skillBookListing.findUnique({
    where: { id: listingId },
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

  if (!listing) {
    return notFoundOrNoAccessResponse();
  }

  return NextResponse.json({
    ok: true,
    listing: {
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    },
  });
}
