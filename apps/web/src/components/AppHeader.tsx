"use client";

import { UserRole } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type LocaleCode = "ko" | "en";

type Props = {
  locale: LocaleCode;
  role?: UserRole | null;
};

const LOCALE_OPTIONS: Array<{
  code: LocaleCode;
  label: string;
  ariaLabel: string;
}> = [
  {
    code: "ko",
    label: "한국어",
    ariaLabel: "한국어로 보기",
  },
  {
    code: "en",
    label: "English",
    ariaLabel: "View in English",
  },
];

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
          back: "이전 화면",
          participant: "설문 응답",
          admin: "연구 관리자",
          platform: "플랫폼 운영",
          participantHint: "응답 참여",
          adminHint: "연구 운영",
          platformHint: "서비스 운영",
          navAria: "빠른 이동",
          localeGroupAria: "언어 선택",
        }
      : {
          brand: "Survey Assistant",
          back: "Back",
          participant: "Respond",
          admin: "Research Admin",
          platform: "Platform Admin",
          participantHint: "Participant",
          adminHint: "Research",
          platformHint: "Platform",
          navAria: "Quick navigation",
          localeGroupAria: "Language selection",
        };

  return (
    <header className="sa-app-header">
      <div className="sa-app-header-inner">
        <div className="sa-app-brand">
          <span className="sa-brand-title">{t.brand}</span>
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
            {LOCALE_OPTIONS.map((option) =>
              option.code === locale ? (
                <span
                  key={option.code}
                  className="sa-locale-chip is-active"
                  aria-current="true"
                >
                  {option.label}
                </span>
              ) : (
                <Link
                  key={option.code}
                  className="sa-locale-chip"
                  href={switchLocalePath(pathname, option.code)}
                  aria-label={option.ariaLabel}
                >
                  {option.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
