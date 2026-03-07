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
      subtitle:
        "설문조사 도우미는 연구자가 설문 템플릿을 만들고, 패키지를 운영하고, 결과를 내려받고, 자신의 AI 도구와 함께 해석할 수 있도록 돕는 연구 운영 웹앱입니다.",
      meta: "최종 업데이트: 2026-03-07",
      note:
        "오픈소스로 공개되는 범위는 미들웨어 코드와 문서, 비식별 샘플입니다. 레거시 DB 덤프, 원본 응답, 개인정보는 공개 대상이 아닙니다.",
      sections: [
        {
          heading: "무엇을 할 수 있나요?",
          paragraphs: [
            "연구자는 일반 리커트 척도 설문 템플릿을 만들고, 여러 템플릿을 묶은 패키지를 운영할 수 있습니다.",
            "피검자는 참여코드를 입력해 설문에 응답하고, 남은 응답 횟수와 최근 응답 이력을 확인할 수 있습니다.",
          ],
        },
        {
          heading: "결과는 어떻게 활용하나요?",
          paragraphs: [
            "설문 결과는 ZIP 또는 CSV로 내려받을 수 있습니다. 패키지 개요, 응답 시도 이력, 코드북, 템플릿별 결과가 함께 정리됩니다.",
            "연구자는 자신의 API 키를 입력해 웹앱 안에서 결과 데이터와 AI 대화를 이어갈 수 있습니다.",
          ],
        },
        {
          heading: "앞으로의 확장 방향은 무엇인가요?",
          paragraphs: [
            "특수 템플릿 의뢰, SkillBook, 플랫폼 제공 AI, 크레딧/구독 운영은 연구 운영을 확장하는 유료 영역으로 발전합니다.",
            "기본 방향은 한국어 중심, 영어 보조, 시니어 친화적 UI, 민감 데이터 비공개 경계 유지입니다.",
          ],
        },
      ] satisfies Section[],
    };
  }

  return {
    title: "About",
    subtitle:
      "Survey Assistant helps researchers build survey templates, run package-based studies, export results, and work with AI using their own API keys.",
    meta: "Last updated: 2026-03-07",
    note:
      "The open-source boundary covers middleware code, documents, and sanitized samples only. Legacy database dumps, raw responses, and personal data stay private.",
    sections: [
      {
        heading: "What can you do here?",
        paragraphs: [
          "Researchers can create standard Likert templates and group multiple templates into a single survey package.",
          "Participants can join with an access code, answer assigned surveys, and review recent participation status.",
        ],
      },
      {
        heading: "How are results used?",
        paragraphs: [
          "Survey results can be exported as ZIP or CSV bundles including package overview, attempts, codebook, and template-level result files.",
          "Researchers can also continue AI conversations inside the app using their own API keys.",
        ],
      },
      {
        heading: "Where is the platform going next?",
        paragraphs: [
          "Special-template requests, SkillBooks, managed AI, and billing features expand the platform beyond the open-source core.",
          "The product direction stays centered on Korean-first UX, English support, senior-friendly design, and strict sensitive-data boundaries.",
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
    title: locale === "ko" ? "서비스 소개" : "About",
    description:
      locale === "ko"
        ? "설문조사 도우미 서비스 소개 페이지입니다."
        : "Learn what Survey Assistant does and how it is structured.",
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
      <div className="sa-static-page-note">{copy.note}</div>
    </StaticPageShell>
  );
}
