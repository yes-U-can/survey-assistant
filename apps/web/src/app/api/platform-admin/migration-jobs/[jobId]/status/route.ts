import { MigrationJobStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

const updateStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "ACCEPTED",
    "RUNNING",
    "COMPLETED",
    "FAILED",
    "CANCELED",
  ]),
  resultNote: z.string().trim().max(2000).optional(),
});

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { jobId } = await context.params;
  if (!jobId) {
    return NextResponse.json({ ok: false, error: "missing_job_id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const status =
    parsed.data.status === "REQUESTED"
      ? MigrationJobStatus.REQUESTED
      : parsed.data.status === "ACCEPTED"
        ? MigrationJobStatus.ACCEPTED
        : parsed.data.status === "RUNNING"
          ? MigrationJobStatus.RUNNING
          : parsed.data.status === "COMPLETED"
            ? MigrationJobStatus.COMPLETED
            : parsed.data.status === "FAILED"
              ? MigrationJobStatus.FAILED
              : MigrationJobStatus.CANCELED;

  const resultNote = parsed.data.resultNote?.trim() ? parsed.data.resultNote.trim() : null;
  const completedAt =
    status === MigrationJobStatus.COMPLETED ||
    status === MigrationJobStatus.FAILED ||
    status === MigrationJobStatus.CANCELED
      ? new Date()
      : null;

  const updated = await prisma.migrationJob.updateMany({
    where: { id: jobId },
    data: {
      status,
      resultNote,
      completedAt,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 });
  }

  const job = await prisma.migrationJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      resultNote: true,
      requestedAt: true,
      completedAt: true,
      sourceLabel: true,
      sourceFormat: true,
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

  if (!job) {
    return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    job: {
      ...job,
      requestedAt: job.requestedAt.toISOString(),
      completedAt: job.completedAt?.toISOString() ?? null,
    },
  });
}
