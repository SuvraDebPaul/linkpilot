import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isSuperAdmin?: boolean;
      // Set only while a super-admin is impersonating this user — the real
      // admin's own user id, so the UI can show "Viewing as X" and the
      // impersonation can be ended and attributed correctly.
      impersonatedBy?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    sessionVersion?: number;
    isDemoAccount?: boolean;
    demoExpires?: number;
    isSuperAdmin?: boolean;
    impersonatedBy?: string;
  }
}
