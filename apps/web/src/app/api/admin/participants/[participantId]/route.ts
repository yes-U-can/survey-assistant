import { NextResponse } from "next/server";
import { z } from "zod";

import { canAdminManageParticipant } from "@/lib/participant-admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const patchSchema = z.object({
  action: z.enum(["ACTIVATE", "DEACTIVATE"]),
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
    return NextResponse.json({ ok: false, error: "participant_not_found" }, { status: 404 });
  }

  const nextIsActive = parsed.data.action === "ACTIVATE";

  const updated = await prisma.user.update({
    where: { id: participantId },
    data: { isActive: nextIsActive },
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
      enrollmentCount: updated._count.enrollments,
      responseCount: updated._count.responses,
      lastRespondedAt: lastResponse._max.submittedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
