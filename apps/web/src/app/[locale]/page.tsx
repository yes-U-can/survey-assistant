import Link from "next/link";

import { LegalLinks } from "@/components/LegalLinks";

type RoleLane = {
  href: string;
  badge: string;
  title: string;
  description: string;
  cta: string;
  steps: string[];
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
          lead: "피검자 여정과 연구 관리자 여정을 분리 설계한 설문조사 플랫폼",
          helper:
            "처음 진입부터 목적별 동선을 분리합니다. 응답자는 빠르게 설문에 참여하고, 관리자는 템플릿/패키지/결과를 운영합니다.",
          trust: "연구용 운영 환경",
          localePolicy: "기본 언어 한국어 / 보조 영어",
          dataPolicy: "레거시 민감 데이터 비공개 원칙 적용",
          chooseTitle: "어떤 목적으로 오셨나요?",
          chooseDesc: "아래에서 본인 역할을 선택하면, 그 역할에 맞는 화면으로 바로 이동합니다.",
          participantJourney: "피검자 여정",
          adminJourney: "연구 관리자 여정",
          platformJourney: "플랫폼 운영 여정",
          participantQuick: "응답 시작",
          adminQuick: "연구 운영 시작",
          platformQuick: "운영 콘솔 진입",
        }
      : {
          title: "Survey Assistant",
          lead: "A survey platform with separated journeys for participants and research admins.",
          helper:
            "From the first screen, entry paths are split by role. Participants can respond fast, while admins can run templates, packages, and results.",
          trust: "Research-ready operations",
          localePolicy: "Primary language Korean / secondary English",
          dataPolicy: "Legacy sensitive data remains private",
          chooseTitle: "What brings you here?",
          chooseDesc: "Choose your role to jump directly into the right journey.",
          participantJourney: "Participant journey",
          adminJourney: "Research-admin journey",
          platformJourney: "Platform-admin journey",
          participantQuick: "Start response",
          adminQuick: "Start research ops",
          platformQuick: "Open platform console",
        };

  const primaryLanes: RoleLane[] =
    locale === "ko"
      ? [
          {
            href: `/${locale}/auth/participant`,
            badge: locale === "ko" ? "PARTICIPANT" : "PARTICIPANT",
            title: "설문 응답하러 왔어요",
            description: "피검자 전용 화면입니다. 익명형 계정을 만들고 참여코드를 입력해 바로 설문에 참여합니다.",
            cta: "피검자로 시작하기",
            steps: ["가입/로그인", "참여코드 입력", "응답 제출 및 진행률 확인"],
          },
          {
            href: `/${locale}/auth/admin`,
            badge: locale === "ko" ? "RESEARCH ADMIN" : "RESEARCH ADMIN",
            title: "연구를 운영 중이에요",
            description:
              "연구 관리자 전용 화면입니다. 템플릿 생성부터 패키지 운영, 참여코드 발급, 결과 CSV 다운로드까지 처리합니다.",
            cta: "관리자 로그인하기",
            steps: ["템플릿 구성", "패키지 생성 + 참여코드 발급", "응답 데이터 CSV 다운로드"],
          },
        ]
      : [
          {
            href: `/${locale}/auth/participant`,
            badge: "PARTICIPANT",
            title: "I am here to respond",
            description: "Participant-only flow. Create an anonymous-style account and join surveys with a code.",
            cta: "Continue as participant",
            steps: ["Sign up / Sign in", "Enter survey code", "Submit and track progress"],
          },
          {
            href: `/${locale}/auth/admin`,
            badge: "RESEARCH ADMIN",
            title: "I run a study",
            description: "Research-admin flow for templates, packages, survey codes, and CSV exports.",
            cta: "Sign in as admin",
            steps: ["Build templates", "Create package + issue code", "Download result CSV"],
          },
        ];

  const platformLane: RoleLane =
    locale === "ko"
      ? {
          href: `/${locale}/platform`,
          badge: "PLATFORM ADMIN",
          title: "플랫폼 운영자예요",
          description:
            "플랫폼 어드민 전용 콘솔입니다. 크레딧 원장, 특수 템플릿 의뢰 큐, 정산, 마이그레이션 요청을 관리합니다.",
          cta: "플랫폼 콘솔 열기",
          steps: ["의뢰 큐 처리", "스토어 정산 점검", "크레딧/마이그레이션 운영"],
        }
      : {
          href: `/${locale}/platform`,
          badge: "PLATFORM ADMIN",
          title: "I operate the platform",
          description:
            "Platform-admin console for credit ledger, special-request queue, settlements, and migrations.",
          cta: "Open platform console",
          steps: ["Process requests", "Review settlements", "Operate credits and migrations"],
        };

  return (
    <main className="sa-page sa-home">
      <section className="sa-home-hero">
        <div className="sa-home-hero-grid">
          <div>
            <p className="sa-home-kicker">{locale === "ko" ? "Role-Based Workspace" : "Role-Based Workspace"}</p>
            <h1>{copy.title}</h1>
            <p className="sa-home-lead">{copy.lead}</p>
            <p>{copy.helper}</p>
          </div>
          <aside className="sa-home-kpis" aria-label={locale === "ko" ? "서비스 핵심 정보" : "Service highlights"}>
            <p className="sa-home-kpi">
              <strong>{copy.trust}</strong>
              <span>{locale === "ko" ? "피검자/관리자/플랫폼 어드민 분리 운영" : "Separated participant/admin/platform operation"}</span>
            </p>
            <p className="sa-home-kpi">
              <strong>{copy.localePolicy}</strong>
              <span>{locale === "ko" ? "ko 기본, en 보조" : "ko primary, en secondary"}</span>
            </p>
            <p className="sa-home-kpi">
              <strong>{copy.dataPolicy}</strong>
              <span>{locale === "ko" ? "오픈소스 경계 정책 적용" : "Open-source boundary policy enabled"}</span>
            </p>
          </aside>
        </div>
      </section>

      <section className="sa-entry-intro">
        <h2>{copy.chooseTitle}</h2>
        <p>{copy.chooseDesc}</p>
      </section>

      <ul className="sa-home-grid">
        {primaryLanes.map((lane) => (
          <li key={lane.href}>
            <Link className="sa-home-card" href={lane.href}>
              <small className="sa-home-badge">{lane.badge}</small>
              <strong>{lane.title}</strong>
              <small className="sa-home-desc">{lane.description}</small>
              <ol className="sa-home-flow">
                {lane.steps.map((step, idx) => (
                  <li key={step}>
                    <span>{idx + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <span className="sa-home-cta">
                {lane.cta}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="sa-home-journey">
        <h2>{locale === "ko" ? "고객 여정 지도" : "Customer Journey Map"}</h2>
        <div className="sa-home-journey-grid">
          <article>
            <h3>{copy.participantJourney}</h3>
            <ol className="sa-role-flow-list">
              <li>
                <span>1</span>
                {locale === "ko" ? "연구 ID로 가입/로그인" : "Sign up/sign in with study ID"}
              </li>
              <li>
                <span>2</span>
                {locale === "ko" ? "참여코드 입력 후 패키지 입장" : "Enter survey code and enter package"}
              </li>
              <li>
                <span>3</span>
                {locale === "ko" ? "응답 제출 후 진행률 확인" : "Submit response and check progress"}
              </li>
            </ol>
            <Link className="sa-btn-link" href={`/${locale}/auth/participant`}>
              {copy.participantQuick}
            </Link>
          </article>

          <article>
            <h3>{copy.adminJourney}</h3>
            <ol className="sa-role-flow-list">
              <li>
                <span>1</span>
                {locale === "ko" ? "Google 로그인으로 관리자 인증" : "Authenticate with Google sign-in"}
              </li>
              <li>
                <span>2</span>
                {locale === "ko" ? "템플릿/패키지 생성 및 코드 배포" : "Create templates/packages and issue codes"}
              </li>
              <li>
                <span>3</span>
                {locale === "ko" ? "응답 수집 후 CSV 내보내기" : "Collect responses and export CSV"}
              </li>
            </ol>
            <Link className="sa-btn-link" href={`/${locale}/auth/admin`}>
              {copy.adminQuick}
            </Link>
          </article>

          <article>
            <h3>{copy.platformJourney}</h3>
            <ol className="sa-role-flow-list">
              {platformLane.steps.map((step, idx) => (
                <li key={step}>
                  <span>{idx + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <Link className="sa-btn-link" href={platformLane.href}>
              {copy.platformQuick}
            </Link>
          </article>
        </div>
      </section>

      <footer className="sa-footer" style={{ paddingTop: 18 }}>
        <Link href={`/${locale}`}>{locale === "ko" ? "홈" : "Home"}</Link>
        <LegalLinks locale={locale} />
      </footer>
    </main>
  );
}
