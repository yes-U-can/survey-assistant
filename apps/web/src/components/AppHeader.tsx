"use client";

import { UserRole } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type LocaleCode = "ko" | "en";

type Props = {
  locale: LocaleCode;
  role?: UserRole | null;
};

function switchLocalePath(pathname: string, nextLocale: LocaleCode) {
  const segments = pathname.split("/");
  if (segments.length > 1 && (segments[1] === "ko" || segments[1] === "en")) {
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }
  return `/${nextLocale}`;
}

export function AppHeader({ locale, role }: Props) {
  const router = useRouter();
  const pathname = usePathname() ?? `/${locale}`;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isHome = pathname === `/${locale}`;
  const showPrimaryNav = !isHome;
  const showPlatformNav = role === UserRole.PLATFORM_ADMIN && !isHome;

  const t =
    locale === "ko"
      ? {
          brand: "설문조사 도우미",
          tagline: "서울임상심리연구소 연구 운영 미들웨어",
          back: "이전 화면",
          participant: "설문 응답",
          admin: "연구 관리자",
          platform: "플랫폼 운영",
          participantHint: "응답 참여",
          adminHint: "연구 운영",
          platformHint: "서비스 운영",
          currentLocale: "한국어",
          switchLocale: "English",
          switchLocaleAria: "영어로 전환",
          navAria: "빠른 이동",
          localeGroupAria: "언어 선택",
        }
      : {
          brand: "Survey Assistant",
          tagline: "Research operations middleware for SICP",
          back: "Back",
          participant: "Respond",
          admin: "Research Admin",
          platform: "Platform Admin",
          participantHint: "Participant",
          adminHint: "Research",
          platformHint: "Platform",
          currentLocale: "English",
          switchLocale: "한국어",
          switchLocaleAria: "Switch to Korean",
          navAria: "Quick navigation",
          localeGroupAria: "Language selection",
        };

  const nextLocale: LocaleCode = locale === "ko" ? "en" : "ko";
  const switchHref = switchLocalePath(pathname, nextLocale);

  return (
    <header className="sa-app-header">
      <div className="sa-app-header-inner">
        <div className="sa-app-brand">
          <Link href={`/${locale}`} className="sa-brand-link">
            {t.brand}
          </Link>
          <p>{t.tagline}</p>
        </div>

        <nav className="sa-app-nav" aria-label={t.navAria}>
          {showPrimaryNav ? (
            <button
              type="button"
              className="sa-nav-chip"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                  return;
                }
                router.push(`/${locale}`);
              }}
            >
              {t.back}
            </button>
          ) : null}
          {showPrimaryNav ? (
            <Link
              className={`sa-nav-chip ${isActive(`/${locale}/auth/participant`) ? "is-active" : ""}`}
              href={`/${locale}/auth/participant`}
            >
              <small>{t.participantHint}</small>
              {t.participant}
            </Link>
          ) : null}
          {showPrimaryNav ? (
            <Link
              className={`sa-nav-chip ${isActive(`/${locale}/auth/admin`) ? "is-active" : ""}`}
              href={`/${locale}/auth/admin`}
            >
              <small>{t.adminHint}</small>
              {t.admin}
            </Link>
          ) : null}
          {showPlatformNav ? (
            <Link
              className={`sa-nav-chip ${isActive(`/${locale}/platform`) ? "is-active" : ""}`}
              href={`/${locale}/platform`}
            >
              <small>{t.platformHint}</small>
              {t.platform}
            </Link>
          ) : null}
          <div className="sa-locale-switcher" role="group" aria-label={t.localeGroupAria}>
            <span className="sa-locale-chip is-active" aria-current="true">
              {t.currentLocale}
            </span>
            <Link className="sa-locale-chip" href={switchHref} aria-label={t.switchLocaleAria}>
              {t.switchLocale}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
