import type { Metadata } from "next";

import { StaticPageShell } from "@/components/StaticPageShell";

type PageProps = {
  params: Promise<{ locale: string }>;
};

type Section = {
  heading: string;
  items: string[];
};

function getCopy(locale: "ko" | "en") {
  if (locale === "ko") {
    return {
      title: "개인정보처리방침",
      subtitle:
        "설문조사 도우미는 연구 운영에 필요한 최소한의 정보만 처리하며, 레거시 민감 데이터와 원본 응답 데이터는 공개 저장소에 포함하지 않습니다.",
      meta: "시행일: 2026년 3월 7일",
      sections: [
        {
          heading: "1. 어떤 정보를 처리하나요?",
          items: [
            "피검자 계정은 익명형 로그인 ID를 기준으로 관리합니다.",
            "연구자와 플랫폼 어드민 계정은 승인된 OAuth 제공자에서 전달된 이메일 등 최소 식별 정보를 사용합니다.",
            "서비스 이용 과정에서 접속 기록, 보안 로그, 응답 제출 이력 같은 운영 정보가 생성될 수 있습니다.",
          ],
        },
        {
          heading: "2. 왜 이 정보를 사용하나요?",
          items: [
            "설문 참여, 연구 운영, 권한 검증, 보안 감사, 오류 대응을 위해 사용합니다.",
            "결과 내보내기, AI 대화, SkillBook, 스토어, 결제 요청 같은 기능을 제공하기 위해 필요한 범위에서만 사용합니다.",
          ],
        },
        {
          heading: "3. AI와 외부 서비스는 어떻게 연결되나요?",
          items: [
            "연구자가 BYOK 방식으로 AI를 사용할 경우, 요청 시점에 선택한 외부 LLM 제공사로 데이터가 전달될 수 있습니다.",
            "호스팅과 데이터베이스, OAuth 인증 등은 외부 인프라 제공사를 통해 운영될 수 있습니다.",
            "결제 게이트웨이는 준비 중이며, 실제 결제 모달과 자동 정기결제는 아직 연결되지 않았습니다.",
          ],
        },
        {
          heading: "4. 데이터는 얼마나 보관하나요?",
          items: [
            "서비스 운영에 필요한 범위 안에서만 보관합니다.",
            "비활성화, 익명화, 삭제 요청이 있으면 관련 법령상 보존 의무가 없는 데이터부터 정리합니다.",
          ],
        },
        {
          heading: "5. 공개 저장소와 민감 데이터 경계는 어떻게 관리하나요?",
          items: [
            "오픈소스로 공개되는 것은 코드, 문서, 비식별 샘플, 공개 가능한 특수 템플릿 구현물입니다.",
            "레거시 DB 덤프, 접속 IP 원문, 회원정보, 원본 응답 데이터는 공개 대상이 아닙니다.",
          ],
        },
        {
          heading: "6. 문의는 어디로 하나요?",
          items: [
            "개인정보 처리나 삭제 요청은 문의 페이지 또는 `sicpseoul@gmail.com`으로 접수할 수 있습니다.",
          ],
        },
      ] satisfies Section[],
    };
  }

  return {
    title: "Privacy Policy",
    subtitle:
      "Survey Assistant processes only the minimum data required for research operations and keeps legacy sensitive data outside public repositories.",
    meta: "Effective date: 2026-03-07",
    sections: [
      {
        heading: "1. What data do we process?",
        items: [
          "Participant accounts are managed with anonymous-style login identifiers.",
          "Research-admin and platform-admin accounts use minimal profile data from approved OAuth providers.",
          "Operational records such as access logs, audit trails, and response timestamps may be generated during use.",
        ],
      },
      {
        heading: "2. Why do we use this data?",
        items: [
          "The data is used for survey participation, research operations, access control, security review, and incident response.",
          "It is also used only as needed to provide exports, AI conversations, SkillBooks, store features, and billing requests.",
        ],
      },
      {
        heading: "3. How do AI and external services interact?",
        items: [
          "When a researcher uses BYOK AI, selected package data may be sent to the chosen external LLM provider at request time.",
          "Hosting, database, and OAuth authentication may rely on external infrastructure providers.",
          "Payment gateway onboarding is still in progress, and hosted checkout / recurring billing are not yet activated.",
        ],
      },
      {
        heading: "4. How long do we keep data?",
        items: [
          "Data is retained only within operational necessity.",
          "When deactivation, anonymization, or deletion is requested, removable data is cleared unless retention is required by law.",
        ],
      },
      {
        heading: "5. What is the open-source boundary?",
        items: [
          "Public repositories contain code, documentation, sanitized samples, and publishable special-template implementations.",
          "Legacy database dumps, raw IP logs, member records, and raw survey responses are not public assets.",
        ],
      },
      {
        heading: "6. Contact",
        items: [
          "Privacy and deletion requests can be sent through the contact page or to `sicpseoul@gmail.com`.",
        ],
      },
    ] satisfies Section[],
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return {
    title: locale === "ko" ? "개인정보처리방침" : "Privacy Policy",
    description:
      locale === "ko"
        ? "설문조사 도우미 개인정보처리방침입니다."
        : "Privacy policy for Survey Assistant.",
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";
  const copy = getCopy(locale);

  return (
    <StaticPageShell
      locale={locale}
      title={copy.title}
      subtitle={copy.subtitle}
      meta={copy.meta}
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
    </StaticPageShell>
  );
}
