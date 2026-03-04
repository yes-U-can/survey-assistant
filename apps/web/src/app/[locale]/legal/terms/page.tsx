import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  const copy =
    locale === "ko"
      ? {
          title: "이용약관",
          summary:
            "설문조사 도우미는 연구 운영을 위한 SaaS/오픈소스 미들웨어입니다. 본 약관은 운영 계정, 크레딧, 특수 템플릿 정책의 기본 원칙을 정의합니다.",
          sections: [
            {
              heading: "1. 계정 및 권한",
              body: "피검자, 연구 관리자, 플랫폼 어드민의 역할이 분리됩니다. 관리자/플랫폼 어드민은 Google SSO로 인증합니다.",
            },
            {
              heading: "2. 크레딧 및 정산",
              body: "스토어 구매 시 구매자 차감, 판매자 보상, 플랫폼 수수료가 자동 기록됩니다. AI 관리형은 즉시 차감 후 실패 시 자동 환불됩니다.",
            },
            {
              heading: "3. 특수 템플릿 의뢰",
              body: "특수 템플릿은 의뢰 기반 코드 개발만 허용됩니다. 의뢰 제출 시 소스 공개(MIT 가능성) 동의를 요구합니다.",
            },
            {
              heading: "4. 오픈소스 공개",
              body: "플랫폼 및 특수 템플릿 구현 코드는 공개될 수 있습니다. 단, 공개 여부와 크레딧 보상 지급은 별도로 처리됩니다.",
            },
            {
              heading: "5. 금지행위 및 책임 제한",
              body: "무단 접근, 권한 우회, 민감데이터 유출 시도, 서비스 남용은 금지됩니다. 본 서비스의 AI 출력은 참고용이며 의료적 확정 판단을 대체하지 않습니다.",
            },
          ],
          updated: "최종 업데이트: 2026-03-04",
          back: "홈으로",
        }
      : {
          title: "Terms of Service",
          summary:
            "Survey Assistant is a SaaS/open-source middleware for research operations. These terms define account roles, credits, and special-template policy.",
          sections: [
            {
              heading: "1. Accounts and Roles",
              body: "Participant, research-admin, and platform-admin roles are separated. Admin roles authenticate via Google SSO.",
            },
            {
              heading: "2. Credits and Settlement",
              body: "Store purchases automatically record buyer spend, seller reward, and platform fee. Managed AI charges immediately and refunds on failure.",
            },
            {
              heading: "3. Special Template Requests",
              body: "Special templates are request-based code deliverables only. Request submission requires source publication notice consent (MIT possibility).",
            },
            {
              heading: "4. Open-source Publication",
              body: "Platform and special-template implementation code may be public. Publication and credit compensation are separate tracks.",
            },
            {
              heading: "5. Prohibited Use and Liability",
              body: "Unauthorized access, privilege bypass, sensitive-data leaks, and abuse are prohibited. AI output is assistive and not a final medical judgment.",
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

