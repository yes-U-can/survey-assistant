import { UserRole } from "@prisma/client";

export type LocaleCode = "ko" | "en";

export function normalizeLocale(input: string | undefined): LocaleCode {
  return input === "en" ? "en" : "ko";
}

export function resolveRoleHome(locale: LocaleCode, role: UserRole) {
  if (role === UserRole.PARTICIPANT) {
    return `/${locale}/participant`;
  }
  if (role === UserRole.PLATFORM_ADMIN) {
    return `/${locale}/platform`;
  }
  return `/${locale}/admin`;
}
