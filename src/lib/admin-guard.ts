import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

export const NOT_SUPER_ADMIN_MESSAGE = "You don't have permission to do that.";

// Every server action reachable from /admin must call this first — it throws
// SESSION_EXPIRED_MESSAGE for a signed-out caller (same UX as every other
// action in the app: toast + redirect to login) and NOT_SUPER_ADMIN_MESSAGE
// for a signed-in caller who just isn't the platform owner, so a probing
// request can't tell the difference between "route doesn't exist" and
// "you're not allowed" beyond that one message.
export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error(SESSION_EXPIRED_MESSAGE);

  // Impersonated sessions never carry isSuperAdmin (see auth.ts's session
  // callback), so this also blocks an admin from reaching /admin actions
  // while impersonating someone else.
  if (!session.user.isSuperAdmin) throw new Error(NOT_SUPER_ADMIN_MESSAGE);

  return { adminId: session.user.id };
}

// A super-admin can act on any regular user, but never on another super-admin —
// there's exactly one admin tier for now, so this is the only guardrail keeping
// one admin from locking out or impersonating another. Deliberately lives here
// rather than in a "use server" actions file — every export from one of those
// becomes a publicly callable Server Action, and this has no auth check of its
// own (it's meant to run only after requireSuperAdmin has already gated the
// caller), so exporting it from an actions file would let anyone probe whether
// an arbitrary user id belongs to a super-admin.
export async function assertNotAdmin(userId: string) {
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { isSuperAdmin: true } });
  if (target?.isSuperAdmin) throw new Error("You can't perform this action on another super-admin.");
}
