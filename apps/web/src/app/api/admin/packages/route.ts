import { PackageMode, PackageStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundOrNoAccessResponse, withOwnerScope } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const createPackageSchema = z
  .object({
    code: z.string().trim().min(4).max(64),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(2000).optional(),
    mode: z.enum(["CROSS_SECTIONAL", "LONGITUDINAL"]).default("CROSS_SECTIONAL"),
    maxResponsesPerParticipant: z.number().int().min(1).max(500).default(1),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
    templateIds: z.array(z.string().trim().min(1)).min(1),
  })
  .superRefine((value, ctx) => {
    if (value.startsAt && value.endsAt) {
      const s = new Date(value.startsAt).getTime();
      const e = new Date(value.endsAt).getTime();
      if (Number.isFinite(s) && Number.isFinite(e) && e <= s) {
        ctx.addIssue({
          code: "custom",
          message: "endsAt must be after startsAt",
          path: ["endsAt"],
        });
      }
    }
  });

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const packages = await prisma.surveyPackage.findMany({
    where: withOwnerScope(session.user.id),
    orderBy: { updatedAt: "desc" },
    include: {
      templates: {
        select: {
          templateId: true,
          orderIndex: true,
          template: {
            select: { title: true, type: true },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    packages: packages.map((pkg) => ({
      id: pkg.id,
      code: pkg.code,
      title: pkg.title,
      description: pkg.description,
      mode: pkg.mode,
      status: pkg.status,
      maxResponsesPerParticipant: pkg.maxResponsesPerParticipant,
      startsAt: pkg.startsAt?.toISOString() ?? null,
      endsAt: pkg.endsAt?.toISOString() ?? null,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
      templates: pkg.templates.map((item) => ({
        templateId: item.templateId,
        orderIndex: item.orderIndex,
        title: item.template.title,
        type: item.template.type,
      })),
    })),
  });
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const templateIds = [...new Set(parsed.data.templateIds)];
  const ownedTemplates = await prisma.template.findMany({
    where: withOwnerScope(session.user.id, {
      id: { in: templateIds },
      isArchived: false,
    }),
    select: { id: true },
  });

  if (ownedTemplates.length !== templateIds.length) {
    return notFoundOrNoAccessResponse();
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const surveyPackage = await tx.surveyPackage.create({
        data: {
          ownerId: session.user.id,
          code: parsed.data.code.trim(),
          title: parsed.data.title,
          description: parsed.data.description ?? null,
          mode:
            parsed.data.mode === "LONGITUDINAL"
              ? PackageMode.LONGITUDINAL
              : PackageMode.CROSS_SECTIONAL,
          status: PackageStatus.DRAFT,
          maxResponsesPerParticipant: parsed.data.maxResponsesPerParticipant,
          startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
          endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
        },
        select: {
          id: true,
          code: true,
          title: true,
          mode: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.packageTemplate.createMany({
        data: templateIds.map((templateId, index) => ({
          packageId: surveyPackage.id,
          templateId,
          orderIndex: index,
        })),
      });

      return surveyPackage;
    });

    return NextResponse.json(
      {
        ok: true,
        package: {
          ...created,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ ok: false, error: "code_already_exists" }, { status: 409 });
    }

    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
