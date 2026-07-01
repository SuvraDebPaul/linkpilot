import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NEXTAUTH_COOKIE = process.env.NEXTAUTH_URL?.startsWith("https://")
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

// Paths that skip auth + dashboard rewrite on any subdomain
const AUTH_FREE = [
  "/login", "/register", "/forgot-password", "/reset-password",
  "/api", "/_next", "/favicon", "/logo", "/robots", "/sitemap",
];

function isAuthFree(pathname: string) {
  return AUTH_FREE.some((p) => pathname.startsWith(p));
}

/** Internal rewrite: map a subdomain-relative path → /dashboard equivalent */
function toDashboardPath(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return pathname;          // already correct
  if (pathname === "/") return "/dashboard";
  return `/dashboard${pathname}`;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;

  // ── app subdomain → dashboard (with auth guard) ───────────────────────────
  // Matches: app.localhost, app.example.com, app.anything
  if (hostname.startsWith("app.")) {
    if (!isAuthFree(pathname)) {
      const token = request.cookies.get(NEXTAUTH_COOKIE);
      if (!token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Rewrite to /dashboard/* if not already there
    const target = toDashboardPath(pathname);
    if (target !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // ── demo subdomain → dashboard (no auth, demo-mode header injected) ───────
  // Matches: demo.localhost, demo.example.com, demo.anything
  if (hostname.startsWith("demo.")) {
    if (isAuthFree(pathname)) return NextResponse.next();

    const url = request.nextUrl.clone();
    url.pathname = toDashboardPath(pathname);

    // Forward the demo flag as a request header so server components can read it
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("x-demo-mode", "true");

    return NextResponse.rewrite(url, { request: { headers: reqHeaders } });
  }

  // ── main host — protect /dashboard and /onboarding as before ─────────────
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
  // Run on all routes except Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|svg|jpg|ico|webp)$).*)",
  ],
};
