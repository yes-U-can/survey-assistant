import { Locale, SkillBookStatus, SkillBookVisibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

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

const createSkillBookSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  locale: z.enum(["ko", "en"]).optional(),
  visibility: z.enum(["PRIVATE", "INTERNAL", "STORE"]).optional(),
  status: z.enum(["DRAFT", "READY", "ARCHIVED"]).optional(),
  body: z.string().trim().min(1).max(50_000),
  sources: z.array(sourceSchema).max(20).optional(),
});

function toResponse(skillBook: {
  id: string;
  title: string;
  description: string | null;
  locale: Locale;
  visibility: SkillBookVisibility;
  status: SkillBookStatus;
  body: string;
  compiledPrompt: string | null;
  createdAt: Date;
  updatedAt: Date;
  sources: Array<{ id: string; label: string | null; content: string; orderIndex: number; createdAt: Date; updatedAt: Date }>;
  listing?: { id: string; priceCredits: number; isActive: boolean; createdAt: Date; updatedAt: Date } | null;
}) {
  return {
    id: skillBook.id,
    title: skillBook.title,
    description: skillBook.description,
    locale: skillBook.locale,
    visibility: skillBook.visibility,
    status: skillBook.status,
    body: skillBook.body,
    compiledPrompt: skillBook.compiledPrompt,
    createdAt: skillBook.createdAt.toISOString(),
    updatedAt: skillBook.updatedAt.toISOString(),
    sources: skillBook.sources.map((source) => ({
      id: source.id,
      label: source.label,
      content: source.content,
      orderIndex: source.orderIndex,
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

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const skillBooks = await prisma.skillBook.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      sources: {
        orderBy: { orderIndex: "asc" },
      },
      listing: true,
    },
  });

  return NextResponse.json({
    ok: true,
    skillBooks: skillBooks.map((skillBook) => toResponse(skillBook)),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSkillBookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const normalizedSources = normalizeSkillBookSources(parsed.data.sources);
  const created = await prisma.skillBook.create({
    data: {
      ownerId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      locale: normalizeLocale(parsed.data.locale),
      visibility: normalizeSkillBookVisibility(parsed.data.visibility),
      status: normalizeSkillBookStatus(parsed.data.status),
      body: parsed.data.body,
      compiledPrompt: null,
      sources: normalizedSources.length
        ? {
            create: normalizedSources,
          }
        : undefined,
    },
    include: {
      sources: {
        orderBy: { orderIndex: "asc" },
      },
      listing: true,
    },
  });

  return NextResponse.json({ ok: true, skillBook: toResponse(created) }, { status: 201 });
}
