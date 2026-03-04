import { TemplateType, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminDashboardClient } from "./AdminDashboardClient";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminHomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";
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
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>{locale === "ko" ? "접근 권한 없음" : "Access Denied"}</h1>
        <p>
          {locale === "ko"
            ? "관리자 또는 플랫폼 어드민 계정으로 로그인해야 합니다."
            : "You need a research admin or platform admin account."}
        </p>
      </main>
    );
  }

  const [templates, packages, specialRequests, ownedSpecialTemplates, myListings, marketListings, purchases, sales] =
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
  ]);

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

  return (
    <>
      <AdminDashboardClient
        locale={locale}
        initialTemplates={initialTemplates}
        initialPackages={initialPackages}
        initialSpecialRequests={initialSpecialRequests}
        initialOwnedSpecialTemplates={initialOwnedSpecialTemplates}
        initialMyListings={initialMyListings}
        initialMarketListings={initialMarketListings}
        initialPurchases={initialPurchases}
        initialSales={initialSales}
      />
      <footer style={{ padding: "0 24px 24px", fontFamily: "sans-serif" }}>
        <Link href={`/${locale}`}>{locale === "ko" ? "홈으로" : "Back to home"}</Link>
        <span style={{ margin: "0 8px" }}>|</span>
        {session.user.role === UserRole.PLATFORM_ADMIN ? (
          <>
            <Link href={`/${locale}/platform`}>
              {locale === "ko" ? "플랫폼 어드민 콘솔" : "Platform admin console"}
            </Link>
            <span style={{ margin: "0 8px" }}>|</span>
          </>
        ) : null}
        <Link href="/api/auth/signout">{locale === "ko" ? "로그아웃" : "Sign out"}</Link>
      </footer>
    </>
  );
}
