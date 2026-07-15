import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
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
