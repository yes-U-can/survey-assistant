import { MigrationJobStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

export async function GET() {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const [userGroups, walletAgg, transactionCount, migrationGroups] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.creditWallet.aggregate({
      _count: { _all: true },
      _sum: { balance: true },
    }),
    prisma.creditTransaction.count(),
    prisma.migrationJob.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  let participantCount = 0;
  let researchAdminCount = 0;
  let platformAdminCount = 0;
  for (const row of userGroups) {
    if (row.role === UserRole.PARTICIPANT) {
      participantCount = row._count._all;
      continue;
    }
    if (row.role === UserRole.RESEARCH_ADMIN) {
      researchAdminCount = row._count._all;
      continue;
    }
    if (row.role === UserRole.PLATFORM_ADMIN) {
      platformAdminCount = row._count._all;
    }
  }

  const migrationCounts: Record<MigrationJobStatus, number> = {
    REQUESTED: 0,
    ACCEPTED: 0,
    RUNNING: 0,
    COMPLETED: 0,
    FAILED: 0,
    CANCELED: 0,
  };
  for (const row of migrationGroups) {
    migrationCounts[row.status] = row._count._all;
  }

  return NextResponse.json({
    ok: true,
    overview: {
      users: {
        participantCount,
        researchAdminCount,
        platformAdminCount,
      },
      credits: {
        walletCount: walletAgg._count._all,
        totalBalance: walletAgg._sum.balance ?? 0,
        transactionCount,
      },
      migrationJobs: migrationCounts,
    },
  });
}
