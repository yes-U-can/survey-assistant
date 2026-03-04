import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundOrNoAccessResponse } from "@/lib/admin-scope";
import { canAdminManageParticipant } from "@/lib/participant-admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const patchSchema = z.object({
  action: z.enum(["ACTIVATE", "DEACTIVATE", "ANONYMIZE"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ participantId: string }> },
) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { participantId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const manageable = await canAdminManageParticipant(
    session.user.id,
    session.user.role,
    participantId,
  );
  if (!manageable) {
    return notFoundOrNoAccessResponse();
  }

  const action = parsed.data.action;
  const current = await prisma.user.findUnique({
    where: { id: participantId },
    select: {
      id: true,
      loginId: true,
      role: true,
    },
  });
  if (!current || current.role !== UserRole.PARTICIPANT) {
    return notFoundOrNoAccessResponse();
  }

  if (action === "ANONYMIZE" && current.loginId === null) {
    return NextResponse.json({ ok: false, error: "already_anonymized" }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: participantId },
    data:
      action === "ANONYMIZE"
        ? {
            isActive: false,
            disabledReason: "anonymized",
            loginId: null,
            passwordHash: null,
            displayName: null,
            email: null,
            googleSub: null,
          }
        : {
            isActive: action === "ACTIVATE",
            disabledReason: action === "ACTIVATE" ? null : "deactivated_by_admin",
          },
    select: {
      id: true,
      loginId: true,
      displayName: true,
      locale: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          enrollments: true,
          responses: true,
        },
      },
    },
  });

  const lastResponse = await prisma.response.aggregate({
    where: { participantId },
    _max: {
      submittedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    participant: {
      id: updated.id,
      loginId: updated.loginId,
      displayName: updated.displayName,
      locale: updated.locale,
      isActive: updated.isActive,
      isAnonymized: updated.loginId === null,
      enrollmentCount: updated._count.enrollments,
      responseCount: updated._count.responses,
      lastRespondedAt: lastResponse._max.submittedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
