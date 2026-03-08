import type { Metadata } from "next";

import { StaticPageShell } from "@/components/StaticPageShell";

type PageProps = {
  params: Promise<{ locale: string }>;
};

type Section = {
  heading: string;
  paragraphs: string[];
};

function getCopy(locale: "ko" | "en") {
  if (locale === "ko") {
    return {
      title: "서비스 소개",
      subtitle: "연구자를 위한 설문 운영 및 AI 해석 미들웨어",
      meta: "최종 업데이트: 2026년 3월 8일",
      intro:
        "설문조사 도우미(Survey Assistant)는 연구자가 설문 템플릿을 만들고, 여러 설문을 하나의 패키지로 운영하고, 결과를 정리해 다시 해석 단계로 넘길 수 있도록 돕는 연구 운영 웹앱입니다. 서울임상심리연구소의 실제 운영 맥락에서 출발했지만, 장기적으로는 다른 연구실과 기관도 가져다 쓸 수 있는 오픈소스 미들웨어를 목표로 합니다.",
      sections: [
        {
          heading: "왜 이 서비스가 필요한가요?",
          paragraphs: [
            "기존 설문 시스템은 템플릿 관리, 패키지 운영, 결과 다운로드, 회원 관리 같은 기본 흐름이 낡고 불편했습니다. 설문을 실제로 운영하는 연구자 입장에서는 화면이 복잡하고, 결과 정리가 어렵고, 다시 분석 단계로 넘기는 과정도 매끄럽지 않았습니다.",
            "설문조사 도우미는 이 병목을 줄이는 데 초점을 둡니다. 연구자는 설문을 만들고 배포하고 회수하는 데 집중하고, 피검자는 참여코드만으로 직관적으로 설문에 들어갈 수 있어야 한다는 원칙으로 설계했습니다.",
          ],
        },
        {
          heading: "무료 오픈소스 코어는 어디까지인가요?",
          paragraphs: [
            "무료 코어 범위는 명확합니다. 일반 리커트 척도 설문 템플릿 작성, 패키지 운영, 피검자 응답 수집, 결과 ZIP/CSV 다운로드, 그리고 연구자가 자신의 API 키를 사용해 AI와 결과를 대화형으로 검토하는 기능까지입니다.",
            "즉, 기본 설문 운영과 기본적인 AI 활용까지는 누구나 가져다 쓸 수 있는 공개 미들웨어로 유지하고, 그 위에 유료 운영 기능을 단계적으로 얹는 구조를 취합니다.",
          ],
        },
        {
          heading: "AI 기능은 왜 웹앱 안에 있나요?",
          paragraphs: [
            "단순히 CSV를 내려받아 외부 AI 서비스에 업로드하는 것만으로는 연구 방법론이 보존되지 않습니다. 이 서비스는 패키지 데이터 구조와 코드북, 그리고 연구자가 정리한 SkillBook을 함께 사용해 해석 문맥을 유지하려는 방향을 갖고 있습니다.",
            "무료 코어에서는 연구자가 본인 API 키를 직접 사용하고, 이후 유료 운영 단계에서는 Managed AI, SkillBook Builder, 스토어 같은 고도화 기능으로 확장됩니다.",
          ],
        },
        {
          heading: "민감한 데이터와 공개 범위는 어떻게 나뉘나요?",
          paragraphs: [
            "이 프로젝트는 오픈소스를 지향하지만, 모든 데이터가 공개 대상은 아닙니다. 공개 가능한 것은 코드, 문서, 비식별 예시, 공개가 허용된 특수 템플릿 구현물입니다.",
            "반대로 레거시 웹/DB 백업, 접속 기록 IP, 회원 정보, 원본 응답 데이터 같은 민감한 자료는 절대 공개 저장소에 올리지 않는다는 원칙을 유지합니다. 이 경계는 개발 과정에서도 계속 유지됩니다.",
          ],
        },
        {
          heading: "앞으로 어떤 방향으로 확장되나요?",
          paragraphs: [
            "특수 템플릿 의뢰, SkillBook 저장/공유/스토어, 플랫폼 제공 AI, 크레딧/구독 운영, 데이터 마이그레이션 같은 영역이 이후 확장 범위입니다.",
            "동시에 시니어 연구자도 쉽게 쓸 수 있도록 큰 글자, 짧은 문구, 직관적인 그림, 단순한 흐름을 제품 원칙으로 유지합니다. 기능이 늘어나더라도 기본 사용 경험이 복잡해지지 않도록 통제하는 것이 중요합니다.",
          ],
        },
      ] satisfies Section[],
      noteTitle: "운영 원칙",
      note:
        "설문조사 도우미는 기본적으로 한국어 우선, 영어 보조, 시니어 친화 UI, 민감 데이터 비공개 경계를 핵심 원칙으로 유지합니다. 연구자에게 필요한 표준 기능은 공개하고, 사람 손이 많이 드는 운영 기능과 계산 비용이 드는 기능은 별도 BM으로 분리합니다.",
    };
  }

  return {
    title: "About",
    subtitle: "Survey operations and AI interpretation middleware for researchers",
    meta: "Last updated: March 8, 2026",
    intro:
      "Survey Assistant is a research operations web app that helps researchers create survey templates, run multi-template packages, export structured results, and move directly into AI-assisted interpretation. It started from a real lab workflow and is being shaped toward an open-source middleware other research teams can reuse.",
    sections: [
      {
        heading: "Why does this service exist?",
        paragraphs: [
          "Older survey systems often made template management, package operations, exports, and participant administration unnecessarily difficult. Researchers need a tool that reduces operational friction instead of adding another layer of clerical work.",
          "Survey Assistant is built around that idea: researchers should be able to set up and run studies clearly, and participants should be able to enter with a code and complete assigned surveys without confusion.",
        ],
      },
      {
        heading: "What belongs to the free open-source core?",
        paragraphs: [
          "The free core includes standard Likert template creation, package operations, participant response collection, ZIP/CSV exports, and BYOK AI conversations using the researcher's own API key.",
          "In other words, the baseline survey workflow stays open and reusable, while advanced operational services can be layered on top separately.",
        ],
      },
      {
        heading: "Why keep AI inside the app at all?",
        paragraphs: [
          "Exporting CSV files to an external AI tool is possible, but it loses product-specific context such as package structure, codebook semantics, and later SkillBook guidance.",
          "Survey Assistant keeps the door open for AI that understands both the dataset and the research workflow, rather than acting like a generic file-upload chat wrapper.",
        ],
      },
      {
        heading: "What is public and what stays private?",
        paragraphs: [
          "Open-source publication covers code, documentation, sanitized examples, and publishable special-template implementations.",
          "Legacy database backups, IP logs, member records, and raw response data are outside that boundary and remain private.",
        ],
      },
      {
        heading: "Where is the platform going next?",
        paragraphs: [
          "Future expansion includes special-template requests, SkillBook sharing and store flows, managed AI, credits and subscriptions, and migration workflows for institutions moving from legacy systems.",
          "At the same time, the product stays committed to Korean-first UX, English support, senior-friendly accessibility, and strict sensitive-data handling boundaries.",
        ],
      },
    ] satisfies Section[],
    noteTitle: "Operating principles",
    note:
      "Survey Assistant keeps four product principles fixed: Korean-first UX, English support, senior-friendly clarity, and strict private-data boundaries. Standard research features stay open; high-touch services and compute-heavy features are separated as business layers.",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return {
    title: locale === "ko" ? "서비스 소개" : "About",
    description:
      locale === "ko"
        ? "설문조사 도우미가 어떤 문제를 해결하고 어디까지를 오픈소스 코어로 제공하는지 설명합니다."
        : "Learn what Survey Assistant solves and where the open-source core boundary sits.",
  };
}

export default async function AboutPage({ params }: PageProps) {
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
            <div className="sa-static-page-copy">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
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
