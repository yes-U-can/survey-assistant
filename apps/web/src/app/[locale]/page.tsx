import Link from "next/link";

import { LegalLinks } from "@/components/LegalLinks";

type HomeCard = {
  href: string;
  badge: string;
  title: string;
  description: string;
  note: string;
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
          title: "설문조사 도우미",
          lead: "연구용 설문 응답과 설문 운영을 빠르게 시작하는 플랫폼입니다.",
          participant: {
            href: `/${locale}/auth/participant`,
            badge: "PARTICIPANT",
            title: "피검자 설문 응답",
            description: "참여코드를 입력하고 진행 중인 설문에 참여합니다.",
            note: "모바일 사용 가능",
          },
          admin: {
            href: `/${locale}/auth/admin`,
            badge: "RESEARCH ADMIN",
            title: "연구관리자 로그인",
            description: "Google 로그인 후 템플릿, 패키지, 결과를 관리합니다.",
            note: "PC 웹 전용",
          },
        }
      : {
          title: "Survey Assistant",
          lead: "A platform for starting participant responses and research operations quickly.",
          participant: {
            href: `/${locale}/auth/participant`,
            badge: "PARTICIPANT",
            title: "Participant Response",
            description: "Enter a participation code and join an active survey.",
            note: "Mobile supported",
          },
          admin: {
            href: `/${locale}/auth/admin`,
            badge: "RESEARCH ADMIN",
            title: "Research Admin Sign-In",
            description: "Sign in with Google and manage templates, packages, and results.",
            note: "Desktop only",
          },
        };

  const cards: HomeCard[] = [copy.participant, copy.admin];

  return (
    <main className="sa-page sa-home sa-home-portal">
      <section className="sa-home-portal-hero">
        <h1>{copy.title}</h1>
        <p className="sa-home-portal-lead">{copy.lead}</p>
      </section>

      <section className="sa-home-portal-grid-shell">
        <div className="sa-home-portal-grid">
          {cards.map((card) => (
            <Link key={card.href} className="sa-home-portal-card" href={card.href}>
              <small className="sa-home-badge">{card.badge}</small>
              <strong>{card.title}</strong>
              <p>{card.description}</p>
              <span className="sa-home-portal-note">{card.note}</span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="sa-footer sa-home-portal-footer">
        <LegalLinks locale={locale} />
      </footer>
    </main>
  );
}
