import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { authOptions } from "@/lib/auth";
import { normalizeLocale, resolveRoleHome } from "@/lib/role-home";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ callbackUrl?: string; error?: string }>;
};

export default async function AdminSignInPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    redirect(resolveRoleHome(locale, session.user.role));
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const authError =
    typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null;

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
          title: "연구자 간편 로그인",
          subtitle:
            "초대된 연구자 또는 운영자 계정은 Google 계정으로 로그인할 수 있습니다. 로그인 후 이메일 정책에 따라 연구자 또는 플랫폼 어드민 권한이 연결됩니다.",
          flowTitle: "로그인 흐름",
          flow: ["Google 로그인 인증", "초대 및 권한 확인", "관리 콘솔 진입"],
          googleButton: "Google 계정으로 계속하기",
          setupMissing:
            "간편 로그인 환경변수가 아직 연결되지 않았습니다. GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET를 확인해 주세요.",
          toParticipant: "피검자 로그인으로 이동",
          toHome: "홈으로 이동",
          mobileBlockedTitle: "연구자 로그인은 PC 전용입니다.",
          mobileBlockedBody:
            "연구자 및 플랫폼 운영 기능은 모바일을 지원하지 않습니다. PC 브라우저에서 로그인해 주세요.",
        }
      : {
          title: "Research Admin Sign-In",
          subtitle:
            "Invited research-admin and platform-admin accounts can sign in with a Google account. After authentication, role access is resolved by email policy.",
          flowTitle: "Sign-in flow",
          flow: ["Google sign-in", "Invite and role check", "Enter admin console"],
          googleButton: "Continue with Google account",
          setupMissing:
            "OAuth environment variables are not configured yet. Check GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.",
          toParticipant: "Go to participant auth",
          toHome: "Back to home",
          mobileBlockedTitle: "Admin sign-in is desktop-only.",
          mobileBlockedBody:
            "Research-admin and platform-admin functions are not supported on mobile. Please sign in from a desktop browser.",
        };

  const errorMessage =
    authError === "admin_not_invited"
      ? locale === "ko"
        ? "초대되지 않은 관리자 계정입니다."
        : "This account is not invited for admin access."
      : authError === "admin_inactive"
        ? locale === "ko"
          ? "비활성화된 관리자 계정입니다."
          : "This admin account is inactive."
        : authError === "account_role_not_admin"
          ? locale === "ko"
            ? "이 계정은 관리자 권한이 없습니다."
            : "This account is not an admin account."
          : authError === "admin_email_required"
            ? locale === "ko"
              ? "이메일 제공 동의가 필요합니다."
              : "Email permission is required for admin sign-in."
            : authError === "rate_limited"
              ? locale === "ko"
                ? "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
                : "Too many attempts. Please try again later."
              : authError
                ? locale === "ko"
                  ? "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요."
                  : "Sign-in failed. Please try again."
                : null;

  return (
    <>
      <main className="sa-page sa-desktop-only sa-auth-shell" style={{ maxWidth: 920 }}>
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
            <div className="sa-oauth-buttons" style={{ marginTop: 14 }}>
              <GoogleSignInButton
                href={`/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                label={t.googleButton}
              />
            </div>
          ) : (
            <p className="sa-inline-message" style={{ marginTop: 12 }}>
              {t.setupMissing}
            </p>
          )}

          {errorMessage ? (
            <p className="sa-inline-message" style={{ marginTop: 12 }}>
              {errorMessage}
            </p>
          ) : null}

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
