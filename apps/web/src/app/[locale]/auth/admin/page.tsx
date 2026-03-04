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

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480 }}>
      <h1>{locale === "ko" ? "관리자 로그인" : "Admin Sign-In"}</h1>
      <p>
        {locale === "ko"
          ? "관리자/플랫폼 어드민은 Google 계정으로 로그인합니다."
          : "Research admins and platform admins sign in with Google."}
      </p>
      <a
        href={`/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #111",
          textDecoration: "none",
          color: "inherit",
          cursor: "pointer",
        }}
      >
        {locale === "ko" ? "Google로 로그인" : "Continue with Google"}
      </a>
    </main>
  );
}
