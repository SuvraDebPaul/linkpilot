"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin, assertNotAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/server/services/admin-audit.service";

type ActionResult = { success: boolean; message: string };

// Only verifies permission and writes the audit trail — the actual session
// swap happens client-side via useSession().update({ impersonateUserId })
// (see auth.ts's jwt callback), which is the only way to re-sign the JWT
// cookie without a full sign-out/sign-in round trip.
export async function impersonateUserAction(targetUserId: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    await assertNotAdmin(targetUserId);

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { email: true },
    });
    if (!target) return { success: false, message: "User not found." };

    await logAdminAction(adminId, "user.impersonate_start", {
      targetType: "User",
      targetId: targetUserId,
      metadata: { targetEmail: target.email },
    });

    return { success: true, message: `Now viewing as ${target.email}.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

// Can't use requireSuperAdmin here — session.user.isSuperAdmin is forced false
// for the whole duration of an impersonation (see auth.ts's session callback),
// so the actual gate is simply "is impersonatedBy set on this session at all."
export async function endImpersonationAction(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);
    const adminId = session?.user?.impersonatedBy;
    const targetUserId = session?.user?.id;
    if (!adminId || !targetUserId) {
      return { success: false, message: "You're not currently impersonating anyone." };
    }

    const startedAt = session?.user?.impersonationStartedAt;
    const durationMs = typeof startedAt === "number" ? Date.now() - startedAt : undefined;

    await logAdminAction(adminId, "user.impersonate_end", {
      targetType: "User",
      targetId: targetUserId,
      metadata: { durationMs },
    });

    return { success: true, message: "Impersonation ended." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
