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
      title: "개인정보처리방침",
      subtitle: "Survey Assistant 개인정보 및 데이터 처리 안내",
      meta: "시행일: 2026년 3월 8일",
      intro:
        "설문조사 도우미는 연구 운영에 필요한 최소 범위의 정보만 처리하려고 합니다. 특히 과거 레거시 웹/DB 백업, 회원 정보, 접속 기록, 원본 설문 응답 데이터처럼 민감한 자료는 공개 저장소와 분리된 비공개 경계 안에서만 다룬다는 원칙을 유지합니다.",
      sections: [
        {
          heading: "1. 어떤 정보를 처리하나요?",
          items: [
            "피검자 계정은 익명형 로그인 ID와 설문 응답 이력 중심으로 처리됩니다.",
            "연구자와 플랫폼 운영자는 Google 로그인 과정에서 전달되는 최소한의 계정 식별 정보로 처리됩니다.",
            "서비스 이용 과정에서 접속 기록, 보안 로그, 응답 제출 시각, 권한 변경 이력 같은 운영 데이터가 생성될 수 있습니다.",
          ],
        },
        {
          heading: "2. 왜 이 정보를 사용하나요?",
          items: [
            "설문 참여, 연구 운영, 권한 검증, 보안 감사, 장애 대응을 위해 사용합니다.",
            "결과 내보내기, BYOK AI 대화, SkillBook, 스토어, 결제 요청 같은 기능을 제공하는 데 필요한 범위에서만 사용합니다.",
          ],
        },
        {
          heading: "3. AI와 외부 서비스는 어떻게 연결되나요?",
          items: [
            "연구자가 BYOK AI를 사용할 경우, 요청 시점에 선택한 외부 LLM 제공사로 필요한 데이터가 전달될 수 있습니다.",
            "호스팅, 데이터베이스, OAuth 인증, 향후 결제 게이트웨이 같은 영역은 외부 인프라 제공사를 통해 운영될 수 있습니다.",
            "단, 연구자가 직접 붙인 API 키와 AI 요청 데이터는 사용자가 실행한 기능 범위 안에서만 처리되어야 하며, 불필요한 장기 저장을 기본값으로 두지 않습니다.",
          ],
        },
        {
          heading: "4. 데이터는 얼마나 보관하나요?",
          items: [
            "서비스 운영과 연구 관리에 필요한 범위 안에서만 보관합니다.",
            "법령상 보존 의무가 없는 경우, 비활성화·삭제·비식별화 요청이 접수되면 정리 가능한 데이터를 우선 정리합니다.",
          ],
        },
        {
          heading: "5. 공개 저장소와 민감 데이터의 경계는 어떻게 관리하나요?",
          items: [
            "공개 저장소에는 코드, 문서, 비식별 예시, 공개 가능한 구현물만 포함됩니다.",
            "레거시 DB 백업, 회원 정보, 접속 IP, 원본 응답 데이터, 민감한 기관 데이터는 공개 범위에 포함되지 않습니다.",
            "개발 과정에서도 민감 데이터를 실수로 공개 저장소에 올리지 않도록 별도 경계를 유지합니다.",
          ],
        },
        {
          heading: "6. 정보주체는 어떤 요청을 할 수 있나요?",
          items: [
            "개인정보 처리 문의, 삭제 요청, 비식별화 요청, 운영 관련 문의를 접수할 수 있습니다.",
            "요청 시 본인 확인과 요청 범위를 먼저 확인할 수 있으며, 민감 데이터의 경우 바로 원본을 받기보다 최소한의 설명과 예시부터 요청할 수 있습니다.",
          ],
        },
        {
          heading: "7. 문의처",
          items: [
            "개인정보 처리나 삭제 요청은 문의하기 페이지 또는 아래 이메일로 접수할 수 있습니다.",
            `문의 이메일: ${SUPPORT_EMAIL}`,
          ],
        },
      ] satisfies Section[],
      noteTitle: "중요한 원칙",
      note:
        "오픈소스 공개와 실제 운영 데이터 처리는 분리됩니다. 제품 설계도는 공개될 수 있지만, 실제 기관의 회원 정보, 원본 응답, 레거시 백업 데이터는 공개 자산이 아닙니다.",
    };
  }

  return {
    title: "Privacy Policy",
    subtitle: "How Survey Assistant handles personal and operational data",
    meta: "Effective date: March 8, 2026",
    intro:
      "Survey Assistant aims to process only the minimum information necessary for research operations. In particular, legacy backups, member records, access logs, and raw survey responses remain outside public repositories and stay inside a private operational boundary.",
    sections: [
      {
        heading: "1. What data is processed?",
        items: [
          "Participant accounts are handled mainly through anonymous-style login identifiers and response history.",
          "Researcher and platform-operator accounts use minimal Google-based account identity data.",
          "Operational records such as access logs, security logs, submission timestamps, and permission-change history may be generated.",
        ],
      },
      {
        heading: "2. Why is this data used?",
        items: [
          "It is used for survey participation, research operations, access control, security review, and incident response.",
          "It may also be used only as needed for exports, BYOK AI conversations, SkillBooks, store functions, and billing-request operations.",
        ],
      },
      {
        heading: "3. How do AI and external services interact?",
        items: [
          "When a researcher uses BYOK AI, necessary data may be sent to the selected external LLM provider at request time.",
          "Hosting, database, OAuth, and future payment gateway operations may depend on external infrastructure providers.",
          "User-supplied API keys and AI request data should only be handled within the scope of the requested feature, and long-term retention is not the default path.",
        ],
      },
      {
        heading: "4. How long is data kept?",
        items: [
          "Data is kept only within operational necessity and research-management need.",
          "If there is no legal retention requirement, removable data should be cleared when deactivation, deletion, or anonymization is requested.",
        ],
      },
      {
        heading: "5. How is the boundary between public code and sensitive data managed?",
        items: [
          "Public repositories contain code, documentation, sanitized examples, and publishable implementation artifacts only.",
          "Legacy database backups, member records, IP logs, and raw response datasets are outside that public boundary.",
          "The development process also keeps a deliberate separation so sensitive data is not pushed to public remotes by mistake.",
        ],
      },
      {
        heading: "6. What requests can a data subject make?",
        items: [
          "Users may send privacy, deletion, anonymization, and operations-related requests.",
          "Requests may require identity and scope confirmation first, and sensitive-data review usually starts from the smallest safe example rather than a raw full dump.",
        ],
      },
      {
        heading: "7. Contact",
        items: [
          "Privacy and deletion requests can be sent through the contact page or the email below.",
          `Support email: ${SUPPORT_EMAIL}`,
        ],
      },
    ] satisfies Section[],
    noteTitle: "Key principle",
    note:
      "Open-source publication and live operational data handling are separate concerns. The product blueprint may be public, but real institution records, raw responses, and legacy backup data are not public assets.",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return {
    title: locale === "ko" ? "개인정보처리방침" : "Privacy Policy",
    description:
      locale === "ko"
        ? "설문조사 도우미의 개인정보 처리 원칙과 민감 데이터 공개 경계를 설명합니다."
        : "Privacy principles and sensitive-data boundary policy for Survey Assistant.",
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
