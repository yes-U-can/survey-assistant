import type { ReactNode } from "react";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";

type PublicLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale } = await params;
  const normalizedLocale = locale === "en" ? "en" : "ko";

  return (
    <>
      <AppHeader locale={normalizedLocale} />
      <div className="sa-app-body">{children}</div>
      <AppFooter locale={normalizedLocale} />
    </>
  );
}
