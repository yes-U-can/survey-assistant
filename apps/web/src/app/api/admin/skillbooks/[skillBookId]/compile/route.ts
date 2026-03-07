import { SkillBookStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { notFoundOrNoAccessResponse } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";
import { compileSkillBookPrompt } from "@/lib/skillbooks";

type RouteContext = {
  params: Promise<{ skillBookId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { skillBookId } = await context.params;
  if (!skillBookId) {
    return NextResponse.json({ ok: false, error: "missing_skillbook_id" }, { status: 400 });
  }

  const skillBook = await prisma.skillBook.findFirst({
    where: { id: skillBookId, ownerId: session.user.id },
    include: {
      sources: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!skillBook) {
    return notFoundOrNoAccessResponse();
  }
  if (skillBook.status === SkillBookStatus.ARCHIVED) {
    return NextResponse.json({ ok: false, error: "skillbook_archived" }, { status: 409 });
  }

  const compiledPrompt = compileSkillBookPrompt({
    title: skillBook.title,
    description: skillBook.description,
    body: skillBook.body,
    locale: skillBook.locale,
    sources: skillBook.sources,
  });

  const updated = await prisma.skillBook.update({
    where: { id: skillBookId },
    data: {
      compiledPrompt,
      status: SkillBookStatus.READY,
    },
    include: {
      sources: {
        orderBy: { orderIndex: "asc" },
      },
      listing: true,
    },
  });

  return NextResponse.json({
    ok: true,
    skillBook: {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      locale: updated.locale,
      visibility: updated.visibility,
      status: updated.status,
      body: updated.body,
      compiledPrompt: updated.compiledPrompt,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      sources: updated.sources.map((source) => ({
        id: source.id,
        label: source.label,
        content: source.content,
        orderIndex: source.orderIndex,
        createdAt: source.createdAt.toISOString(),
        updatedAt: source.updatedAt.toISOString(),
      })),
      listing: updated.listing
        ? {
            ...updated.listing,
            createdAt: updated.listing.createdAt.toISOString(),
            updatedAt: updated.listing.updatedAt.toISOString(),
          }
        : null,
    },
  });
}
