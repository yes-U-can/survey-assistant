import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

export async function GET(request: Request) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200)
    : 50;

  const jobs = await prisma.migrationJob.findMany({
    take: limit,
    orderBy: { requestedAt: "desc" },
    select: {
      id: true,
      sourceLabel: true,
      sourceFormat: true,
      status: true,
      requestNote: true,
      resultNote: true,
      requestedAt: true,
      completedAt: true,
      requester: {
        select: {
          id: true,
          loginId: true,
          displayName: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    jobs: jobs.map((job) => ({
      ...job,
      requestedAt: job.requestedAt.toISOString(),
      completedAt: job.completedAt?.toISOString() ?? null,
    })),
  });
}
