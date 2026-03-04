import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  const copy =
    locale === "ko"
      ? {
          title: "개인정보 처리방침",
          summary:
            "설문조사 도우미는 연구 운영에 필요한 최소 정보만 처리하며, 레거시 민감데이터는 공개 저장소에 포함하지 않습니다.",
          sections: [
            {
              heading: "1. 수집 및 처리 항목",
              body: "피검자는 익명형 식별자(loginId) 기반으로 가입하며, 관리자/플랫폼 어드민은 Google SSO 정보(이메일, 이름)를 사용합니다.",
            },
            {
              heading: "2. 처리 목적",
              body: "설문 참여 관리, 연구 운영, 권한 검증, 보안 감사로그(비식별 IP 해시 포함)를 위해 사용합니다.",
            },
            {
              heading: "3. 보관 및 삭제",
              body: "서비스 운영 목적 범위 내에서 보관하며, 비활성화/익명화 요청 시 정책에 따라 식별자를 제거합니다.",
            },
            {
              heading: "4. 제3자 제공 및 위탁",
              body: "기본 인프라는 Vercel/Neon/Google OAuth를 사용합니다. LLM 분석은 관리자 선택(BYOK/Managed) 정책에 따라 수행됩니다.",
            },
            {
              heading: "5. 공개 저장소 정책",
              body: "오픈소스 저장소에는 코드/문서/샘플만 공개하며, 응답 원본/회원정보/IP 원문/레거시 DB 덤프는 커밋 금지입니다.",
            },
          ],
          updated: "최종 업데이트: 2026-03-04",
          back: "홈으로",
        }
      : {
          title: "Privacy Policy",
          summary:
            "Survey Assistant processes only the minimum data required for research operations and never publishes legacy sensitive data to public repositories.",
          sections: [
            {
              heading: "1. Data We Process",
              body: "Participants sign in with anonymous-style identifiers (loginId). Research/platform admins use Google SSO profile fields (email, name).",
            },
            {
              heading: "2. Purpose",
              body: "Data is used for survey operations, access control, and security audit logs (including non-reversible IP hash).",
            },
            {
              heading: "3. Retention and Deletion",
              body: "Data is retained only within operational necessity. Identifiers are removed on deactivation/anonymization workflows.",
            },
            {
              heading: "4. Processors and Integrations",
              body: "Core infrastructure uses Vercel/Neon/Google OAuth. AI analysis runs under admin-selected BYOK or managed policy.",
            },
            {
              heading: "5. Open-source Boundary",
              body: "Only code/docs/sanitized samples are public. Raw responses, member records, raw IP logs, and legacy DB dumps must stay private.",
            },
          ],
          updated: "Last updated: 2026-03-04",
          back: "Back to home",
        };

  return (
    <main className="sa-page">
      <h1>{copy.title}</h1>
      <p>{copy.summary}</p>
      {copy.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
        </section>
      ))}
      <section>
        <p>{copy.updated}</p>
        <p style={{ marginTop: 12 }}>
          <Link href={`/${locale}`}>{copy.back}</Link>
        </p>
      </section>
    </main>
  );
}

