import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/server/db/prisma";

const isSecure = process.env.NEXTAUTH_URL?.startsWith("https://");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  // Share the session cookie across subdomains (e.g. app.localhost, app.linkpilot.com)
  // Set NEXTAUTH_COOKIE_DOMAIN=.localhost in .env.local (or .yourdomain.com in production)
  ...(process.env.NEXTAUTH_COOKIE_DOMAIN && {
    cookies: {
      sessionToken: {
        name: isSecure
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax" as const,
          path: "/",
          domain: process.env.NEXTAUTH_COOKIE_DOMAIN,
          secure: !!isSecure,
        },
      },
    },
  }),
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: { id: true, name: true, email: true, image: true, password: true },
        });

        if (!user?.password) return null;

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
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
  },
};
