import { ParticipantAuthClient } from "./ParticipantAuthClient";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ParticipantAuthPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return <ParticipantAuthClient locale={locale} />;
}

