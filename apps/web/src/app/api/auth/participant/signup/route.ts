import { Locale, Prisma, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

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
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  const { loginId, password, displayName, locale } = parsed.data;
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

    return NextResponse.json({ ok: true, userId: created.id }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { ok: false, error: "login_id_taken" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}

