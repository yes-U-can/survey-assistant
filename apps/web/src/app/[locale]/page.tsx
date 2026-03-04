export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "ko";

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>{locale === "ko" ? "설문조사 도우미" : "Survey Assistant"}</h1>
      <p>
        {locale === "ko"
          ? "기본 언어는 한국어이며, 영어를 추가 지원합니다."
          : "Primary locale is Korean, with English as a secondary locale."}
      </p>
    </main>
  );
}
