import Link from "next/link";

type Props = {
  locale: "ko" | "en";
};

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0";

export function AppFooter({ locale }: Props) {
  const copy =
    locale === "ko"
      ? {
          copyright:
            "© 2026 서울임상심리연구소(Seoul Institute of Clinical Psychology, SICP) & 모오(MOW). All rights reserved.",
          about: "서비스 소개",
          contact: "문의하기",
          terms: "이용약관",
          privacy: "개인정보처리방침",
          version: `Version ${APP_VERSION}`,
        }
      : {
          copyright:
            "© 2026 Seoul Institute of Clinical Psychology (SICP) & MOW. All rights reserved.",
          about: "About",
          contact: "Contact",
          terms: "Terms",
          privacy: "Privacy",
          version: `Version ${APP_VERSION}`,
        };

  return (
    <footer className="sa-site-footer">
      <div className="sa-site-footer-inner">
        <p className="sa-site-footer-copyright">{copy.copyright}</p>
        <nav className="sa-site-footer-links" aria-label="Footer">
          <Link href={`/${locale}/about`}>{copy.about}</Link>
          <Link href={`/${locale}/contact`}>{copy.contact}</Link>
          <Link href={`/${locale}/legal/terms`}>{copy.terms}</Link>
          <Link href={`/${locale}/legal/privacy`}>{copy.privacy}</Link>
        </nav>
        <p className="sa-site-footer-version">{copy.version}</p>
      </div>
    </footer>
  );
}
