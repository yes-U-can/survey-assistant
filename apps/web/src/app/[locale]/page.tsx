import Link from "next/link";

import {
  AdminPortalIllustration,
  ParticipantPortalIllustration,
} from "@/components/HomePortalIllustrations";
import { LegalLinks } from "@/components/LegalLinks";

type HomeCard = {
  href: string;
  title: string;
  description: string;
  devices: string[];
  kind: "participant" | "admin";
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
            title: "피검자 설문 응답",
            description: "참여코드를 입력하고 진행 중인 설문에 참여합니다.",
            devices: ["모바일", "PC"],
            kind: "participant" as const,
          },
          admin: {
            href: `/${locale}/auth/admin`,
            title: "연구관리자 로그인",
            description: "Google 로그인 후 템플릿, 패키지, 결과를 관리합니다.",
            devices: ["PC"],
            kind: "admin" as const,
          },
          deviceAria: "지원 기기",
        }
      : {
          participant: {
            href: `/${locale}/auth/participant`,
            title: "Participant Response",
            description: "Enter a participation code and join an active survey.",
            devices: ["Mobile", "PC"],
            kind: "participant" as const,
          },
          admin: {
            href: `/${locale}/auth/admin`,
            title: "Research Admin Sign-In",
            description: "Sign in with Google and manage templates, packages, and results.",
            devices: ["PC"],
            kind: "admin" as const,
          },
          deviceAria: "Supported devices",
        };

  const cards: HomeCard[] = [copy.participant, copy.admin];

  return (
    <main className="sa-page sa-home sa-home-portal">
      <div className="sa-home-portal-grid-shell">
        <div className="sa-home-portal-grid">
          {cards.map((card, index) => (
            <Link
              key={card.href}
              className={`sa-home-portal-card${index === 0 ? " is-primary" : ""}`}
              href={card.href}
            >
              <div className="sa-home-portal-card-layout">
                <div className="sa-home-portal-main">
                  <div className="sa-home-portal-heading">
                    <strong>{card.title}</strong>
                    <div className="sa-home-portal-badges" aria-label={copy.deviceAria}>
                      {card.devices.map((device) => (
                        <span key={device} className="sa-home-device-badge">
                          {device}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p>{card.description}</p>
                </div>
                <div className="sa-home-portal-visual" aria-hidden="true">
                  {card.kind === "participant" ? (
                    <ParticipantPortalIllustration />
                  ) : (
                    <AdminPortalIllustration />
                  )}
                </div>
              </div>
              <div className="sa-home-portal-meta">
                <span className="sa-home-portal-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="sa-footer sa-home-portal-footer">
        <LegalLinks locale={locale} withLeadingDivider={false} />
      </footer>
    </main>
  );
}
