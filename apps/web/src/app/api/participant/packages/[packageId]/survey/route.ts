import { PackageStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/session-guard";

type RouteContext = {
  params: Promise<{ packageId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireParticipantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { packageId } = await context.params;
  if (!packageId) {
    return NextResponse.json({ ok: false, error: "missing_package_id" }, { status: 400 });
  }

  const enrollment = await prisma.participantPackage.findUnique({
    where: {
      packageId_participantId: {
        packageId,
        participantId: session.user.id,
      },
    },
    select: {
      id: true,
      completedCount: true,
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
          templates: {
            orderBy: { orderIndex: "asc" },
            select: {
              templateId: true,
              orderIndex: true,
              template: {
                select: {
                  id: true,
                  type: true,
                  title: true,
                  description: true,
                  version: true,
                  schemaJson: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    return NextResponse.json({ ok: false, error: "enrollment_not_found" }, { status: 404 });
  }

  const now = new Date();
  if (enrollment.surveyPackage.status !== PackageStatus.ACTIVE) {
    return NextResponse.json({ ok: false, error: "package_not_active" }, { status: 409 });
  }
  if (enrollment.surveyPackage.startsAt && enrollment.surveyPackage.startsAt > now) {
    return NextResponse.json({ ok: false, error: "package_not_started" }, { status: 409 });
  }
  if (enrollment.surveyPackage.endsAt && enrollment.surveyPackage.endsAt < now) {
    return NextResponse.json({ ok: false, error: "package_closed" }, { status: 409 });
  }
  if (enrollment.completedCount >= enrollment.surveyPackage.maxResponsesPerParticipant) {
    return NextResponse.json({ ok: false, error: "response_limit_reached" }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    survey: {
      packageId: enrollment.surveyPackage.id,
      code: enrollment.surveyPackage.code,
      title: enrollment.surveyPackage.title,
      mode: enrollment.surveyPackage.mode,
      nextAttemptNo: enrollment.completedCount + 1,
      templates: enrollment.surveyPackage.templates.map((item) => ({
        templateId: item.templateId,
        orderIndex: item.orderIndex,
        type: item.template.type,
        title: item.template.title,
        description: item.template.description,
        version: item.template.version,
        schemaJson: item.template.schemaJson,
      })),
    },
  });
}
