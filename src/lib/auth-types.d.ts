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
      // When the current impersonation session started (ms epoch) — used to
      // report a duration when the admin ends it.
      impersonationStartedAt?: number;
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
    impersonationStartedAt?: number;
    // The LoginEvent row created at sign-in for this specific session — lets a
    // super-admin revoke just this one device/session (see /admin/users/[id]),
    // independent of the account-wide sessionVersion-based "force logout".
    loginEventId?: string;
  }
}
