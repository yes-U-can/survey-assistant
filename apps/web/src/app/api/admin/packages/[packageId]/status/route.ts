import { PackageStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundOrNoAccessResponse, withOwnerScope } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

const patchSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"]),
});

type Params = {
  params: Promise<{ packageId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { packageId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const target = await prisma.surveyPackage.findFirst({
    where: withOwnerScope(session.user.id, { id: packageId }),
    select: { id: true },
  });

  if (!target) {
    return notFoundOrNoAccessResponse();
  }

  const updated = await prisma.surveyPackage.update({
    where: { id: packageId },
    data: {
      status:
        parsed.data.status === "ACTIVE"
          ? PackageStatus.ACTIVE
          : parsed.data.status === "CLOSED"
            ? PackageStatus.CLOSED
            : parsed.data.status === "ARCHIVED"
              ? PackageStatus.ARCHIVED
              : PackageStatus.DRAFT,
    },
    select: {
      id: true,
      code: true,
      status: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    ok: true,
    package: {
      ...updated,
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
