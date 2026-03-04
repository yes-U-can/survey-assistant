import Link from "next/link";

type Props = {
  locale: "ko" | "en";
};

export function LegalLinks({ locale }: Props) {
  const copy =
    locale === "ko"
      ? {
          privacy: "개인정보 처리방침",
          terms: "이용약관",
        }
      : {
          privacy: "Privacy",
          terms: "Terms",
        };

  return (
    <>
      <span className="sa-divider">|</span>
      <Link href={`/${locale}/legal/privacy`}>{copy.privacy}</Link>
      <span className="sa-divider">|</span>
      <Link href={`/${locale}/legal/terms`}>{copy.terms}</Link>
    </>
  );
}

