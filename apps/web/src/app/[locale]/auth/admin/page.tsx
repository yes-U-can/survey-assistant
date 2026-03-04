import Link from "next/link";

import { GoogleSignInButton } from "@/components/GoogleSignInButton";

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
  const isGoogleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  const t =
    locale === "ko"
      ? {
          title: "연구 관리자 로그인",
          subtitle:
            "Google 간편 로그인을 사용합니다. 로그인 후 계정 이메일 정책에 따라 관리자 또는 플랫폼 어드민 권한이 자동 판별됩니다.",
          flowTitle: "로그인 흐름",
          flow: ["Google 인증", "권한 자동 판별", "관리자 콘솔 진입"],
          button: "Google로 계속하기",
          setupMissing:
            "Google OAuth 환경변수가 설정되지 않았습니다. GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET를 확인하세요.",
          toParticipant: "피검자 화면으로 이동",
          toHome: "홈으로 이동",
          mobileBlockedTitle: "관리자 로그인은 PC 웹 전용입니다.",
          mobileBlockedBody:
            "관리자/플랫폼 어드민 기능은 모바일을 지원하지 않습니다. PC 브라우저에서 로그인해 주세요.",
        }
      : {
          title: "Research Admin Sign-In",
          subtitle:
            "Use Google sign-in. After authentication, role is resolved automatically as research admin or platform admin by email policy.",
          flowTitle: "Sign-in flow",
          flow: ["Google auth", "Role resolution", "Enter admin console"],
          button: "Continue with Google",
          setupMissing:
            "Google OAuth environment variables are missing. Check GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.",
          toParticipant: "Go to participant auth",
          toHome: "Back to home",
          mobileBlockedTitle: "Admin sign-in is desktop-only.",
          mobileBlockedBody:
            "Admin and platform-admin functions are not supported on mobile. Please sign in from a desktop browser.",
        };

  return (
    <>
      <main className="sa-page sa-desktop-only" style={{ maxWidth: 760 }}>
        <section className="sa-auth-hero">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
          <h2>{t.flowTitle}</h2>
          <ol className="sa-role-flow-list">
            {t.flow.map((step, idx) => (
              <li key={step}>
                <span>{idx + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          {isGoogleEnabled ? (
            <div style={{ marginTop: 14 }}>
              <GoogleSignInButton
                href={`/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                label={t.button}
              />
            </div>
          ) : (
            <p className="sa-inline-message" style={{ marginTop: 12 }}>
              {t.setupMissing}
            </p>
          )}

          <div className="sa-auth-links">
            <Link href={`/${locale}/auth/participant`}>{t.toParticipant}</Link>
            <Link href={`/${locale}`}>{t.toHome}</Link>
          </div>
        </section>
      </main>

      <main className="sa-page sa-mobile-policy-block">
        <section className="sa-mobile-policy-card">
          <h1>{t.mobileBlockedTitle}</h1>
          <p>{t.mobileBlockedBody}</p>
          <p style={{ marginTop: 12 }}>
            <Link href={`/${locale}`}>{t.toHome}</Link>
          </p>
        </section>
      </main>
    </>
  );
}
