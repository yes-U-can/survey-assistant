import { Prisma, TemplateType, TemplateVisibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const createTemplateSchema = z.object({
  type: z.enum(["LIKERT", "SPECIAL"]).default("LIKERT"),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  visibility: z.enum(["PRIVATE", "STORE"]).default("PRIVATE"),
  schemaJson: z.record(z.string(), z.unknown()),
});

function isInputJsonValue(value: unknown): value is Prisma.InputJsonValue {
  if (value === null) {
    return true;
  }

  const valueType = typeof value;
  if (valueType === "string" || valueType === "number" || valueType === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isInputJsonValue(item));
  }

  if (valueType === "object") {
    return Object.values(value as Record<string, unknown>).every((item) =>
      isInputJsonValue(item),
    );
  }

  return false;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const templates = await prisma.template.findMany({
    where: {
      ownerId: session.user.id,
      isArchived: false,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      type: true,
      visibility: true,
      title: true,
      description: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    templates: templates.map((tpl) => ({
      ...tpl,
      createdAt: tpl.createdAt.toISOString(),
      updatedAt: tpl.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  if (!isInputJsonValue(parsed.data.schemaJson)) {
    return NextResponse.json({ ok: false, error: "invalid_schema_json" }, { status: 400 });
  }

  const created = await prisma.template.create({
    data: {
      ownerId: session.user.id,
      type: parsed.data.type === "SPECIAL" ? TemplateType.SPECIAL : TemplateType.LIKERT,
      visibility:
        parsed.data.visibility === "STORE"
          ? TemplateVisibility.STORE
          : TemplateVisibility.PRIVATE,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      schemaJson: parsed.data.schemaJson,
    },
    select: {
      id: true,
      type: true,
      visibility: true,
      title: true,
      description: true,
      version: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      template: {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
