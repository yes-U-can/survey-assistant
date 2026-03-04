type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ callbackUrl?: string }>;
};

export default async function AdminSignInPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const fallbackCallback = `/${locale}/admin`;
  const rawCallbackUrl = resolvedSearchParams.callbackUrl;
  const callbackUrl =
    typeof rawCallbackUrl === "string" && rawCallbackUrl.startsWith(`/${locale}/`)
      ? rawCallbackUrl
      : fallbackCallback;

  const mobileBlockedTitle =
    locale === "ko" ? "관리자 로그인은 PC 웹 전용입니다." : "Admin sign-in is desktop-only.";
  const mobileBlockedBody =
    locale === "ko"
      ? "관리자/플랫폼 어드민 기능은 모바일을 지원하지 않습니다. PC 브라우저에서 로그인해 주세요."
      : "Admin and platform-admin functions are not supported on mobile. Please sign in from a desktop browser.";
  const mobileBlockedLink = locale === "ko" ? "홈으로 이동" : "Back to home";

  return (
    <>
      <main className="sa-page sa-desktop-only" style={{ maxWidth: 540 }}>
        <h1>{locale === "ko" ? "관리자 로그인" : "Admin Sign-In"}</h1>
        <p>
          {locale === "ko"
            ? "관리자/플랫폼 어드민은 Google 계정으로 로그인합니다."
            : "Research admins and platform admins sign in with Google."}
        </p>
        <a
          className="sa-btn-link sa-btn-primary"
          href={`/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          style={{ display: "inline-block", marginTop: 16, textDecoration: "none" }}
        >
          {locale === "ko" ? "Google로 로그인" : "Continue with Google"}
        </a>
      </main>

      <main className="sa-page sa-mobile-policy-block">
        <section className="sa-mobile-policy-card">
          <h1>{mobileBlockedTitle}</h1>
          <p>{mobileBlockedBody}</p>
          <p style={{ marginTop: 12 }}>
            <a href={`/${locale}`}>{mobileBlockedLink}</a>
          </p>
        </section>
      </main>
    </>
  );
}
