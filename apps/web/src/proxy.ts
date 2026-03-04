import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
  const canonicalOrigin = process.env.NEXTAUTH_URL;
  if (canonicalOrigin) {
    try {
      const canonicalUrl = new URL(canonicalOrigin);
      const requestHost = req.nextUrl.host.toLowerCase();
      const canonicalHost = canonicalUrl.host.toLowerCase();
      const isLocalRequest =
        requestHost.startsWith("localhost") ||
        requestHost.startsWith("127.0.0.1");

      if (!isLocalRequest && requestHost !== canonicalHost) {
        const redirected = req.nextUrl.clone();
        redirected.protocol = canonicalUrl.protocol;
        redirected.host = canonicalHost;
        return NextResponse.redirect(redirected);
      }
    } catch {
      // Ignore malformed NEXTAUTH_URL and continue normal routing.
    }
  }

  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/ko", req.url));
  }

  const isLocalePath = pathname.startsWith("/ko") || pathname.startsWith("/en");
  if (!isLocalePath) {
    return NextResponse.redirect(new URL(`/ko${pathname}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
