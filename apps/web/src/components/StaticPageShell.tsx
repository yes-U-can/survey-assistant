import type { ReactNode } from "react";

type Props = {
  locale: "ko" | "en";
  title: string;
  subtitle?: string;
  meta?: string;
  intro?: string;
  children: ReactNode;
};

export function StaticPageShell({
  locale: _locale,
  title,
  subtitle,
  meta,
  intro,
  children,
}: Props) {
  void _locale;

  return (
    <main className="sa-static-page">
      <div className="sa-static-page-shell">
        <article className="sa-static-page-card">
          <header className="sa-static-page-header">
            <h1>{title}</h1>
            {meta ? <p className="sa-static-page-meta">{meta}</p> : null}
            {subtitle ? <p className="sa-static-page-subtitle">{subtitle}</p> : null}
            {intro ? <p className="sa-static-page-intro">{intro}</p> : null}
          </header>
          {children}
        </article>
      </div>
    </main>
  );
}
