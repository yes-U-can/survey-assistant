import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

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
      <main style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1>{locale === "ko" ? "접근 권한 없음" : "Access Denied"}</h1>
        <p>
          {locale === "ko"
            ? "피검자 계정으로 로그인해야 합니다."
            : "You need a participant account."}
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>{locale === "ko" ? "피검자 홈" : "Participant Home"}</h1>
      <p>
        {locale === "ko"
          ? "설문 코드 등록/응답 진행현황 화면은 다음 단계에서 연결합니다."
          : "Survey code enrollment and response progress screens are next."}
      </p>
      <ul>
        <li>
          <Link href={`/${locale}`}>{locale === "ko" ? "홈" : "Home"}</Link>
        </li>
        <li>
          <Link href="/api/auth/signout">
            {locale === "ko" ? "로그아웃" : "Sign out"}
          </Link>
        </li>
      </ul>
    </main>
  );
}

