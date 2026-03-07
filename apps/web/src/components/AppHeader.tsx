"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type LocaleCode = "ko" | "en";

type Props = {
  locale: LocaleCode;
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

export function AppHeader({ locale }: Props) {
  const pathname = usePathname() ?? `/${locale}`;

  const t =
    locale === "ko"
      ? {
          brand: "설문조사 도우미",
          localeGroupAria: "언어 선택",
        }
      : {
          brand: "Survey Assistant",
          localeGroupAria: "Language selection",
        };

  return (
    <header className="sa-app-header">
      <div className="sa-app-header-inner">
        <div className="sa-app-brand">
          <span className="sa-brand-title">{t.brand}</span>
        </div>

        <nav className="sa-app-nav" aria-label={t.localeGroupAria}>
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
