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
      <main className="sa-page">
        <h1>{locale === "ko" ? "접근 권한 없음" : "Access Denied"}</h1>
        <p>
          {locale === "ko"
            ? "플랫폼 어드민 계정으로 로그인해야 합니다."
            : "You need a platform admin account."}
        </p>
      </main>
    );
  }

  const adminRoles: UserRole[] = [UserRole.RESEARCH_ADMIN, UserRole.PLATFORM_ADMIN];

  const [
    userGroups,
    walletAgg,
    transactionCount,
    migrationGroups,
    adminUsers,
    wallets,
    transactions,
    jobs,
    specialRequests,
    settlementAggregate,
    settlementPurchases,
    sellerSettlementGroups,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.creditWallet.aggregate({
      where: {
        user: {
          role: { in: adminRoles },
        },
      },
      _count: { _all: true },
      _sum: { balance: true },
    }),
    prisma.creditTransaction.count({
      where: {
        wallet: {
          user: {
            role: { in: adminRoles },
          },
        },
      },
    }),
    prisma.migrationJob.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: {
        role: { in: adminRoles },
        isActive: true,
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        loginId: true,
        displayName: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.creditWallet.findMany({
      where: {
        user: {
          role: { in: adminRoles },
        },
      },
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
      where: {
        wallet: {
          user: {
            role: { in: adminRoles },
          },
        },
      },
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
    prisma.specialTemplateRequest.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        consentPublicSource: true,
        consentAt: true,
        adminNote: true,
        createdAt: true,
        updatedAt: true,
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
    prisma.templatePurchase.aggregate({
      _count: { _all: true },
      _sum: {
        priceCredits: true,
        sellerCredit: true,
        platformFeeCredits: true,
      },
    }),
    prisma.templatePurchase.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        listingId: true,
        templateId: true,
        buyerId: true,
        sellerId: true,
        priceCredits: true,
        sellerCredit: true,
        platformFeeCredits: true,
        createdAt: true,
        buyer: {
          select: {
            id: true,
            loginId: true,
            displayName: true,
            role: true,
          },
        },
        seller: {
          select: {
            id: true,
            loginId: true,
            displayName: true,
            role: true,
          },
        },
        template: {
          select: {
            id: true,
            title: true,
            version: true,
          },
        },
      },
    }),
    prisma.templatePurchase.groupBy({
      by: ["sellerId"],
      _count: { _all: true },
      _sum: {
        sellerCredit: true,
        platformFeeCredits: true,
        priceCredits: true,
      },
      orderBy: {
        _sum: {
          sellerCredit: "desc",
        },
      },
      take: 20,
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

  const initialAdminUsers = adminUsers.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

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

  const sellerIds = sellerSettlementGroups.map((row) => row.sellerId);
  const sellers = await prisma.user.findMany({
    where: {
      id: { in: sellerIds },
    },
    select: {
      id: true,
      loginId: true,
      displayName: true,
      role: true,
    },
  });
  const sellerMap = new Map(sellers.map((seller) => [seller.id, seller]));

  const initialSpecialRequests = specialRequests.map((item) => ({
    ...item,
    consentAt: item.consentAt.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const initialSettlementSummary = {
    purchaseCount: settlementAggregate._count._all,
    totalPriceCredits: settlementAggregate._sum.priceCredits ?? 0,
    totalSellerCredits: settlementAggregate._sum.sellerCredit ?? 0,
    totalPlatformFeeCredits: settlementAggregate._sum.platformFeeCredits ?? 0,
  };

  const initialSettlementPurchases = settlementPurchases.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  const initialSellerSettlements = sellerSettlementGroups.map((row) => ({
    seller: sellerMap.get(row.sellerId) ?? {
      id: row.sellerId,
      loginId: null,
      displayName: null,
      role: "UNKNOWN",
    },
    salesCount: row._count._all,
    totalPriceCredits: row._sum.priceCredits ?? 0,
    totalSellerCredits: row._sum.sellerCredit ?? 0,
    totalPlatformFeeCredits: row._sum.platformFeeCredits ?? 0,
  }));

  return (
    <>
      <PlatformAdminClient
        locale={locale}
        initialOverview={initialOverview}
        initialAdminUsers={initialAdminUsers}
        initialWallets={initialWallets}
        initialTransactions={initialTransactions}
        initialJobs={initialJobs}
        initialSpecialRequests={initialSpecialRequests}
        initialSettlementSummary={initialSettlementSummary}
        initialSettlementPurchases={initialSettlementPurchases}
        initialSellerSettlements={initialSellerSettlements}
      />
      <footer className="sa-footer">
        <Link href={`/${locale}`}>{locale === "ko" ? "홈으로" : "Back to home"}</Link>
        <span className="sa-divider">|</span>
        <Link href={`/${locale}/admin`}>
          {locale === "ko" ? "관리자 콘솔" : "Admin console"}
        </Link>
        <span className="sa-divider">|</span>
        <Link href="/api/auth/signout">{locale === "ko" ? "로그아웃" : "Sign out"}</Link>
      </footer>
    </>
  );
}
