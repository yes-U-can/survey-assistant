import type { Metadata } from "next";

import { StaticPageShell } from "@/components/StaticPageShell";

type PageProps = {
  params: Promise<{ locale: string }>;
};

type Section = {
  heading: string;
  items: string[];
};

const SUPPORT_EMAIL = "mow.coding@gmail.com";

function getCopy(locale: "ko" | "en") {
  if (locale === "ko") {
    return {
      title: "이용약관",
      subtitle: "Survey Assistant 서비스 이용 기본 규칙",
      meta: "시행일: 2026년 3월 8일",
      intro:
        "이 약관은 설문조사 도우미(Survey Assistant)를 사용하는 피검자, 연구자, 플랫폼 운영자 간의 기본 역할과 책임을 설명합니다. 법률 자문 문서라기보다 현재 서비스 운영 상태와 제품 정책을 반영한 서비스 약관의 초안 성격을 가집니다.",
      sections: [
        {
          heading: "1. 역할과 접근 방식",
          items: [
            "서비스는 피검자, 연구자, 플랫폼 운영자 역할을 구분합니다.",
            "피검자는 익명형 계정과 참여코드 기반으로 설문에 참여합니다.",
            "연구자와 플랫폼 운영자는 Google 로그인 및 권한 확인을 거쳐 접근합니다.",
          ],
        },
        {
          heading: "2. 무료 코어 기능",
          items: [
            "일반 리커트 템플릿 작성, 패키지 운영, 피검자 응답 수집, ZIP/CSV 내보내기, BYOK AI 대화는 무료 코어 범위에 포함됩니다.",
            "무료 코어는 연구자가 기본 설문을 운영하고 결과를 정리하는 데 필요한 최소 기능을 공개 미들웨어로 제공하는 것을 목표로 합니다.",
          ],
        },
        {
          heading: "3. 유료 운영 기능",
          items: [
            "특수 템플릿 의뢰, SkillBook 스토어, Managed AI, 크레딧, 구독형 운영 기능은 유료 운영 레이어에 속합니다.",
            "현재 앱 내부에는 요청 등록과 운영 승인 흐름이 포함되어 있으며, 실제 외부 결제창과 자동 정기결제는 결제 게이트웨이 연동 이후 활성화됩니다.",
          ],
        },
        {
          heading: "4. AI 기능과 책임",
          items: [
            "BYOK AI는 연구자가 자신의 API 키를 사용해 외부 LLM 제공사를 호출하는 기능입니다.",
            "Managed AI는 플랫폼이 제공하는 계산 자원을 사용하는 기능으로, 향후 크레딧 정책과 함께 운영됩니다.",
            "AI 출력은 연구 보조 자료이며, 최종 해석과 판단 책임은 연구자에게 있습니다.",
          ],
        },
        {
          heading: "5. 오픈소스 공개 범위",
          items: [
            "서비스 코어 코드, 문서, 비식별 예시, 공개가 허용된 구현물은 공개 저장소에 포함될 수 있습니다.",
            "레거시 DB 백업, 회원 정보, 접속 기록, 원본 응답 데이터 등 민감 정보는 공개 범위에 포함되지 않습니다.",
            "특수 템플릿 구현물은 의뢰 동의와 공개 정책에 따라 공개될 수 있으며, 공개 여부와 보상 지급은 별도로 처리됩니다.",
          ],
        },
        {
          heading: "6. 금지 행위",
          items: [
            "권한 우회, 무단 접근, 원장 변조 시도, 민감 데이터 유출 시도는 금지됩니다.",
            "타인의 개인정보나 원본 응답 데이터를 정당한 근거 없이 업로드하거나 공유하는 행위는 금지됩니다.",
            "서비스를 방해하거나 운영 인프라에 과도한 부하를 주는 자동화 남용도 금지됩니다.",
          ],
        },
        {
          heading: "7. 서비스 변경과 중단",
          items: [
            "서비스는 개발 단계에 있으므로 기능, 정책, UI, 외부 연동 범위가 변경될 수 있습니다.",
            "중요한 변경은 서비스 화면, 문서, 또는 운영 공지를 통해 안내합니다.",
          ],
        },
        {
          heading: "8. 문의",
          items: [
            "약관, 권한, 운영 정책, 협업, 의뢰 관련 문의는 문의하기 페이지 또는 아래 이메일로 접수할 수 있습니다.",
            `문의 이메일: ${SUPPORT_EMAIL}`,
          ],
        },
      ] satisfies Section[],
      noteTitle: "현재 상태에 대한 고지",
      note:
        "이 약관은 현재 구현된 제품과 운영 계획을 기준으로 작성되었습니다. 결제 게이트웨이, 자동 정기결제, 일부 상업 기능은 아직 외부 심사와 연동 준비가 끝나지 않았으므로 활성화 시점에 맞춰 약관도 함께 보완됩니다.",
    };
  }

  return {
    title: "Terms of Service",
    subtitle: "Core usage rules for Survey Assistant",
    meta: "Effective date: March 8, 2026",
    intro:
      "These terms describe the current operating rules for participants, researchers, and platform operators using Survey Assistant. They reflect the current implementation and product policy rather than a fully expanded commercial legal package.",
    sections: [
      {
        heading: "1. Roles and access",
        items: [
          "The service separates participant, researcher, and platform-operator roles.",
          "Participants join surveys with anonymous-style accounts and access codes.",
          "Researchers and platform operators sign in through Google and must pass role checks.",
        ],
      },
      {
        heading: "2. Free core features",
        items: [
          "Standard Likert template creation, package operations, participant response collection, ZIP/CSV exports, and BYOK AI chat belong to the free open-source core.",
          "The purpose of this free core is to keep baseline survey operations reusable as public middleware.",
        ],
      },
      {
        heading: "3. Paid operational features",
        items: [
          "Special-template requests, the SkillBook store, Managed AI, credits, and subscription operations belong to the paid service layer.",
          "The app already contains request and approval flows, but hosted checkout and recurring billing remain pending external gateway onboarding.",
        ],
      },
      {
        heading: "4. AI features and responsibility",
        items: [
          "BYOK AI uses the researcher's own API key to call external LLM providers.",
          "Managed AI uses platform-provided compute resources and will follow platform credit policy.",
          "AI output is assistive research material and does not replace final professional judgment.",
        ],
      },
      {
        heading: "5. Open-source publication boundary",
        items: [
          "Core code, documents, sanitized examples, and publishable implementation artifacts may appear in public repositories.",
          "Legacy database backups, member data, access logs, and raw survey responses are outside that public boundary.",
          "Special-template implementation code may be published depending on request consent and publication policy, while compensation remains a separate matter.",
        ],
      },
      {
        heading: "6. Prohibited use",
        items: [
          "Privilege bypass, unauthorized access, ledger tampering attempts, and sensitive-data leakage attempts are prohibited.",
          "Uploading or sharing personal data or raw response data without proper basis is prohibited.",
          "Abusive automation or activity that harms service stability is also prohibited.",
        ],
      },
      {
        heading: "7. Service changes and interruptions",
        items: [
          "Because the product is still evolving, features, policies, UI, and external integrations may change.",
          "Material changes will be announced through the service UI, documentation, or operational notices.",
        ],
      },
      {
        heading: "8. Contact",
        items: [
          "Questions about terms, access policy, operations, collaboration, or custom work can be sent through the contact page or the email below.",
          `Support email: ${SUPPORT_EMAIL}`,
        ],
      },
    ] satisfies Section[],
    noteTitle: "Current-state notice",
    note:
      "These terms reflect the current implementation and rollout stage. Billing gateway integration, recurring subscription charging, and some business features will be expanded later, and the terms will be revised together when those capabilities go live.",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return {
    title: locale === "ko" ? "이용약관" : "Terms of Service",
    description:
      locale === "ko"
        ? "설문조사 도우미의 현재 운영 규칙과 역할별 기본 책임을 설명합니다."
        : "Core operating rules and role responsibilities for Survey Assistant.",
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";
  const copy = getCopy(locale);

  return (
    <StaticPageShell
      locale={locale}
      title={copy.title}
      subtitle={copy.subtitle}
      meta={copy.meta}
      intro={copy.intro}
    >
      <div className="sa-static-page-sections">
        {copy.sections.map((section) => (
          <section key={section.heading} className="sa-static-page-section">
            <h2>{section.heading}</h2>
            <ul className="sa-static-page-list">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <aside className="sa-static-page-note">
        <strong>{copy.noteTitle}</strong>
        <p>{copy.note}</p>
      </aside>
    </StaticPageShell>
  );
}
