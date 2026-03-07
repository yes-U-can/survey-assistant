import type { ReactNode } from "react";

import { AppFooter } from "@/components/AppFooter";

type Props = {
  locale: "ko" | "en";
  title: string;
  subtitle: string;
  meta?: string;
  children: ReactNode;
};

export function StaticPageShell({
  locale,
  title,
  subtitle,
  meta,
  children,
}: Props) {
  return (
    <>
      <main className="sa-static-page">
        <div className="sa-static-page-shell">
          <article className="sa-static-page-card">
            <header className="sa-static-page-header">
              <h1>{title}</h1>
              {meta ? <p className="sa-static-page-meta">{meta}</p> : null}
              <p className="sa-static-page-subtitle">{subtitle}</p>
            </header>
            {children}
          </article>
        </div>
      </main>
      <AppFooter locale={locale} />
    </>
  );
}
