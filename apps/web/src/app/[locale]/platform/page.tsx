import { MigrationJobStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/LogoutButton";

import { PlatformAdminClient } from "./PlatformAdminClient";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ locale: string }>;
};

function parseIntEnv(name: string, fallback: number, min: number, max: number) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const int = Math.trunc(parsed);
  return Math.max(min, Math.min(max, int));
}

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
        <h1>{locale === "ko" ? "?묎렐 沅뚰븳 ?놁쓬" : "Access Denied"}</h1>
        <p>
          {locale === "ko"
            ? "?뚮옯???대뱶誘?怨꾩젙?쇰줈 濡쒓렇?명빐???⑸땲??"
            : "You need a platform admin account."}
        </p>
        <p style={{ marginTop: 12 }}>
          <Link href={`/${locale}/auth/admin`}>
            {locale === "ko" ? "愿由ъ옄 濡쒓렇?몄쑝濡??대룞" : "Go to admin sign-in"}
          </Link>
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
    adminInvites,
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
    prisma.adminInvite.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        note: true,
        expiresAt: true,
        acceptedAt: true,
        revokedAt: true,
        createdAt: true,
        updatedAt: true,
        invitedBy: {
          select: {
            id: true,
            role: true,
            email: true,
            displayName: true,
          },
        },
        acceptedBy: {
          select: {
            id: true,
            role: true,
            email: true,
            displayName: true,
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

  const initialAdminInvites = adminInvites.map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role === UserRole.PLATFORM_ADMIN ? "PLATFORM_ADMIN" : "RESEARCH_ADMIN",
    status:
      invite.status === "ACCEPTED"
        ? "ACCEPTED"
        : invite.status === "REVOKED"
          ? "REVOKED"
          : invite.status === "EXPIRED"
            ? "EXPIRED"
            : "PENDING",
    note: invite.note,
    expiresAt: invite.expiresAt.toISOString(),
    acceptedAt: invite.acceptedAt?.toISOString() ?? null,
    revokedAt: invite.revokedAt?.toISOString() ?? null,
    createdAt: invite.createdAt.toISOString(),
    updatedAt: invite.updatedAt.toISOString(),
    invitedBy: invite.invitedBy,
    acceptedBy: invite.acceptedBy,
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

  const initialAlertThresholds = {
    minTotalCredits: parseIntEnv("PLATFORM_ALERT_MIN_TOTAL_CREDITS", 500, 0, 100_000_000),
    maxOpenSpecialRequests: parseIntEnv("PLATFORM_ALERT_MAX_OPEN_SPECIAL_REQUESTS", 12, 0, 10_000),
    maxRunningMigrations: parseIntEnv("PLATFORM_ALERT_MAX_RUNNING_MIGRATIONS", 5, 0, 10_000),
    maxFailedMigrations: parseIntEnv("PLATFORM_ALERT_MAX_FAILED_MIGRATIONS", 3, 0, 10_000),
    staleSpecialRequestDays: parseIntEnv("PLATFORM_ALERT_STALE_SPECIAL_REQUEST_DAYS", 14, 1, 3650),
    maxStaleSpecialRequests: parseIntEnv("PLATFORM_ALERT_MAX_STALE_SPECIAL_REQUESTS", 0, 0, 10_000),
  };

  const mobileBlockedTitle =
    locale === "ko" ? "?뚮옯???대뱶誘?湲곕뒫? PC ?꾩슜?낅땲??" : "Platform admin is desktop-only.";
  const mobileBlockedBody =
    locale === "ko"
      ? "?댁쁺/?뺤궛/留덉씠洹몃젅?댁뀡 愿由?湲곕뒫? 紐⑤컮?쇱뿉???쒓났?섏? ?딆뒿?덈떎. PC 釉뚮씪?곗??먯꽌 ?묒냽??二쇱꽭??"
      : "Operations, settlements, and migration controls are not available on mobile. Please use a desktop browser.";
  const mobileBlockedLink = locale === "ko" ? "?덉쑝濡??대룞" : "Back to home";

  return (
    <>
      <div className="sa-desktop-only">
        <PlatformAdminClient
          locale={locale}
          initialOverview={initialOverview}
          initialAdminUsers={initialAdminUsers}
          initialWallets={initialWallets}
          initialTransactions={initialTransactions}
          initialJobs={initialJobs}
          initialSpecialRequests={initialSpecialRequests}
          initialAdminInvites={initialAdminInvites}
          initialSettlementSummary={initialSettlementSummary}
          initialSettlementPurchases={initialSettlementPurchases}
          initialSellerSettlements={initialSellerSettlements}
          initialAlertThresholds={initialAlertThresholds}
        />
                <footer className="sa-footer">
          <Link href={`/${locale}`}>{locale === "ko" ? "홈으로" : "Back to home"}</Link>
          <span className="sa-divider">|</span>
          <Link href={`/${locale}/admin`}>
            {locale === "ko" ? "관리자 콘솔" : "Admin console"}
          </Link>
          <span className="sa-divider">|</span>
          <LogoutButton locale={locale} className="sa-link-button" />
        </footer>
      </div>

      <main className="sa-page sa-mobile-policy-block">
        <section className="sa-mobile-policy-card">
          <h1>{mobileBlockedTitle}</h1>
          <p>{mobileBlockedBody}</p>
          <p style={{ marginTop: 12 }}>
            <Link href={`/${locale}`}>{mobileBlockedLink}</Link>
          </p>
        </section>
      </main>
    </>
  );
}

