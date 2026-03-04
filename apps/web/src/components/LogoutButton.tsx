"use client";

import { signOut } from "next-auth/react";

import type { LocaleCode } from "@/lib/role-home";

type Props = {
  locale: LocaleCode;
  className?: string;
};

export function LogoutButton({ locale, className }: Props) {
  const label = locale === "ko" ? "로그아웃" : "Sign out";

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        void signOut({
          callbackUrl: `/${locale}`,
        });
      }}
    >
      {label}
    </button>
  );
}
