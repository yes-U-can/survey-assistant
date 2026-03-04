import "../globals.css";
import type { ReactNode } from "react";

import { AppHeader } from "@/components/AppHeader";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale === "en" ? "en" : "ko"}>
      <body>
        <AppHeader locale={locale === "en" ? "en" : "ko"} />
        <div className="sa-app-body">{children}</div>
      </body>
    </html>
  );
}
