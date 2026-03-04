import Link from "next/link";

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return (
    <main className="sa-page sa-home">
      <h1>{locale === "ko" ? "설문조사 도우미" : "Survey Assistant"}</h1>
      <p>
        {locale === "ko"
          ? "기본 언어는 한국어이며, 영어를 보조 언어로 지원합니다."
          : "Primary locale is Korean, with English as a secondary locale."}
      </p>
      <ul className="sa-home-grid">
        <li>
          <Link className="sa-home-card" href={`/${locale}/auth/participant`}>
            <strong>{locale === "ko" ? "피검자 로그인/가입" : "Participant auth"}</strong>
            <small>{locale === "ko" ? "설문 참여 계정으로 시작" : "Start as participant"}</small>
          </Link>
        </li>
        <li>
          <Link className="sa-home-card" href={`/${locale}/auth/admin`}>
            <strong>{locale === "ko" ? "관리자 로그인" : "Admin sign-in"}</strong>
            <small>
              {locale === "ko" ? "Google 계정으로 접속 (PC 전용)" : "Continue with Google (desktop only)"}
            </small>
          </Link>
        </li>
        <li>
          <Link className="sa-home-card" href={`/${locale}/platform`}>
            <strong>{locale === "ko" ? "플랫폼 어드민 콘솔" : "Platform admin console"}</strong>
            <small>
              {locale === "ko"
                ? "운영/정산/마이그레이션 관리 (PC 전용)"
                : "Operate settlements and migrations (desktop only)"}
            </small>
          </Link>
        </li>
      </ul>
    </main>
  );
}
