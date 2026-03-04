import { PackageStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/session-guard";

export async function GET() {
  const session = await requireParticipantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const enrollments = await prisma.participantPackage.findMany({
    where: { participantId: session.user.id },
    orderBy: { joinedAt: "desc" },
    include: {
      surveyPackage: {
        select: {
          id: true,
          code: true,
          title: true,
          mode: true,
          status: true,
          startsAt: true,
          endsAt: true,
          maxResponsesPerParticipant: true,
        },
      },
    },
  });

  const packages = enrollments.map((entry) => {
    const maxResponses = entry.surveyPackage.maxResponsesPerParticipant;
    const completed = entry.completedCount;
    const remaining = Math.max(maxResponses - completed, 0);
    const inActiveWindow =
      entry.surveyPackage.status === PackageStatus.ACTIVE &&
      (entry.surveyPackage.startsAt === null || entry.surveyPackage.startsAt <= now) &&
      (entry.surveyPackage.endsAt === null || entry.surveyPackage.endsAt >= now);

    return {
      enrollmentId: entry.id,
      packageId: entry.surveyPackage.id,
      code: entry.surveyPackage.code,
      title: entry.surveyPackage.title,
      mode: entry.surveyPackage.mode,
      status: entry.surveyPackage.status,
      joinedAt: entry.joinedAt.toISOString(),
      startsAt: entry.surveyPackage.startsAt?.toISOString() ?? null,
      endsAt: entry.surveyPackage.endsAt?.toISOString() ?? null,
      completedCount: completed,
      maxResponsesPerParticipant: maxResponses,
      remainingCount: remaining,
      lastRespondedAt: entry.lastRespondedAt?.toISOString() ?? null,
      canRespondNow: inActiveWindow && remaining > 0,
    };
  });

  return NextResponse.json({
    ok: true,
    packages,
    summary: {
      enrolledCount: packages.length,
      openCount: packages.filter((pkg) => pkg.canRespondNow).length,
    },
  });
}

