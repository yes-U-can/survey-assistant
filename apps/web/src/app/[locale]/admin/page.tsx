import { UserRole } from "@prisma/client";
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
    redirect(`/${locale}/auth/admin`);
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

  const [templates, packages] = await Promise.all([
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

  return (
    <>
      <AdminDashboardClient
        locale={locale}
        initialTemplates={initialTemplates}
        initialPackages={initialPackages}
      />
      <footer style={{ padding: "0 24px 24px", fontFamily: "sans-serif" }}>
        <Link href={`/${locale}`}>{locale === "ko" ? "홈으로" : "Back to home"}</Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link href="/api/auth/signout">{locale === "ko" ? "로그아웃" : "Sign out"}</Link>
      </footer>
    </>
  );
}
