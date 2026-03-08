import type { Metadata } from "next";

import { StaticPageShell } from "@/components/StaticPageShell";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const SUPPORT_EMAIL = "mow.coding@gmail.com";

type FaqItem = {
  question: string;
  answer: string;
};

function buildMailto(params: { subject: string; body: string }) {
  const query = new URLSearchParams({
    subject: params.subject,
    body: params.body,
  });

  return `mailto:${SUPPORT_EMAIL}?${query.toString()}`;
}

function getCopy(locale: "ko" | "en") {
  if (locale === "ko") {
    return {
      title: "문의하기",
      subtitle: "운영 문의, 버그 제보, 데이터 요청, 협업 제안",
      meta: "기본 응답 시간: 영업일 기준 2~3일",
      intro:
        "서비스 운영, 계정 권한, 설문 진행 오류, 내보내기 문제, 개인정보 처리 요청은 이 페이지의 안내를 따라 문의할 수 있습니다. 기능 설명보다 재현 상황과 화면 캡처가 더 중요하므로, 문의 시에는 사용 중인 역할과 단계별 상황을 함께 적어 주세요.",
      emailTitle: "문의 이메일",
      emailGuide:
        "이 주소는 운영 문의와 개발 문의를 함께 받는 공식 채널입니다. 민감한 원본 응답 데이터는 본문에 그대로 붙여 넣지 말고, 문제가 무엇인지 먼저 설명해 주세요.",
      topicsTitle: "이런 문의에 적합합니다",
      topics: [
        "연구자 로그인 또는 권한 연결 문제",
        "피검자 참여코드 등록 또는 응답 흐름 오류",
        "ZIP/CSV 내보내기, SkillBook, AI 기능 이상",
        "개인정보 처리, 삭제, 비식별화 관련 요청",
        "특수 템플릿, 데이터 마이그레이션, 협업 제안",
      ],
      faqTitle: "자주 묻는 질문",
      faq: [
        {
          question: "문의할 때 어떤 정보를 함께 보내야 하나요?",
          answer:
            "사용 중이던 역할(피검자/연구자/플랫폼 운영자), 어떤 화면에서 문제가 났는지, 재현 순서, 기대했던 동작, 실제 결과를 같이 적어 주세요. 화면 캡처가 있으면 해결 속도가 빨라집니다.",
        },
        {
          question: "민감한 응답 데이터도 메일로 보내면 되나요?",
          answer:
            "원칙적으로 권장하지 않습니다. 먼저 어떤 데이터인지, 왜 필요한지, 어느 범위까지 전달 가능한지 설명해 주세요. 필요 시 비식별화된 일부 예시만 요청할 수 있습니다.",
        },
        {
          question: "버그 제보와 기능 제안은 같은 채널로 보내나요?",
          answer:
            "같은 이메일로 보내도 됩니다. 다만 제목에 [버그 제보], [기능 제안], [권한 문의] 같은 말머리를 붙이면 분류가 더 쉬워집니다.",
        },
        {
          question: "협업이나 특수 템플릿 제작도 이 채널로 문의하나요?",
          answer:
            "맞습니다. 특수 템플릿 의뢰, 데이터 마이그레이션, 협업 제안도 이 채널로 접수하면 됩니다. 현재 목표와 필요한 산출물을 먼저 설명해 주는 편이 좋습니다.",
        },
      ] satisfies FaqItem[],
      shortcutsTitle: "빠른 메일 초안",
      shortcuts: [
        {
          label: "버그 제보",
          href: buildMailto({
            subject: "[Survey Assistant] 버그 제보",
            body:
              "사용 역할:\n문제가 발생한 화면:\n재현 순서:\n기대 동작:\n실제 결과:\n첨부 가능한 화면 캡처:",
          }),
        },
        {
          label: "권한 문의",
          href: buildMailto({
            subject: "[Survey Assistant] 권한/로그인 문의",
            body:
              "사용 중인 Google 계정:\n문제가 발생한 화면:\n표시된 오류 메시지:\n언제부터 발생했는지:",
          }),
        },
        {
          label: "협업/의뢰 문의",
          href: buildMailto({
            subject: "[Survey Assistant] 협업 또는 의뢰 문의",
            body:
              "기관/소속:\n문의 유형(특수 템플릿/마이그레이션/협업):\n목표:\n원하는 일정:\n참고 자료:",
          }),
        },
      ],
    };
  }

  return {
    title: "Contact",
    subtitle: "Operations, bugs, data requests, and collaboration inquiries",
    meta: "Typical response time: 2-3 business days",
    intro:
      "Use this channel for service operations, account issues, export errors, privacy requests, and collaboration inquiries. Clear reproduction steps and screenshots are more useful than a long description, so include the role you were using and the exact point where the issue occurred.",
    emailTitle: "Support email",
    emailGuide:
      "This inbox handles both product operations and development support. Do not paste raw sensitive response data directly into the message body.",
    topicsTitle: "Best uses for this channel",
    topics: [
      "Research-admin sign-in or access-control issues",
      "Participant enrollment or survey-response flow errors",
      "ZIP/CSV export, SkillBook, or AI feature problems",
      "Privacy, deletion, or anonymization requests",
      "Special-template, migration, or collaboration requests",
    ],
    faqTitle: "FAQ",
    faq: [
      {
        question: "What should I include in a support email?",
        answer:
          "Tell us which role you were using, which page failed, the reproduction steps, the expected result, and the actual result. A screenshot usually shortens the debugging loop.",
      },
      {
        question: "Can I email raw survey response data?",
        answer:
          "Normally, no. Start by describing the issue and the minimum sample needed. If data review is necessary, send only the smallest safe and de-identified sample first.",
      },
      {
        question: "Do bug reports and feature requests use the same channel?",
        answer:
          "Yes. Use the same email, but prefix the subject with tags like [Bug], [Feature], or [Access] so triage is easier.",
      },
      {
        question: "Can I use this channel for collaboration or custom work?",
        answer:
          "Yes. Special-template requests, migration requests, and collaboration proposals all use this email channel.",
      },
    ] satisfies FaqItem[],
    shortcutsTitle: "Quick mail drafts",
    shortcuts: [
      {
        label: "Bug report",
        href: buildMailto({
          subject: "[Survey Assistant] Bug report",
          body:
            "Role in use:\nPage where issue happened:\nReproduction steps:\nExpected behavior:\nActual behavior:\nAvailable screenshots:",
        }),
      },
      {
        label: "Access issue",
        href: buildMailto({
          subject: "[Survey Assistant] Access or sign-in issue",
          body:
            "Google account in use:\nPage where issue happened:\nVisible error message:\nWhen it started happening:",
        }),
      },
      {
        label: "Collaboration request",
        href: buildMailto({
          subject: "[Survey Assistant] Collaboration or custom work request",
          body:
            "Organization:\nRequest type (special template / migration / partnership):\nGoal:\nDesired timeline:\nReference materials:",
        }),
      },
    ],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return {
    title: locale === "ko" ? "문의하기" : "Contact",
    description:
      locale === "ko"
        ? "서비스 운영, 버그 제보, 개인정보 요청, 협업 제안 문의 채널입니다."
        : "Support channel for operations, bugs, privacy requests, and collaboration.",
  };
}

export default async function ContactPage({ params }: PageProps) {
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
      <div className="sa-contact-grid">
        <section className="sa-contact-panel">
          <h2>{copy.emailTitle}</h2>
          <a className="sa-contact-email" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
          <p>{copy.emailGuide}</p>
        </section>

        <section className="sa-contact-panel">
          <h2>{copy.topicsTitle}</h2>
          <ul className="sa-static-page-list">
            {copy.topics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="sa-contact-panel sa-contact-panel-wide">
          <h2>{copy.shortcutsTitle}</h2>
          <div className="sa-contact-shortcuts">
            {copy.shortcuts.map((shortcut) => (
              <a key={shortcut.label} className="sa-contact-shortcut" href={shortcut.href}>
                {shortcut.label}
              </a>
            ))}
          </div>
        </section>

        <section className="sa-contact-panel sa-contact-panel-wide">
          <h2>{copy.faqTitle}</h2>
          <div className="sa-contact-faq-list">
            {copy.faq.map((item) => (
              <details key={item.question} className="sa-contact-faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </StaticPageShell>
  );
}
