import { PackageStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireParticipantSession } from "@/lib/session-guard";

const enrollSchema = z.object({
  code: z.string().trim().min(4).max(64),
});

export async function POST(request: Request) {
  const session = await requireParticipantSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
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
    return NextResponse.json({ ok: false, error: "package_not_found" }, { status: 404 });
  }

  if (surveyPackage.status !== PackageStatus.ACTIVE) {
    return NextResponse.json(
      { ok: false, error: "package_not_active" },
      { status: 409 },
    );
  }

  if (surveyPackage.startsAt && surveyPackage.startsAt > now) {
    return NextResponse.json({ ok: false, error: "package_not_started" }, { status: 409 });
  }

  if (surveyPackage.endsAt && surveyPackage.endsAt < now) {
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

    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }

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

