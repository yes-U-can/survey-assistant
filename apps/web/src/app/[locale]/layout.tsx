import "../globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

function resolveMetadataBase() {
  const raw =
    process.env.APP_BASE_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (!raw) {
    return undefined;
  }

  const normalized = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
  try {
    return new URL(normalized);
  } catch {
    return undefined;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";
  const isKo = locale === "ko";

  return {
    metadataBase: resolveMetadataBase(),
    applicationName: "Survey Assistant",
    title: {
      default: "Survey Assistant",
      template: "%s | Survey Assistant",
    },
    description: isKo
      ? "설문 실행, 결과 내보내기, AI 해석을 지원하는 연구용 설문조사 미들웨어입니다."
      : "Research survey middleware for survey delivery, result export, and AI-assisted analysis.",
    openGraph: {
      title: "Survey Assistant",
      description: isKo
        ? "설문 실행, 결과 내보내기, AI 해석을 지원하는 연구용 설문조사 미들웨어"
        : "Research survey middleware for survey delivery, result export, and AI-assisted analysis.",
      siteName: "Survey Assistant",
      locale: isKo ? "ko_KR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Survey Assistant",
      description: isKo
        ? "연구용 설문조사 미들웨어"
        : "Research survey middleware",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const normalizedLocale = locale === "en" ? "en" : "ko";

  return (
    <html lang={normalizedLocale}>
      <body>
        <AppHeader locale={normalizedLocale} />
        <div className="sa-app-body">{children}</div>
        <AppFooter locale={normalizedLocale} />
      </body>
    </html>
  );
}
