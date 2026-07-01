import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NEXTAUTH_COOKIE = process.env.NEXTAUTH_URL?.startsWith("https://")
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? "localhost";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and /onboarding — redirect to login if no session cookie
  if (pathname.startsWith("/dashboard") || pathname === "/onboarding") {
    const token = request.cookies.get(NEXTAUTH_COOKIE);
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding"],
};
