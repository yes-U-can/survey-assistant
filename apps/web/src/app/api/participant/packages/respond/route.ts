import { PackageStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/session-guard";

const submitSchema = z.object({
  packageId: z.string().trim().min(1),
  responses: z
    .array(
      z.object({
        templateId: z.string().trim().min(1),
        responseJson: z.unknown(),
      }),
    )
    .min(1),
});

class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

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

function assertRespondableWindow(args: {
  status: PackageStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  now: Date;
}) {
  if (args.status !== PackageStatus.ACTIVE) {
    throw new ApiError(409, "package_not_active");
  }
  if (args.startsAt && args.startsAt > args.now) {
    throw new ApiError(409, "package_not_started");
  }
  if (args.endsAt && args.endsAt < args.now) {
    throw new ApiError(409, "package_closed");
  }
}

export async function POST(request: Request) {
  const session = await requireParticipantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const { packageId, responses } = parsed.data;
  const now = new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.participantPackage.findUnique({
        where: {
          packageId_participantId: {
            packageId,
            participantId: session.user.id,
          },
        },
        include: {
          surveyPackage: {
            select: {
              id: true,
              status: true,
              startsAt: true,
              endsAt: true,
              maxResponsesPerParticipant: true,
            },
          },
        },
      });

      if (!enrollment) {
        throw new ApiError(404, "enrollment_not_found");
      }

      assertRespondableWindow({
        status: enrollment.surveyPackage.status,
        startsAt: enrollment.surveyPackage.startsAt,
        endsAt: enrollment.surveyPackage.endsAt,
        now,
      });

      if (enrollment.completedCount >= enrollment.surveyPackage.maxResponsesPerParticipant) {
        throw new ApiError(409, "response_limit_reached");
      }

      const packageTemplates = await tx.packageTemplate.findMany({
        where: { packageId },
        select: { templateId: true },
      });

      if (packageTemplates.length === 0) {
        throw new ApiError(409, "package_has_no_templates");
      }

      const allowedTemplateIds = new Set(packageTemplates.map((tpl) => tpl.templateId));
      const requestedTemplateIds = responses.map((item) => item.templateId);
      const uniqueRequested = new Set(requestedTemplateIds);

      if (uniqueRequested.size !== requestedTemplateIds.length) {
        throw new ApiError(400, "duplicate_template_id");
      }

      for (const templateId of requestedTemplateIds) {
        if (!allowedTemplateIds.has(templateId)) {
          throw new ApiError(400, "template_not_in_package");
        }
      }

      if (requestedTemplateIds.length !== allowedTemplateIds.size) {
        throw new ApiError(400, "incomplete_template_response");
      }

      const attemptNo = enrollment.completedCount + 1;
      const responseRows = responses.map((item) => {
        if (!isInputJsonValue(item.responseJson)) {
          throw new ApiError(400, "invalid_response_json");
        }

        return {
          packageId,
          templateId: item.templateId,
          participantId: session.user.id,
          attemptNo,
          responseJson: item.responseJson,
          submittedAt: now,
        };
      });

      await tx.response.createMany({
        data: responseRows,
      });

      const updated = await tx.participantPackage.update({
        where: { id: enrollment.id },
        data: {
          completedCount: { increment: 1 },
          lastRespondedAt: now,
        },
        select: {
          completedCount: true,
          lastRespondedAt: true,
          surveyPackage: {
            select: { maxResponsesPerParticipant: true },
          },
        },
      });

      return {
        attemptNo,
        completedCount: updated.completedCount,
        remainingCount: Math.max(
          updated.surveyPackage.maxResponsesPerParticipant - updated.completedCount,
          0,
        ),
        lastRespondedAt: updated.lastRespondedAt?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ ok: false, error: error.code }, { status: error.status });
    }

    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
