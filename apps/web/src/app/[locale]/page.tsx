import Link from "next/link";

import { LegalLinks } from "@/components/LegalLinks";

type HomeCard = {
  href: string;
  badge: string;
  title: string;
  description: string;
  devices: string[];
};

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  const copy =
    locale === "ko"
      ? {
          participant: {
            href: `/${locale}/auth/participant`,
            badge: "PARTICIPANT",
            title: "피검자 설문 응답",
            description: "참여코드를 입력하고 진행 중인 설문에 참여합니다.",
            devices: ["모바일", "PC"],
          },
          admin: {
            href: `/${locale}/auth/admin`,
            badge: "RESEARCH ADMIN",
            title: "연구관리자 로그인",
            description: "Google 로그인 후 템플릿, 패키지, 결과를 관리합니다.",
            devices: ["PC"],
          },
          deviceAria: "지원 기기",
        }
      : {
          participant: {
            href: `/${locale}/auth/participant`,
            badge: "PARTICIPANT",
            title: "Participant Response",
            description: "Enter a participation code and join an active survey.",
            devices: ["Mobile", "PC"],
          },
          admin: {
            href: `/${locale}/auth/admin`,
            badge: "RESEARCH ADMIN",
            title: "Research Admin Sign-In",
            description: "Sign in with Google and manage templates, packages, and results.",
            devices: ["PC"],
          },
          deviceAria: "Supported devices",
        };

  const cards: HomeCard[] = [copy.participant, copy.admin];

  return (
    <main className="sa-page sa-home sa-home-portal">
      <section className="sa-home-portal-grid-shell">
        <div className="sa-home-portal-grid">
          {cards.map((card) => (
            <Link key={card.href} className="sa-home-portal-card" href={card.href}>
              <small className="sa-home-badge">{card.badge}</small>
              <strong>{card.title}</strong>
              <p>{card.description}</p>
              <div className="sa-home-portal-badges" aria-label={copy.deviceAria}>
                {card.devices.map((device) => (
                  <span key={device} className="sa-home-device-badge">
                    {device}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="sa-footer sa-home-portal-footer">
        <LegalLinks locale={locale} withLeadingDivider={false} />
      </footer>
    </main>
  );
}
