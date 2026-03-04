import { SpecialTemplateRequestStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

const updateStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "REVIEWING",
    "IN_PROGRESS",
    "DELIVERED",
    "REJECTED",
    "CANCELED",
  ]),
  adminNote: z.string().trim().max(3000).optional(),
});

type RouteContext = {
  params: Promise<{ requestId: string }>;
};

function mapStatus(input: z.infer<typeof updateStatusSchema>["status"]) {
  if (input === "REQUESTED") return SpecialTemplateRequestStatus.REQUESTED;
  if (input === "REVIEWING") return SpecialTemplateRequestStatus.REVIEWING;
  if (input === "IN_PROGRESS") return SpecialTemplateRequestStatus.IN_PROGRESS;
  if (input === "DELIVERED") return SpecialTemplateRequestStatus.DELIVERED;
  if (input === "REJECTED") return SpecialTemplateRequestStatus.REJECTED;
  return SpecialTemplateRequestStatus.CANCELED;
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { requestId } = await context.params;
  if (!requestId) {
    return NextResponse.json({ ok: false, error: "missing_request_id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const updated = await prisma.specialTemplateRequest.updateMany({
    where: { id: requestId },
    data: {
      status: mapStatus(parsed.data.status),
      adminNote: parsed.data.adminNote?.trim() ? parsed.data.adminNote.trim() : null,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ ok: false, error: "request_not_found" }, { status: 404 });
  }

  const row = await prisma.specialTemplateRequest.findUnique({
    where: { id: requestId },
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
      requester: {
        select: {
          id: true,
          loginId: true,
          displayName: true,
          role: true,
        },
      },
    },
  });

  if (!row) {
    return NextResponse.json({ ok: false, error: "request_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    request: {
      ...row,
      consentAt: row.consentAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    },
  });
}
