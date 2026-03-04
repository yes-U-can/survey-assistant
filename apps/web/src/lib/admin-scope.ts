import { NextResponse } from "next/server";

export const ADMIN_SCOPE_ERROR = "not_found_or_no_access";

export function withOwnerScope<T extends Record<string, unknown>>(ownerId: string, where?: T) {
  return {
    ...(where ?? {}),
    ownerId,
  };
}

export function withRequesterScope<T extends Record<string, unknown>>(
  requesterId: string,
  where?: T,
) {
  return {
    ...(where ?? {}),
    requesterId,
  };
}

export function withSellerScope<T extends Record<string, unknown>>(sellerId: string, where?: T) {
  return {
    ...(where ?? {}),
    sellerId,
  };
}

export function notFoundOrNoAccessResponse() {
  return NextResponse.json({ ok: false, error: ADMIN_SCOPE_ERROR }, { status: 404 });
}
