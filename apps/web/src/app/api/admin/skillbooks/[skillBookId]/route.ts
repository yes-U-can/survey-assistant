import { SkillBookStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundOrNoAccessResponse } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";
import {
  normalizeLocale,
  normalizeSkillBookSources,
  normalizeSkillBookStatus,
  normalizeSkillBookVisibility,
} from "@/lib/skillbooks";

const sourceSchema = z.object({
  label: z.string().trim().max(120).optional().nullable(),
  content: z.string().trim().min(1).max(20_000),
});

const patchSkillBookSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    locale: z.enum(["ko", "en"]).optional(),
    visibility: z.enum(["PRIVATE", "INTERNAL", "STORE"]).optional(),
    status: z.enum(["DRAFT", "READY", "ARCHIVED"]).optional(),
    body: z.string().trim().min(1).max(50_000).optional(),
    sources: z.array(sourceSchema).max(20).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

type RouteContext = {
  params: Promise<{ skillBookId: string }>;
};

function toResponse(skillBook: {
  id: string;
  title: string;
  description: string | null;
  locale: string;
  visibility: string;
  status: string;
  body: string;
  compiledPrompt: string | null;
  createdAt: Date;
  updatedAt: Date;
  sources: Array<{ id: string; label: string | null; content: string; orderIndex: number; createdAt: Date; updatedAt: Date }>;
  listing?: { id: string; priceCredits: number; isActive: boolean; createdAt: Date; updatedAt: Date } | null;
}) {
  return {
    ...skillBook,
    createdAt: skillBook.createdAt.toISOString(),
    updatedAt: skillBook.updatedAt.toISOString(),
    sources: skillBook.sources.map((source) => ({
      ...source,
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.updatedAt.toISOString(),
    })),
    listing: skillBook.listing
      ? {
          ...skillBook.listing,
          createdAt: skillBook.listing.createdAt.toISOString(),
          updatedAt: skillBook.listing.updatedAt.toISOString(),
        }
      : null,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { skillBookId } = await context.params;
  if (!skillBookId) {
    return NextResponse.json({ ok: false, error: "missing_skillbook_id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSkillBookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const existing = await prisma.skillBook.findFirst({
    where: { id: skillBookId, ownerId: session.user.id },
    select: { id: true, status: true },
  });
  if (!existing) {
    return notFoundOrNoAccessResponse();
  }

  const contentChanged =
    parsed.data.title !== undefined ||
    parsed.data.description !== undefined ||
    parsed.data.locale !== undefined ||
    parsed.data.body !== undefined ||
    parsed.data.sources !== undefined;

  const updateData = {
    ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
    ...(parsed.data.description !== undefined ? { description: parsed.data.description ?? null } : {}),
    ...(parsed.data.locale !== undefined ? { locale: normalizeLocale(parsed.data.locale) } : {}),
    ...(parsed.data.visibility !== undefined
      ? { visibility: normalizeSkillBookVisibility(parsed.data.visibility) }
      : {}),
    ...(parsed.data.status !== undefined ? { status: normalizeSkillBookStatus(parsed.data.status) } : {}),
    ...(parsed.data.body !== undefined ? { body: parsed.data.body } : {}),
    ...(contentChanged ? { compiledPrompt: null } : {}),
    ...(contentChanged && parsed.data.status === undefined && existing.status === SkillBookStatus.READY
      ? { status: SkillBookStatus.DRAFT }
      : {}),
  };

  await prisma.$transaction(async (tx) => {
    await tx.skillBook.update({
      where: { id: skillBookId },
      data: updateData,
    });

    if (parsed.data.sources !== undefined) {
      await tx.skillBookSource.deleteMany({ where: { skillBookId } });
      const normalizedSources = normalizeSkillBookSources(parsed.data.sources);
      if (normalizedSources.length > 0) {
        await tx.skillBookSource.createMany({
          data: normalizedSources.map((source) => ({
            skillBookId,
            label: source.label,
            content: source.content,
            orderIndex: source.orderIndex,
          })),
        });
      }
    }
  });

  const updated = await prisma.skillBook.findUnique({
    where: { id: skillBookId },
    include: {
      sources: {
        orderBy: { orderIndex: "asc" },
      },
      listing: true,
    },
  });

  if (!updated) {
    return notFoundOrNoAccessResponse();
  }

  return NextResponse.json({ ok: true, skillBook: toResponse(updated) });
}
