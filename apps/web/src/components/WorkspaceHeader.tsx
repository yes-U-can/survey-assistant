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

export function WorkspaceHeader({ locale }: Props) {
  const pathname = usePathname() ?? `/${locale}`;
  const copy =
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
    <header className="sa-workspace-header">
      <div className="sa-workspace-header-inner">
        <div className="sa-workspace-brand">
          <span className="sa-workspace-brand-title">{copy.brand}</span>
        </div>

        <nav className="sa-workspace-header-nav" aria-label={copy.localeGroupAria}>
          <div className="sa-locale-switcher" role="group" aria-label={copy.localeGroupAria}>
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
