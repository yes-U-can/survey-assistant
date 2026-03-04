import { PackageStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestIp, rateLimitedResponse } from "@/lib/rate-limit";
import { requireParticipantSession } from "@/lib/session-guard";

const enrollSchema = z.object({
  code: z.string().trim().min(4).max(64),
});

export async function POST(request: Request) {
  const session = await requireParticipantSession();
  if (!session) {
    writeAuditLog({
      action: "participant.enroll_package",
      result: "FAILURE",
      request,
      targetType: "survey_package",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "participant.enroll_package",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const ip = getRequestIp(request);
  const rateDecision = await consumeRateLimit({
    bucketKey: `participant:enroll:${ip}:${session.user.id}`,
    limit: 30,
    windowSec: 60,
  });
  if (!rateDecision.allowed) {
    writeAuditLog({
      action: "participant.enroll_package",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      statusCode: 429,
      errorCode: "rate_limited",
      detail: {
        retryAfterSec: rateDecision.retryAfterSec,
      },
    });
    return rateLimitedResponse(rateDecision.retryAfterSec);
  }

  const now = new Date();
  const requestedCode = parsed.data.code.trim();
  const surveyPackage = await prisma.surveyPackage.findFirst({
    where: {
      code: { equals: requestedCode, mode: "insensitive" },
    },
    select: {
      id: true,
      code: true,
      title: true,
      status: true,
      startsAt: true,
      endsAt: true,
    },
  });

  if (!surveyPackage) {
    writeAuditLog({
      action: "participant.enroll_package",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      statusCode: 404,
      errorCode: "package_not_found",
      detail: {
        code: requestedCode,
      },
    });
    return NextResponse.json({ ok: false, error: "package_not_found" }, { status: 404 });
  }

  if (surveyPackage.status !== PackageStatus.ACTIVE) {
    writeAuditLog({
      action: "participant.enroll_package",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: surveyPackage.id,
      statusCode: 409,
      errorCode: "package_not_active",
    });
    return NextResponse.json(
      { ok: false, error: "package_not_active" },
      { status: 409 },
    );
  }

  if (surveyPackage.startsAt && surveyPackage.startsAt > now) {
    writeAuditLog({
      action: "participant.enroll_package",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: surveyPackage.id,
      statusCode: 409,
      errorCode: "package_not_started",
    });
    return NextResponse.json({ ok: false, error: "package_not_started" }, { status: 409 });
  }

  if (surveyPackage.endsAt && surveyPackage.endsAt < now) {
    writeAuditLog({
      action: "participant.enroll_package",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: surveyPackage.id,
      statusCode: 409,
      errorCode: "package_closed",
    });
    return NextResponse.json({ ok: false, error: "package_closed" }, { status: 409 });
  }

  try {
    await prisma.participantPackage.create({
      data: {
        packageId: surveyPackage.id,
        participantId: session.user.id,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      writeAuditLog({
        action: "participant.enroll_package",
        result: "SUCCESS",
        request,
        actorId: session.user.id,
        actorRole: session.user.role,
        targetType: "survey_package",
        targetId: surveyPackage.id,
        statusCode: 200,
        detail: {
          alreadyEnrolled: true,
        },
      });
      return NextResponse.json({
        ok: true,
        alreadyEnrolled: true,
        package: {
          id: surveyPackage.id,
          code: surveyPackage.code,
          title: surveyPackage.title,
        },
      });
    }

    writeAuditLog({
      action: "participant.enroll_package",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "survey_package",
      targetId: surveyPackage.id,
      statusCode: 500,
      errorCode: "internal_error",
      severity: "ERROR",
    });
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }

  writeAuditLog({
    action: "participant.enroll_package",
    result: "SUCCESS",
    request,
    actorId: session.user.id,
    actorRole: session.user.role,
    targetType: "survey_package",
    targetId: surveyPackage.id,
    statusCode: 201,
    detail: {
      alreadyEnrolled: false,
    },
  });
  return NextResponse.json(
    {
      ok: true,
      alreadyEnrolled: false,
      package: {
        id: surveyPackage.id,
        code: surveyPackage.code,
        title: surveyPackage.title,
      },
    },
    { status: 201 },
  );
}
