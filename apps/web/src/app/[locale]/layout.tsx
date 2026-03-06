import "../globals.css";
import type { ReactNode } from "react";
import { getServerSession } from "next-auth";

import { AppHeader } from "@/components/AppHeader";
import { authOptions } from "@/lib/auth";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  return (
    <html lang={locale === "en" ? "en" : "ko"}>
      <body>
        <AppHeader
          locale={locale === "en" ? "en" : "ko"}
          role={session?.user?.role ?? null}
        />
        <div className="sa-app-body">{children}</div>
      </body>
    </html>
  );
}
