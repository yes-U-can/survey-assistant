import { NextResponse } from "next/server";

import { buildParticipantScope } from "@/lib/participant-admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

function parseLimit(raw: string | null) {
  const fallback = 200;
  if (!raw) {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    return fallback;
  }
  return Math.max(1, Math.min(500, value));
}

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams.get("limit"));
  const where = buildParticipantScope(session.user.id, session.user.role);

  const participants = await prisma.user.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit,
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

  const participantIds = participants.map((item) => item.id);
  const lastResponses = participantIds.length
    ? await prisma.response.groupBy({
        by: ["participantId"],
        where: { participantId: { in: participantIds } },
        _max: { submittedAt: true },
      })
    : [];
  const lastResponseMap = new Map(
    lastResponses.map((row) => [row.participantId, row._max.submittedAt?.toISOString() ?? null]),
  );

  return NextResponse.json({
    ok: true,
    participants: participants.map((item) => ({
      id: item.id,
      loginId: item.loginId,
      displayName: item.displayName,
      locale: item.locale,
      isActive: item.isActive,
      isAnonymized: item.loginId === null,
      enrollmentCount: item._count.enrollments,
      responseCount: item._count.responses,
      lastRespondedAt: lastResponseMap.get(item.id) ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  });
}
