"use client";

type Props = {
  href: string;
  label: string;
};

export function NaverSignInButton({ href, label }: Props) {
  return (
    <a className="sa-naver-btn" href={href}>
      <span className="sa-naver-icon" aria-hidden="true">
        N
      </span>
      <span>{label}</span>
    </a>
  );
}
