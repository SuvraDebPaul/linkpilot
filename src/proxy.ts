import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_COOKIE = process.env.NEXTAUTH_URL?.startsWith("https://")
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

const APP_HOST = process.env.NEXT_PUBLIC_APP_HOST ?? "localhost";

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

  // Protect /dashboard and /onboarding — redirect to login if no session cookie
  if (onDashboard) {
    const cookie = request.cookies.get(NEXTAUTH_COOKIE);
    if (!cookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Demo account sessions (however they were reached — the one-click demo button, or
  // someone signing in manually with the seeded demo credentials) get force-logged-out
  // the moment they leave /dashboard — back button, logo click, a bookmark, closing and
  // reopening the tab, anything — or once their absolute time limit is up (auth.ts).
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token?.isDemoAccount) {
    const expired =
      typeof token.demoExpires === "number" && Date.now() > token.demoExpires;

    if (!onDashboard || expired) {
      // Redirecting (rather than just clearing cookies on this response) forces a
      // fresh request — this render already has the old cookie, so it takes one more
      // round trip to actually come back logged out.
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
