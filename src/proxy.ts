import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SESSION_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

// App Router pages never have a file extension in their path — only static assets
// (images, data files like world-110m.json, fonts, etc.) do. Those are fetched by the
// dashboard itself in the background and must never count as "leaving the dashboard."
const HAS_FILE_EXTENSION = /\.[a-zA-Z0-9]+$/;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (HAS_FILE_EXTENSION.test(pathname)) {
    return NextResponse.next();
  }

  const onDashboard = pathname.startsWith("/dashboard") || pathname === "/onboarding";
  const onAdmin = pathname.startsWith("/admin");

  // getToken() detects the secure vs non-secure cookie name itself from the request's
  // own protocol — more reliable than hardcoding a cookie name off an env var string,
  // and it validates the JWT signature rather than just checking a cookie exists.
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Protect /dashboard and /onboarding — redirect to login if there's no valid session
  if (onDashboard && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect /admin — unauthenticated visitors go to login, authenticated non-admins
  // (including someone currently impersonating a user, since token.id no longer
  // refers to the admin while impersonating) get bounced to the regular dashboard
  // rather than told an admin area exists at all.
  if (onAdmin) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!token.isSuperAdmin || token.impersonatedBy) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Demo account sessions (however they were reached — the one-click demo button, or
  // someone signing in manually with the seeded demo credentials) get force-logged-out
  // the moment they leave /dashboard — back button, logo click, a bookmark, closing and
  // reopening the tab, anything — or once their absolute time limit is up (auth.ts).
  if (token?.isDemoAccount) {
    const expired =
      typeof token.demoExpires === "number" && Date.now() > token.demoExpires;

    if (!onDashboard || expired) {
      // Redirecting (rather than just clearing cookies on this response) forces a
      // fresh request — this render already has the old cookie, so it takes one more
      // round trip to actually come back logged out. Dashboard pages already redirect
      // unauthenticated visitors to /login on their own, and public pages render fine
      // with no session, so sending everyone back to the URL they asked for is safe.
      const res = NextResponse.redirect(request.nextUrl.clone());
      for (const name of SESSION_COOKIE_NAMES) {
        res.cookies.delete(name);
      }
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on every page route except:
     * - /api (including NextAuth's own routes)
     * - /_next (Next.js internals)
     * - static files (images, favicon, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)$).*)",
  ],
};
