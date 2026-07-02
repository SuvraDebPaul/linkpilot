import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/server/db/prisma";
import { verifyTotp } from "@/lib/totp";

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
        otp: { label: "Two-factor code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: {
            id: true, name: true, email: true, image: true, password: true,
            twoFactorEnabled: true, twoFactorSecret: true, twoFactorBackupCodes: true,
          },
        });

        if (!user?.password) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        if (user.twoFactorEnabled && user.twoFactorSecret) {
          const otp = credentials.otp?.trim();
          if (!otp) throw new Error("2FA_REQUIRED");

          const validTotp = verifyTotp(user.twoFactorSecret, otp);
          const backupIndex = user.twoFactorBackupCodes.indexOf(otp.toUpperCase());

          if (!validTotp && backupIndex === -1) throw new Error("2FA_INVALID");

          if (!validTotp && backupIndex !== -1) {
            const remaining = user.twoFactorBackupCodes.filter((_, i) => i !== backupIndex);
            await prisma.user.update({ where: { id: user.id }, data: { twoFactorBackupCodes: remaining } });
          }
        }

        const { ip, browser } = getRequestMeta(req as { headers?: Record<string, string> } | undefined);
        await prisma.loginEvent.create({
          data: { userId: user.id, type: "credentials", ip, browser },
        });

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { sessionVersion: true },
        });
        token.sessionVersion = dbUser?.sessionVersion ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      const currentUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { sessionVersion: true },
      });

      // Session was revoked (sessionVersion bumped) or the user no longer exists —
      // drop the user from the session so auth guards treat this as signed out.
      if (!currentUser || currentUser.sessionVersion !== token.sessionVersion) {
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
