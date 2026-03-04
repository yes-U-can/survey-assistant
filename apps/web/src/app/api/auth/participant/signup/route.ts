import { Locale, Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestIp, rateLimitedResponse } from "@/lib/rate-limit";

const signupSchema = z.object({
  loginId: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[A-Za-z0-9._-]+$/),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(1).max(80).optional(),
  locale: z.enum(["ko", "en"]).default("ko"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    writeAuditLog({
      action: "participant.signup",
      result: "FAILURE",
      request,
      targetType: "user",
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  const { loginId, password, displayName, locale } = parsed.data;
  const ip = getRequestIp(request);
  const rateDecision = await consumeRateLimit({
    bucketKey: `auth:participant-signup:${ip}:${loginId.toLowerCase()}`,
    limit: 10,
    windowSec: 60,
  });
  if (!rateDecision.allowed) {
    writeAuditLog({
      action: "participant.signup",
      result: "FAILURE",
      request,
      targetType: "user",
      statusCode: 429,
      errorCode: "rate_limited",
      detail: {
        retryAfterSec: rateDecision.retryAfterSec,
      },
    });
    return rateLimitedResponse(rateDecision.retryAfterSec);
  }

  const passwordHash = await hash(password, 12);

  try {
    const created = await prisma.user.create({
      data: {
        role: UserRole.PARTICIPANT,
        loginId,
        passwordHash,
        displayName: displayName ?? null,
        locale: locale === "en" ? Locale.en : Locale.ko,
        isActive: true,
      },
      select: { id: true },
    });

    writeAuditLog({
      action: "participant.signup",
      result: "SUCCESS",
      request,
      actorId: created.id,
      actorRole: UserRole.PARTICIPANT,
      targetType: "user",
      targetId: created.id,
      statusCode: 201,
      detail: {
        locale,
      },
    });
    return NextResponse.json({ ok: true, userId: created.id }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      writeAuditLog({
        action: "participant.signup",
        result: "FAILURE",
        request,
        targetType: "user",
        statusCode: 409,
        errorCode: "login_id_taken",
      });
      return NextResponse.json(
        { ok: false, error: "login_id_taken" },
        { status: 409 },
      );
    }

    writeAuditLog({
      action: "participant.signup",
      result: "FAILURE",
      request,
      targetType: "user",
      statusCode: 500,
      errorCode: "internal_error",
      severity: "ERROR",
    });
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
