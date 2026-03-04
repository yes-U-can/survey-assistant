import { SpecialTemplateRequestStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const createRequestSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(8000),
  consentPublicSource: z.literal(true),
});

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const requests = await prisma.specialTemplateRequest.findMany({
    where: { requesterId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      consentPublicSource: true,
      consentAt: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    requests: requests.map((item) => ({
      ...item,
      consentAt: item.consentAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const created = await prisma.specialTemplateRequest.create({
    data: {
      requesterId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      status: SpecialTemplateRequestStatus.REQUESTED,
      consentPublicSource: true,
      consentAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      consentPublicSource: true,
      consentAt: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      request: {
        ...created,
        consentAt: created.consentAt.toISOString(),
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
