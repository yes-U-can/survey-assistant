import type { Metadata } from "next";

import { StaticPageShell } from "@/components/StaticPageShell";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const SUPPORT_EMAIL = "sicpseoul@gmail.com";

function getCopy(locale: "ko" | "en") {
  if (locale === "ko") {
    return {
      title: "문의하기",
      subtitle:
        "서비스 운영, 버그 제보, 계정 문제, 개인정보 관련 문의는 아래 채널을 이용해 주세요.",
      panels: {
        emailTitle: "문의 이메일",
        emailGuide: "일반적으로 영업일 기준 2~3일 이내에 답변드립니다.",
        topicsTitle: "이런 문의에 적합합니다",
        topics: [
          "연구자 로그인 또는 권한 문제",
          "피검자 참여코드 / 응답 흐름 문제",
          "데이터 내보내기 및 AI 기능 오류",
          "개인정보 처리 또는 데이터 삭제 요청",
        ],
        noteTitle: "문의 전 확인해 주세요",
        notes: [
          "사용 중인 역할(피검자 / 연구자 / 플랫폼 어드민)을 함께 적어 주세요.",
          "오류 화면이 있다면 스크린샷과 재현 순서를 함께 보내 주세요.",
          "민감한 응답 원본이나 개인정보는 메일 본문에 그대로 붙여 넣지 마세요.",
        ],
      },
    };
  }

  return {
    title: "Contact",
    subtitle:
      "Use the channel below for service operations, bug reports, account issues, and privacy-related requests.",
    panels: {
      emailTitle: "Support Email",
      emailGuide: "Typical response time is within 2-3 business days.",
      topicsTitle: "Good topics for this channel",
      topics: [
        "Research-admin login or permission issues",
        "Participant access-code or response-flow problems",
        "Export or AI feature errors",
        "Privacy or data-deletion requests",
      ],
      noteTitle: "Please include",
      notes: [
        "Tell us whether you were using the participant, research-admin, or platform-admin flow.",
        "Attach screenshots and clear reproduction steps when reporting bugs.",
        "Do not paste raw sensitive responses or personal information directly into the email body.",
      ],
    },
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return {
    title: locale === "ko" ? "문의하기" : "Contact",
    description:
      locale === "ko"
        ? "설문조사 도우미 문의 페이지입니다."
        : "Contact Survey Assistant for support and privacy requests.",
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";
  const copy = getCopy(locale);

  return (
    <StaticPageShell locale={locale} title={copy.title} subtitle={copy.subtitle}>
      <div className="sa-contact-grid">
        <section className="sa-contact-panel">
          <h2>{copy.panels.emailTitle}</h2>
          <a className="sa-contact-email" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          <p>{copy.panels.emailGuide}</p>
        </section>

        <section className="sa-contact-panel">
          <h2>{copy.panels.topicsTitle}</h2>
          <ul className="sa-static-page-list">
            {copy.panels.topics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="sa-contact-panel sa-contact-panel-wide">
          <h2>{copy.panels.noteTitle}</h2>
          <ul className="sa-static-page-list">
            {copy.panels.notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </StaticPageShell>
  );
}
