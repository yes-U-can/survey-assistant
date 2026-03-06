import Link from "next/link";

import { LegalLinks } from "@/components/LegalLinks";

type EntryCard = {
  href: string;
  badge: string;
  title: string;
  description: string;
  note: string;
  cta: string;
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
          lead: "연구용 설문 응답과 운영 화면을 분리한 조사 플랫폼입니다.",
          helper: "지금 하려는 작업만 선택하면 바로 해당 화면으로 이동합니다.",
          chooseTitle: "어떤 작업을 하시나요?",
          chooseDesc: "피검자와 연구관리자 진입만 메인 화면에 둡니다.",
          participant: {
            href: `/${locale}/auth/participant`,
            badge: "PARTICIPANT",
            title: "설문에 응답하려고 왔어요",
            description: "참여코드를 입력하고 진행 중인 설문에 바로 참여합니다.",
            note: "모바일 사용 가능",
            cta: "피검자 시작",
          },
          admin: {
            href: `/${locale}/auth/admin`,
            badge: "RESEARCH ADMIN",
            title: "설문을 운영하려고 왔어요",
            description: "Google 로그인 후 템플릿, 패키지, 결과를 관리합니다.",
            note: "PC 웹 전용",
            cta: "연구관리자 시작",
          },
          meta: [
            "기본 언어: 한국어",
            "보조 언어: 영어",
            "민감한 레거시 데이터는 비공개 경계 유지",
          ],
          platformTitle: "플랫폼 운영자이신가요?",
          platformDesc: "운영 콘솔은 일반 진입선과 분리해 둡니다.",
          platformCta: "플랫폼 어드민 콘솔 열기",
          home: "홈",
        }
      : {
          title: "Survey Assistant",
          lead: "A survey platform with separated response and research operation flows.",
          helper: "Choose the task you need and jump directly into the matching workspace.",
          chooseTitle: "What are you here to do?",
          chooseDesc: "The home screen keeps only participant and research-admin entry points.",
          participant: {
            href: `/${locale}/auth/participant`,
            badge: "PARTICIPANT",
            title: "I am here to respond",
            description: "Enter a participation code and join an active survey package.",
            note: "Mobile supported",
            cta: "Continue as participant",
          },
          admin: {
            href: `/${locale}/auth/admin`,
            badge: "RESEARCH ADMIN",
            title: "I am here to run a study",
            description: "Sign in with Google and manage templates, packages, and results.",
            note: "Desktop only",
            cta: "Continue as admin",
          },
          meta: [
            "Primary language: Korean",
            "Secondary language: English",
            "Sensitive legacy data stays outside the public boundary",
          ],
          platformTitle: "Operating the platform?",
          platformDesc: "The platform-admin console stays separate from the main entry flow.",
          platformCta: "Open platform admin console",
          home: "Home",
        };

  const primaryCards: EntryCard[] = [copy.participant, copy.admin];

  return (
    <main className="sa-page sa-home sa-home-minimal">
      <section className="sa-home-hero sa-home-hero-minimal">
        <div className="sa-home-hero-copy">
          <p className="sa-home-kicker">
            {locale === "ko" ? "Role-Based Entry" : "Role-Based Entry"}
          </p>
          <h1>{copy.title}</h1>
          <p className="sa-home-lead">{copy.lead}</p>
          <p>{copy.helper}</p>
        </div>
        <div className="sa-home-meta-strip" aria-label={locale === "ko" ? "서비스 정책" : "Service policy"}>
          {copy.meta.map((item) => (
            <span key={item} className="sa-home-meta-chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="sa-entry-intro sa-entry-intro-minimal">
        <h2>{copy.chooseTitle}</h2>
        <p>{copy.chooseDesc}</p>
      </section>

      <section className="sa-home-choice-shell">
        <div className="sa-home-choice-grid">
          {primaryCards.map((card) => (
            <Link key={card.href} className="sa-home-choice-card" href={card.href}>
              <small className="sa-home-badge">{card.badge}</small>
              <strong>{card.title}</strong>
              <p className="sa-home-choice-desc">{card.description}</p>
              <span className="sa-home-choice-note">{card.note}</span>
              <span className="sa-home-cta">
                {card.cta}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="sa-home-secondary">
        <div>
          <h2>{copy.platformTitle}</h2>
          <p>{copy.platformDesc}</p>
        </div>
        <Link className="sa-home-platform-link" href={`/${locale}/platform`}>
          {copy.platformCta}
        </Link>
      </section>

      <footer className="sa-footer" style={{ paddingTop: 18 }}>
        <Link href={`/${locale}`}>{copy.home}</Link>
        <LegalLinks locale={locale} />
      </footer>
    </main>
  );
}
