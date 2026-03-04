import Link from "next/link";

import { LegalLinks } from "@/components/LegalLinks";

type RoleLane = {
  href: string;
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
          lead: "피검자, 연구 관리자, 플랫폼 어드민을 분리 운영하는 연구소 전용 설문 미들웨어",
          helper:
            "설문 응답자는 참여코드로 빠르게 입장하고, 관리자는 템플릿/패키지/결과를 운영하며, 플랫폼 어드민은 정산과 의뢰를 관리합니다.",
        }
      : {
          title: "Survey Assistant",
          lead: "A role-based survey middleware for participants, research admins, and platform admins.",
          helper:
            "Participants join with survey codes, research admins run templates/packages/results, and platform admins operate settlements and request workflows.",
        };

  const lanes: RoleLane[] =
    locale === "ko"
      ? [
          {
            href: `/${locale}/auth/participant`,
            title: "설문 응답하러 왔어요",
            description: "피검자 전용 화면입니다. 익명형 계정을 만들고 참여코드를 입력해 바로 설문에 참여합니다.",
            cta: "피검자로 시작하기",
            steps: ["가입/로그인", "참여코드 입력", "응답 제출 및 진행률 확인"],
          },
          {
            href: `/${locale}/auth/admin`,
            title: "연구를 운영 중이에요",
            description:
              "연구 관리자 전용 화면입니다. 템플릿 생성부터 패키지 운영, 참여코드 발급, 결과 CSV 다운로드까지 처리합니다.",
            cta: "관리자 로그인하기",
            steps: ["템플릿 구성", "패키지 생성 + 참여코드 발급", "응답 데이터 CSV 다운로드"],
          },
          {
            href: `/${locale}/platform`,
            title: "플랫폼 운영자예요",
            description:
              "플랫폼 어드민 전용 콘솔입니다. 크레딧 원장, 특수 템플릿 의뢰 큐, 정산, 마이그레이션 요청을 관리합니다.",
            cta: "플랫폼 콘솔 열기",
            steps: ["의뢰 큐 처리", "스토어 정산 점검", "크레딧/마이그레이션 운영"],
          },
        ]
      : [
          {
            href: `/${locale}/auth/participant`,
            title: "I am here to respond",
            description: "Participant-only flow. Create an anonymous-style account and join surveys with a code.",
            cta: "Continue as participant",
            steps: ["Sign up / Sign in", "Enter survey code", "Submit and track progress"],
          },
          {
            href: `/${locale}/auth/admin`,
            title: "I run a study",
            description: "Research-admin flow for templates, packages, survey codes, and CSV exports.",
            cta: "Sign in as admin",
            steps: ["Build templates", "Create package + issue code", "Download result CSV"],
          },
          {
            href: `/${locale}/platform`,
            title: "I operate the platform",
            description: "Platform-admin console for credit ledger, special-request queue, settlements, and migrations.",
            cta: "Open platform console",
            steps: ["Process requests", "Review settlements", "Operate credits and migrations"],
          },
        ];

  return (
    <main className="sa-page sa-home">
      <section className="sa-home-hero">
        <p className="sa-home-kicker">{locale === "ko" ? "Role-Based Workspace" : "Role-Based Workspace"}</p>
        <h1>{copy.title}</h1>
        <p className="sa-home-lead">{copy.lead}</p>
        <p>{copy.helper}</p>
      </section>

      <ul className="sa-home-grid">
        {lanes.map((lane) => (
          <li key={lane.href}>
            <Link className="sa-home-card" href={lane.href}>
              <strong>{lane.title}</strong>
              <small>{lane.description}</small>
              <ol className="sa-home-flow">
                {lane.steps.map((step, idx) => (
                  <li key={step}>
                    <span>{idx + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <span className="sa-home-cta">{lane.cta}</span>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="sa-footer" style={{ paddingTop: 18 }}>
        <Link href={`/${locale}`}>{locale === "ko" ? "홈" : "Home"}</Link>
        <LegalLinks locale={locale} />
      </footer>
    </main>
  );
}
