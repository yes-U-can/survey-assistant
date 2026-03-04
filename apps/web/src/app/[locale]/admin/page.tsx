import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

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
            ? "관리자/플랫폼 어드민 계정으로 로그인해야 합니다."
            : "You need a research admin or platform admin account."}
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>{locale === "ko" ? "관리자 홈" : "Admin Home"}</h1>
      <p>
        {locale === "ko"
          ? "템플릿/패키지 관리 화면은 다음 단계에서 연결합니다."
          : "Template/package management screens will be connected next."}
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

