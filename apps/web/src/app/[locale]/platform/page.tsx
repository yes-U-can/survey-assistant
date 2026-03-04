import { MigrationJobStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PlatformAdminClient } from "./PlatformAdminClient";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PlatformAdminPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(
      `/${locale}/auth/admin?callbackUrl=${encodeURIComponent(`/${locale}/platform`)}`,
    );
  }

  if (session.user.role !== UserRole.PLATFORM_ADMIN) {
    return (
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>{locale === "ko" ? "접근 권한 없음" : "Access Denied"}</h1>
        <p>
          {locale === "ko"
            ? "플랫폼 어드민 계정으로 로그인해야 합니다."
            : "You need a platform admin account."}
        </p>
      </main>
    );
  }

  const [userGroups, walletAgg, transactionCount, migrationGroups, wallets, transactions, jobs] =
    await Promise.all([
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
      prisma.creditWallet.findMany({
        take: 20,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          balance: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              role: true,
              loginId: true,
              displayName: true,
              isActive: true,
            },
          },
        },
      }),
      prisma.creditTransaction.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          amount: true,
          memo: true,
          referenceId: true,
          createdAt: true,
          wallet: {
            select: {
              user: {
                select: {
                  id: true,
                  role: true,
                  loginId: true,
                  displayName: true,
                },
              },
            },
          },
        },
      }),
      prisma.migrationJob.findMany({
        take: 50,
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

  const initialOverview = {
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
  };

  const initialWallets = wallets.map((wallet) => ({
    id: wallet.id,
    balance: wallet.balance,
    updatedAt: wallet.updatedAt.toISOString(),
    user: wallet.user,
  }));

  const initialTransactions = transactions.map((txn) => ({
    id: txn.id,
    type: txn.type,
    amount: txn.amount,
    memo: txn.memo,
    referenceId: txn.referenceId,
    createdAt: txn.createdAt.toISOString(),
    user: txn.wallet.user,
  }));

  const initialJobs = jobs.map((job) => ({
    ...job,
    requestedAt: job.requestedAt.toISOString(),
    completedAt: job.completedAt?.toISOString() ?? null,
  }));

  return (
    <>
      <PlatformAdminClient
        locale={locale}
        initialOverview={initialOverview}
        initialWallets={initialWallets}
        initialTransactions={initialTransactions}
        initialJobs={initialJobs}
      />
      <footer style={{ padding: "0 24px 24px", fontFamily: "sans-serif" }}>
        <Link href={`/${locale}`}>{locale === "ko" ? "홈으로" : "Back to home"}</Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link href={`/${locale}/admin`}>
          {locale === "ko" ? "관리자 콘솔" : "Admin console"}
        </Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link href="/api/auth/signout">{locale === "ko" ? "로그아웃" : "Sign out"}</Link>
      </footer>
    </>
  );
}
