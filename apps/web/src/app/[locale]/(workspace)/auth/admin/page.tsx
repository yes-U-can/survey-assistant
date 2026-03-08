import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { AdminGoogleIdentityPanel } from "@/components/auth/AdminGoogleIdentityPanel";
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

  const t =
    locale === "ko"
      ? {
          toHome: "홈으로 이동",
          mobileBlockedTitle: "연구자 로그인은 PC 전용입니다.",
          mobileBlockedBody:
            "연구자 및 플랫폼 운영 기능은 모바일을 지원하지 않습니다. PC 브라우저에서 로그인해 주세요.",
        }
      : {
          toHome: "Back to home",
          mobileBlockedTitle: "Admin sign-in is desktop-only.",
          mobileBlockedBody:
            "Research-admin and platform-admin functions are not supported on mobile. Please sign in from a desktop browser.",
        };

  return (
    <>
      <main className="sa-page sa-desktop-only sa-auth-shell" style={{ maxWidth: 920 }}>
        <AdminGoogleIdentityPanel
          locale={locale}
          callbackUrl={callbackUrl}
          initialErrorCode={authError}
          isGoogleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
          googleClientId={process.env.GOOGLE_CLIENT_ID ?? null}
        />
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
