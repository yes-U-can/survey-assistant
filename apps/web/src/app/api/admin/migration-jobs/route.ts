import { MigrationJobStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { withRequesterScope } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestIp, rateLimitedResponse } from "@/lib/rate-limit";
import { requireAdminSession } from "@/lib/session-guard";

const createMigrationJobSchema = z.object({
  sourceLabel: z.string().trim().min(1).max(160),
  sourceFormat: z.string().trim().min(1).max(80),
  requestNote: z.string().trim().max(4000).optional(),
});

export async function GET(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200)
    : 50;

  const jobs = await prisma.migrationJob.findMany({
    where: withRequesterScope(session.user.id),
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

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    writeAuditLog({
      action: "admin.migration_job.create",
      result: "FAILURE",
      request,
      targetType: "migration_job",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const ip = getRequestIp(request);
  const rateDecision = await consumeRateLimit({
    bucketKey: `admin:migration-job:${ip}:${session.user.id}`,
    limit: 10,
    windowSec: 600,
  });
  if (!rateDecision.allowed) {
    writeAuditLog({
      action: "admin.migration_job.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "migration_job",
      statusCode: 429,
      errorCode: "rate_limited",
      detail: {
        retryAfterSec: rateDecision.retryAfterSec,
      },
    });
    return rateLimitedResponse(rateDecision.retryAfterSec);
  }

  const body = await request.json().catch(() => null);
  const parsed = createMigrationJobSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "admin.migration_job.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "migration_job",
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const created = await prisma.migrationJob.create({
    data: {
      requesterId: session.user.id,
      sourceLabel: parsed.data.sourceLabel,
      sourceFormat: parsed.data.sourceFormat,
      requestNote: parsed.data.requestNote?.trim() || null,
      status: MigrationJobStatus.REQUESTED,
    },
    select: {
      id: true,
      sourceLabel: true,
      sourceFormat: true,
      status: true,
      requestNote: true,
      resultNote: true,
      requestedAt: true,
      completedAt: true,
    },
  });

  writeAuditLog({
    action: "admin.migration_job.create",
    result: "SUCCESS",
    request,
    actorId: session.user.id,
    actorRole: session.user.role,
    targetType: "migration_job",
    targetId: created.id,
    statusCode: 201,
    detail: {
      sourceFormat: created.sourceFormat,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      job: {
        ...created,
        requestedAt: created.requestedAt.toISOString(),
        completedAt: created.completedAt?.toISOString() ?? null,
      },
    },
    { status: 201 },
  );
}
