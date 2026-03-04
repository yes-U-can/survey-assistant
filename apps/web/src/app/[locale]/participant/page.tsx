import { PackageStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ParticipantDashboardClient } from "./ParticipantDashboardClient";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ParticipantHomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/participant`);
  }

  if (session.user.role !== UserRole.PARTICIPANT) {
    return (
      <main className="sa-page">
        <h1>{locale === "ko" ? "접근 권한 없음" : "Access Denied"}</h1>
        <p>
          {locale === "ko"
            ? "피검자 계정으로 로그인해야 합니다."
            : "You need a participant account."}
        </p>
      </main>
    );
  }

  const now = new Date();
  const enrollments = await prisma.participantPackage.findMany({
    where: { participantId: session.user.id },
    orderBy: { joinedAt: "desc" },
    include: {
      surveyPackage: {
        select: {
          id: true,
          code: true,
          title: true,
          mode: true,
          status: true,
          startsAt: true,
          endsAt: true,
          maxResponsesPerParticipant: true,
        },
      },
    },
  });

  const initialPackages = enrollments.map((entry) => {
    const maxResponses = entry.surveyPackage.maxResponsesPerParticipant;
    const completed = entry.completedCount;
    const remaining = Math.max(maxResponses - completed, 0);
    const inActiveWindow =
      entry.surveyPackage.status === PackageStatus.ACTIVE &&
      (entry.surveyPackage.startsAt === null || entry.surveyPackage.startsAt <= now) &&
      (entry.surveyPackage.endsAt === null || entry.surveyPackage.endsAt >= now);

    return {
      enrollmentId: entry.id,
      packageId: entry.surveyPackage.id,
      code: entry.surveyPackage.code,
      title: entry.surveyPackage.title,
      mode: entry.surveyPackage.mode,
      status: entry.surveyPackage.status,
      joinedAt: entry.joinedAt.toISOString(),
      startsAt: entry.surveyPackage.startsAt?.toISOString() ?? null,
      endsAt: entry.surveyPackage.endsAt?.toISOString() ?? null,
      completedCount: completed,
      maxResponsesPerParticipant: maxResponses,
      remainingCount: remaining,
      lastRespondedAt: entry.lastRespondedAt?.toISOString() ?? null,
      canRespondNow: inActiveWindow && remaining > 0,
    };
  });

  return (
    <>
      <ParticipantDashboardClient locale={locale} initialPackages={initialPackages} />
      <footer className="sa-footer">
        <Link href={`/${locale}`}>{locale === "ko" ? "홈으로" : "Back to home"}</Link>
        <span className="sa-divider">|</span>
        <Link href="/api/auth/signout">
          {locale === "ko" ? "로그아웃" : "Sign out"}
        </Link>
      </footer>
    </>
  );
}
