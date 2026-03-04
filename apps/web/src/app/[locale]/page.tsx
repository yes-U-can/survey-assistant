import Link from "next/link";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>{locale === "ko" ? "설문조사 도우미" : "Survey Assistant"}</h1>
      <p>
        {locale === "ko"
          ? "기본 언어는 한국어이며, 영어를 보조 언어로 지원합니다."
          : "Primary locale is Korean, with English as a secondary locale."}
      </p>
      <ul>
        <li>
          <Link href={`/${locale}/auth/participant`}>
            {locale === "ko" ? "피검자 로그인/가입" : "Participant auth"}
          </Link>
        </li>
        <li>
          <Link href={`/${locale}/auth/admin`}>
            {locale === "ko" ? "관리자 로그인" : "Admin sign-in"}
          </Link>
        </li>
        <li>
          <Link href={`/${locale}/platform`}>
            {locale === "ko" ? "플랫폼 어드민 콘솔" : "Platform admin console"}
          </Link>
        </li>
      </ul>
    </main>
  );
}
