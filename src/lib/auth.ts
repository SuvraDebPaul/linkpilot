import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/server/db/prisma";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
} from "@/lib/rate-limit";

function getRequestMeta(req?: { headers?: Record<string, string> }) {
  const headers = req?.headers ?? {};
  const forwardedFor = headers["x-forwarded-for"];
  const ip =
    (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ?? "Unknown";
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
        const { ip, browser } = getRequestMeta(
          req as { headers?: Record<string, string> } | undefined,
        );

        const allowed = await checkLoginRateLimit(email, ip);
        if (!allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            suspended: true,
          },
        });

        if (!user?.password) {
          await recordFailedLoginAttempt(email, ip);
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!passwordMatch) {
          await recordFailedLoginAttempt(email, ip);
          return null;
        }

        // A suspended account's session callback would drop them right back out
        // anyway, but rejecting here avoids issuing a token at all and skips the
        // login-event/rate-limit bookkeping for an account that can't use it.
        if (user.suspended) return null;

        const loginEvent = await prisma.loginEvent.create({
          data: { userId: user.id, type: "credentials", ip, browser },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          loginEventId: loginEvent.id,
        };
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
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isDemoAccount: true,
          },
        });
        if (!demoUser?.isDemoAccount) return null;

        const loginEvent = await prisma.loginEvent.create({
          data: {
            userId: demoUser.id,
            type: "demo",
            ip: "Unknown",
            browser: "Unknown",
          },
        });

        return {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          image: demoUser.image,
          loginEventId: loginEvent.id,
        };
      },
    }),
  ],
  callbacks: {
    // Credentials sign-in already rejects suspended accounts in authorize() above;
    // this additionally covers Google OAuth, which skips authorize() entirely.
    async signIn({ user, account }) {
      if (!user.id) return true;
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { suspended: true },
      });
      if (dbUser?.suspended) return false;

      // Google OAuth has no authorize() step, so the login event is created
      // here instead — this callback runs before jwt(), unlike events.signIn
      // (which fires too late to hand the new event's id forward), so
      // mutating `user` here is what makes it reach jwt()'s `user` param.
      if (account?.provider === "google") {
        const loginEvent = await prisma.loginEvent.create({
          data: { userId: user.id, type: "google", ip: "Unknown", browser: "Unknown" },
        });
        (user as { loginEventId?: string }).loginEventId = loginEvent.id;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.loginEventId = (user as { loginEventId?: string }).loginEventId;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            sessionVersion: true,
            isDemoAccount: true,
            isSuperAdmin: true,
          },
        });
        token.sessionVersion = dbUser?.sessionVersion ?? 0;
        token.isDemoAccount = dbUser?.isDemoAccount ?? false;
        token.isSuperAdmin = dbUser?.isSuperAdmin ?? false;
        token.demoExpires = dbUser?.isDemoAccount
          ? Date.now() + DEMO_SESSION_MAX_AGE_MS
          : undefined;
      }

      // Impersonation start/end — triggered by the client calling
      // useSession().update(...) after impersonateUserAction/endImpersonationAction
      // have already verified permissions and written the audit log entry
      // server-side. The checks here (isSuperAdmin, target not an admin, no
      // stacking) are a second, independent gate: token.isSuperAdmin was set
      // above from the DB at this session's own login, so a non-admin calling
      // update() on themselves can never forge their way into this branch.
      if (trigger === "update" && session) {
        const update = session as {
          impersonateUserId?: string;
          endImpersonation?: boolean;
        };

        if (
          update.impersonateUserId &&
          token.isSuperAdmin &&
          !token.impersonatedBy
        ) {
          const target = await prisma.user.findUnique({
            where: { id: update.impersonateUserId },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              sessionVersion: true,
              isSuperAdmin: true,
            },
          });
          if (target && !target.isSuperAdmin) {
            token.impersonatedBy = token.id;
            token.impersonationStartedAt = Date.now();
            token.id = target.id;
            token.name = target.name;
            token.email = target.email;
            token.picture = target.image;
            token.sessionVersion = target.sessionVersion;
          }
        } else if (update.endImpersonation && token.impersonatedBy) {
          const admin = await prisma.user.findUnique({
            where: { id: token.impersonatedBy },
            select: { name: true, email: true, image: true, sessionVersion: true },
          });
          token.id = token.impersonatedBy;
          token.name = admin?.name;
          token.email = admin?.email;
          token.picture = admin?.image;
          token.sessionVersion = admin?.sessionVersion ?? 0;
          token.impersonatedBy = undefined;
          token.impersonationStartedAt = undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      const currentUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { sessionVersion: true, suspended: true },
      });

      const demoExpired =
        token.isDemoAccount &&
        typeof token.demoExpires === "number" &&
        Date.now() > token.demoExpires;

      // Per-device revocation: only this one session's own LoginEvent, unlike
      // sessionVersion below which invalidates every session for the user at once.
      const loginEventRevoked = token.loginEventId
        ? (await prisma.loginEvent.findUnique({
            where: { id: token.loginEventId },
            select: { revoked: true },
          }))?.revoked
        : false;

      // Session was revoked (sessionVersion bumped), the user no longer exists, this
      // was a demo session that hit its absolute time limit, a super-admin has
      // suspended the account, or this specific device/session was individually
      // revoked — drop the user from the session so auth guards treat this as
      // signed out. A suspension takes effect on this account's very next request
      // since every request re-runs this callback.
      if (
        !currentUser ||
        currentUser.sessionVersion !== token.sessionVersion ||
        demoExpired ||
        currentUser.suspended ||
        loginEventRevoked
      ) {
        return { ...session, user: undefined } as unknown as typeof session;
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = token.impersonatedBy
          ? false
          : (token.isSuperAdmin ?? false);
        session.user.impersonatedBy = token.impersonatedBy;
        session.user.impersonationStartedAt = token.impersonationStartedAt;
      }
      return session;
    },
  },
  events: {
    // Fires when a new user is created via OAuth (not credentials — those go through registerAction)
    async createUser({ user }) {
      if (!user.id) return;
      const base = user.email?.split("@")[0] ?? user.id.slice(0, 8);
      const slug = `${base}-${user.id.slice(-6)}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");
      const workspace = await prisma.workspace.create({
        data: { name: `${user.name ?? "My"} Workspace`, slug },
        select: { id: true },
      });
      await prisma.workspaceMember.create({
        data: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
      });
    },
  },
};
