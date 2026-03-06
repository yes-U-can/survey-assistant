import Link from "next/link";

type Props = {
  locale: "ko" | "en";
  withLeadingDivider?: boolean;
};

export function LegalLinks({ locale, withLeadingDivider = true }: Props) {
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
      {withLeadingDivider ? <span className="sa-divider">|</span> : null}
      <Link href={`/${locale}/legal/privacy`}>{copy.privacy}</Link>
      <span className="sa-divider">|</span>
      <Link href={`/${locale}/legal/terms`}>{copy.terms}</Link>
    </>
  );
}
