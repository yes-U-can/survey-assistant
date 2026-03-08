import type { ReactNode } from "react";

import { AppFooter } from "@/components/AppFooter";
import { WorkspaceHeader } from "@/components/WorkspaceHeader";

type WorkspaceLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { locale } = await params;
  const normalizedLocale = locale === "en" ? "en" : "ko";

  return (
    <>
      <WorkspaceHeader locale={normalizedLocale} />
      <div className="sa-workspace-body">{children}</div>
      <AppFooter locale={normalizedLocale} />
    </>
  );
}
