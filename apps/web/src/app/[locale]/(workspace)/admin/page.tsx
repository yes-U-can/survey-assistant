import { TemplateType, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/LogoutButton";

import { AdminDashboardClient } from "./AdminDashboardClient";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ view?: string }>;
};

type AdminViewParam =
  | "overview"
  | "templates"
  | "packages"
  | "results"
  | "special_store"
  | "participants";

const allowedAdminViews: ReadonlySet<AdminViewParam> = new Set([
  "overview",
  "templates",
  "packages",
  "results",
  "special_store",
  "participants",
] as const);

function normalizeAdminView(value: string | undefined): AdminViewParam {
  if (!value) {
    return "overview";
  }
  return allowedAdminViews.has(value as AdminViewParam) ? (value as AdminViewParam) : "overview";
}

export default async function AdminHomePage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialView = normalizeAdminView(resolvedSearchParams.view);
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(
      `/${locale}/auth/admin?callbackUrl=${encodeURIComponent(`/${locale}/admin`)}`,
    );
  }

  if (
    session.user.role !== UserRole.RESEARCH_ADMIN &&
    session.user.role !== UserRole.PLATFORM_ADMIN
  ) {
    return (
      <main className="sa-page">
        <h1>{locale === "ko" ? "?묎렐 沅뚰븳 ?놁쓬" : "Access Denied"}</h1>
        <p>
          {locale === "ko"
            ? "愿由ъ옄 ?먮뒗 ?뚮옯???대뱶誘?怨꾩젙?쇰줈 濡쒓렇?명빐???⑸땲??"
            : "You need a research admin or platform admin account."}
        </p>
        <p style={{ marginTop: 12 }}>
          <Link href={`/${locale}/auth/admin`}>
            {locale === "ko" ? "愿由ъ옄 濡쒓렇?몄쑝濡??대룞" : "Go to admin sign-in"}
          </Link>
        </p>
      </main>
    );
  }

  const participantScope =
    session.user.role === UserRole.PLATFORM_ADMIN
      ? { role: UserRole.PARTICIPANT }
      : {
          role: UserRole.PARTICIPANT,
          OR: [
            {
              enrollments: {
                some: {
                  surveyPackage: {
                    ownerId: session.user.id,
                  },
                },
              },
            },
            {
              responses: {
                some: {
                  surveyPackage: {
                    ownerId: session.user.id,
                  },
                },
              },
            },
          ],
        };

  const [
    templates,
    packages,
    specialRequests,
    migrationJobs,
    ownedSpecialTemplates,
    myListings,
    marketListings,
    purchases,
    sales,
    participantAccounts,
  ] =
    await Promise.all([
    prisma.template.findMany({
      where: {
        ownerId: session.user.id,
        isArchived: false,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        type: true,
        visibility: true,
        title: true,
        description: true,
        version: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.surveyPackage.findMany({
      where: { ownerId: session.user.id },
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
    }),
    prisma.specialTemplateRequest.findMany({
      where: { requesterId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
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
      },
    }),
    prisma.migrationJob.findMany({
      where: { requesterId: session.user.id },
      orderBy: { requestedAt: "desc" },
      take: 50,
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
    }),
    prisma.template.findMany({
      where: {
        ownerId: session.user.id,
        type: TemplateType.SPECIAL,
        isArchived: false,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        version: true,
        updatedAt: true,
      },
    }),
    prisma.templateStoreListing.findMany({
      where: { sellerId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        templateId: true,
        sellerId: true,
        priceCredits: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        template: {
          select: {
            id: true,
            title: true,
            description: true,
            version: true,
            isArchived: true,
          },
        },
      },
    }),
    prisma.templateStoreListing.findMany({
      where: {
        isActive: true,
        sellerId: { not: session.user.id },
        template: {
          type: TemplateType.SPECIAL,
          isArchived: false,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
      select: {
        id: true,
        templateId: true,
        sellerId: true,
        priceCredits: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
            description: true,
            version: true,
            isArchived: true,
          },
        },
      },
    }),
    prisma.templatePurchase.findMany({
      where: { buyerId: session.user.id },
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
        listing: {
          select: {
            id: true,
            priceCredits: true,
            template: {
              select: {
                id: true,
                title: true,
                version: true,
              },
            },
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
      },
    }),
    prisma.templatePurchase.findMany({
      where: { sellerId: session.user.id },
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
        listing: {
          select: {
            id: true,
            priceCredits: true,
            template: {
              select: {
                id: true,
                title: true,
                version: true,
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            loginId: true,
            displayName: true,
            role: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: participantScope,
      take: 200,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        loginId: true,
        displayName: true,
        locale: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrollments: true,
            responses: true,
          },
        },
      },
    }),
  ]);

  const participantIds = participantAccounts.map((item) => item.id);
  const participantResponseMax = participantIds.length
    ? await prisma.response.groupBy({
        by: ["participantId"],
        where: {
          participantId: { in: participantIds },
        },
        _max: {
          submittedAt: true,
        },
      })
    : [];
  const participantResponseMap = new Map(
    participantResponseMax.map((row) => [
      row.participantId,
      row._max.submittedAt?.toISOString() ?? null,
    ]),
  );

  const initialPackages = packages.map((pkg) => ({
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
  }));

  const initialTemplates = templates.map((tpl) => ({
    ...tpl,
    createdAt: tpl.createdAt.toISOString(),
    updatedAt: tpl.updatedAt.toISOString(),
  }));

  const purchasedListingIdSet = new Set(purchases.map((item) => item.listingId));

  const initialSpecialRequests = specialRequests.map((item) => ({
    ...item,
    consentAt: item.consentAt.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const initialMigrationJobs = migrationJobs.map((item) => ({
    ...item,
    requestedAt: item.requestedAt.toISOString(),
    completedAt: item.completedAt?.toISOString() ?? null,
  }));

  const initialOwnedSpecialTemplates = ownedSpecialTemplates.map((tpl) => ({
    ...tpl,
    updatedAt: tpl.updatedAt.toISOString(),
  }));

  const initialMyListings = myListings.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const initialMarketListings = marketListings.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    alreadyPurchased: purchasedListingIdSet.has(item.id),
    canPurchase: !purchasedListingIdSet.has(item.id) && item.isActive && !item.template.isArchived,
  }));

  const initialPurchases = purchases.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  const initialSales = sales.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  const initialParticipants = participantAccounts.map((item) => ({
    id: item.id,
    loginId: item.loginId,
    displayName: item.displayName,
    locale: item.locale,
    isActive: item.isActive,
    isAnonymized: item.loginId === null,
    enrollmentCount: item._count.enrollments,
    responseCount: item._count.responses,
    lastRespondedAt: participantResponseMap.get(item.id) ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  const mobileBlockedTitle =
    locale === "ko" ? "愿由ъ옄 湲곕뒫? PC ???꾩슜?낅땲??" : "Admin features are desktop-only.";
  const mobileBlockedBody =
    locale === "ko"
      ? "?쇨????붾㈃? 紐⑤컮??吏?먯씠 媛?ν븯吏留? 愿由ъ옄/?뚮옯???댁쁺 ?붾㈃? 蹂댁븞怨??댁쁺 ?덉젙?깆쓣 ?꾪빐 PC?먯꽌留??ъ슜?????덉뒿?덈떎."
      : "Participant screens support mobile, but admin/platform operations are restricted to desktop for security and operational stability.";
  const mobileBlockedLink = locale === "ko" ? "?덉쑝濡??대룞" : "Back to home";

  return (
    <>
      <div className="sa-desktop-only">
        <AdminDashboardClient
          locale={locale}
          viewerRole={session.user.role}
          initialView={initialView}
          initialTemplates={initialTemplates}
          initialPackages={initialPackages}
          initialSpecialRequests={initialSpecialRequests}
          initialMigrationJobs={initialMigrationJobs}
          initialOwnedSpecialTemplates={initialOwnedSpecialTemplates}
          initialMyListings={initialMyListings}
          initialMarketListings={initialMarketListings}
          initialPurchases={initialPurchases}
          initialSales={initialSales}
          initialParticipants={initialParticipants}
        />
        <footer className="sa-footer">
          <Link href={`/${locale}`}>{locale === "ko" ? "홈으로" : "Back to home"}</Link>
          <span className="sa-divider">|</span>
          {session.user.role === UserRole.PLATFORM_ADMIN ? (
            <>
              <Link href={`/${locale}/platform`}>
                {locale === "ko" ? "플랫폼 어드민 콘솔" : "Platform admin console"}
              </Link>
              <span className="sa-divider">|</span>
            </>
          ) : null}
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


