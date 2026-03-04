import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ParticipantAuthClient } from "./ParticipantAuthClient";
import { authOptions } from "@/lib/auth";
import { normalizeLocale, resolveRoleHome } from "@/lib/role-home";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ParticipantAuthPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect(resolveRoleHome(locale, session.user.role));
  }

  return <ParticipantAuthClient locale={locale} />;
}
