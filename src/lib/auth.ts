import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/server/db/prisma";
import { checkLoginRateLimit, recordFailedLoginAttempt } from "@/lib/rate-limit";

function getRequestMeta(req?: { headers?: Record<string, string> }) {
  const headers = req?.headers ?? {};
  const forwardedFor = headers["x-forwarded-for"];
  const ip = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ?? "Unknown";
  const userAgent = headers["user-agent"] ?? "";
  const browser = /Chrome/.test(userAgent)
    ? "Chrome"
    : /Firefox/.test(userAgent)
      ? "Firefox"
      : /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
        ? "Safari"
        : /Edg/.test(userAgent)
          ? "Edge"
          : "Unknown";
  return { ip, browser };
}

// Demo sessions (however they were reached — the one-click demo button, or someone
// manually logging in with the seeded demo credentials) never last longer than this,
// so a forgotten/closed tab can't leave a "logged in" demo session lingering forever.
const DEMO_SESSION_MAX_AGE_MS = 30 * 60 * 1000;

// The one account the "Demo Dashboard" button signs into — not any of the seeded
// teammates on that workspace, which are flagged isDemoAccount too.
const DEMO_USER_EMAIL = "demo@linkpilot.com";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const { ip, browser } = getRequestMeta(req as { headers?: Record<string, string> } | undefined);

        const allowed = await checkLoginRateLimit(email, ip);
        if (!allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true, password: true },
        });

        if (!user?.password) {
          await recordFailedLoginAttempt(email, ip);
          return null;
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) {
          await recordFailedLoginAttempt(email, ip);
          return null;
        }

        await prisma.loginEvent.create({
          data: { userId: user.id, type: "credentials", ip, browser },
        });

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    // Powers the public "Demo Dashboard" button — no password, always resolves to the
    // single seeded demo account. Safe to expose: it can only ever sign someone into
    // that one sandbox account, never any real user.
    CredentialsProvider({
      id: "demo",
      name: "Demo",
      credentials: {},
      async authorize() {
        // Seeded teammates on the demo workspace are also flagged isDemoAccount, so
        // this must target the primary demo login by email specifically — a bare
        // isDemoAccount filter would nondeterministically match any of them.
        const demoUser = await prisma.user.findUnique({
          where: { email: DEMO_USER_EMAIL },
          select: { id: true, name: true, email: true, image: true, isDemoAccount: true },
        });
        if (!demoUser?.isDemoAccount) return null;

        await prisma.loginEvent.create({
          data: { userId: demoUser.id, type: "demo", ip: "Unknown", browser: "Unknown" },
        });

        return { id: demoUser.id, name: demoUser.name, email: demoUser.email, image: demoUser.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { sessionVersion: true, isDemoAccount: true },
        });
        token.sessionVersion = dbUser?.sessionVersion ?? 0;
        token.isDemoAccount = dbUser?.isDemoAccount ?? false;
        token.demoExpires = dbUser?.isDemoAccount
          ? Date.now() + DEMO_SESSION_MAX_AGE_MS
          : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      const currentUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { sessionVersion: true },
      });

      const demoExpired =
        token.isDemoAccount &&
        typeof token.demoExpires === "number" &&
        Date.now() > token.demoExpires;

      // Session was revoked (sessionVersion bumped), the user no longer exists, or
      // this was a demo session that hit its absolute time limit — drop the user from
      // the session so auth guards treat this as signed out.
      if (!currentUser || currentUser.sessionVersion !== token.sessionVersion || demoExpired) {
        return { ...session, user: undefined } as unknown as typeof session;
      }

      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    // Fires when a new user is created via OAuth (not credentials — those go through registerAction)
    async createUser({ user }) {
      if (!user.id) return;
      const base = user.email?.split("@")[0] ?? user.id.slice(0, 8);
      const slug = `${base}-${user.id.slice(-6)}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const workspace = await prisma.workspace.create({
        data: { name: `${user.name ?? "My"} Workspace`, slug },
        select: { id: true },
      });
      await prisma.workspaceMember.create({
        data: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
      });
    },
    // OAuth sign-ins skip authorize(), so log them here instead. No request object is
    // available in this event in NextAuth v4, so IP/browser stay "Unknown" for these.
    async signIn({ user, account }) {
      if (!user.id || account?.provider !== "google") return;
      await prisma.loginEvent.create({
        data: { userId: user.id, type: "google", ip: "Unknown", browser: "Unknown" },
      });
    },
  },
};
