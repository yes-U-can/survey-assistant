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
            ? "관리자 또는 플랫폼 어드민 계정으로 로그인해야 합니다."
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
          ? "관리자 API 골격(템플릿/패키지)이 준비되었습니다."
          : "Admin API skeleton (templates/packages) is ready."}
      </p>
      <ul>
        <li>
          <code>GET/POST /api/admin/templates</code>
        </li>
        <li>
          <code>GET/POST /api/admin/packages</code>
        </li>
        <li>
          <code>PATCH /api/admin/packages/{'{packageId}'}/status</code>
        </li>
      </ul>
      <hr style={{ margin: "16px 0" }} />
      <p>
        <Link href={`/${locale}`}>{locale === "ko" ? "홈으로" : "Back to home"}</Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link href="/api/auth/signout">{locale === "ko" ? "로그아웃" : "Sign out"}</Link>
      </p>
    </main>
  );
}