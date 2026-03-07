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
      title: "이용약관",
      subtitle:
        "이 약관은 설문조사 도우미를 이용하는 피검자, 연구자, 플랫폼 운영자 사이의 기본 이용 원칙과 책임 범위를 설명합니다.",
      meta: "시행일: 2026년 3월 7일",
      sections: [
        {
          heading: "1. 역할과 계정",
          items: [
            "서비스는 피검자, 연구자, 플랫폼 어드민 역할을 구분합니다.",
            "피검자는 익명형 계정으로 설문에 참여할 수 있습니다.",
            "연구자와 플랫폼 어드민은 승인된 OAuth 로그인과 권한 검증을 거쳐야 합니다.",
          ],
        },
        {
          heading: "2. 무료 코어 기능",
          items: [
            "일반 리커트 템플릿 생성, 패키지 운영, 설문 응답, 결과 다운로드, BYOK AI 대화는 서비스의 핵심 기능입니다.",
            "결과 다운로드는 기본적으로 ZIP 형태이며, 필요 시 master CSV 형식으로도 받을 수 있습니다.",
          ],
        },
        {
          heading: "3. 유료 기능과 운영 기능",
          items: [
            "특수 템플릿 의뢰, SkillBook 스토어, Managed AI, 구독 플랜, 크레딧 충전 요청은 유료 운영 영역에 속합니다.",
            "현재 결제 요청과 운영 승인 흐름은 구현되어 있으나, 외부 결제 모달과 자동 정기결제는 준비 중입니다.",
          ],
        },
        {
          heading: "4. 오픈소스와 공개 경계",
          items: [
            "미들웨어 코드와 문서는 공개될 수 있습니다.",
            "특수 템플릿 구현 코드는 의뢰 동의 정책과 MIT 공개 가능성에 따라 공개될 수 있습니다.",
            "민감한 레거시 데이터와 원본 응답 데이터는 공개 대상이 아닙니다.",
          ],
        },
        {
          heading: "5. 금지되는 사용",
          items: [
            "권한 우회, 무단 접근, 원장 변조 시도, 민감 데이터 유출 시도는 금지됩니다.",
            "AI 출력은 연구 보조용 참고자료이며, 최종 연구 판단이나 임상 판단을 대신하지 않습니다.",
          ],
        },
        {
          heading: "6. 문의와 변경",
          items: [
            "서비스 정책은 운영 필요에 따라 변경될 수 있으며, 중요한 변경은 서비스 화면이나 문서를 통해 고지합니다.",
            "문의는 문의하기 페이지 또는 `sicpseoul@gmail.com`으로 접수할 수 있습니다.",
          ],
        },
      ] satisfies Section[],
    };
  }

  return {
    title: "Terms of Service",
    subtitle:
      "These terms explain the basic rules and responsibilities for participants, researchers, and platform operators using Survey Assistant.",
    meta: "Effective date: 2026-03-07",
    sections: [
      {
        heading: "1. Roles and accounts",
        items: [
          "The service separates participant, research-admin, and platform-admin roles.",
          "Participants can join surveys with anonymous-style accounts.",
          "Research-admin and platform-admin access requires approved OAuth sign-in and role verification.",
        ],
      },
      {
        heading: "2. Free core features",
        items: [
          "Standard Likert template creation, package operations, survey response flow, result export, and BYOK AI chat form the core feature set.",
          "Results are exported as ZIP bundles by default, with a master CSV option for compatibility.",
        ],
      },
      {
        heading: "3. Paid and operational features",
        items: [
          "Special-template requests, the SkillBook store, managed AI, subscription plans, and credit top-up requests belong to the paid operations layer.",
          "Request and approval flows are already implemented, while hosted checkout and recurring billing are still pending external gateway onboarding.",
        ],
      },
      {
        heading: "4. Open-source boundary",
        items: [
          "Middleware code and documentation may be published publicly.",
          "Special-template implementation code may also be published depending on request consent and MIT publication policy.",
          "Sensitive legacy data and raw survey responses are never part of the public boundary.",
        ],
      },
      {
        heading: "5. Prohibited use",
        items: [
          "Privilege bypass, unauthorized access, ledger tampering attempts, and sensitive-data leakage attempts are prohibited.",
          "AI output is an assistive research tool and does not replace final research or clinical judgment.",
        ],
      },
      {
        heading: "6. Contact and changes",
        items: [
          "Policies may change as the service evolves, and major updates will be announced in the service UI or documents.",
          "Questions can be sent through the contact page or to `sicpseoul@gmail.com`.",
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
    title: locale === "ko" ? "이용약관" : "Terms of Service",
    description:
      locale === "ko"
        ? "설문조사 도우미 이용약관입니다."
        : "Terms of service for Survey Assistant.",
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
