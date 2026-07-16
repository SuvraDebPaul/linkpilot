"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db/prisma";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/server/services/admin-audit.service";
import { sendPasswordResetEmail } from "@/lib/email";

type ActionResult = { success: boolean; message: string };

// A super-admin can act on any regular user, but never on another super-admin —
// there's exactly one admin tier for now, so this is the only guardrail keeping
// one admin from locking out or impersonating another.
export async function assertNotAdmin(userId: string) {
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { isSuperAdmin: true } });
  if (target?.isSuperAdmin) throw new Error("You can't perform this action on another super-admin.");
}

export async function forceLogoutUserAction(userId: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    await assertNotAdmin(userId);

    await prisma.user.update({
      where: { id: userId },
      data: { sessionVersion: { increment: 1 } },
    });

    await logAdminAction(adminId, "user.force_logout", { targetType: "User", targetId: userId });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "All of this user's sessions have been signed out." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

// Revokes one specific session/device (via its LoginEvent), independent of
// forceLogoutUserAction above, which invalidates every session at once.
export async function revokeLoginEventAction(loginEventId: string, userId: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    await assertNotAdmin(userId);

    const loginEvent = await prisma.loginEvent.findUnique({
      where: { id: loginEventId },
      select: { userId: true },
    });
    if (!loginEvent || loginEvent.userId !== userId) {
      return { success: false, message: "Session not found." };
    }

    await prisma.loginEvent.update({ where: { id: loginEventId }, data: { revoked: true } });

    await logAdminAction(adminId, "user.revoke_session", {
      targetType: "User",
      targetId: userId,
      metadata: { loginEventId },
    });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "Session revoked." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function sendPasswordResetUserAction(userId: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    await assertNotAdmin(userId);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user?.email) return { success: false, message: "User not found." };

    await prisma.verificationToken.deleteMany({ where: { identifier: `reset:${user.email}` } });
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${user.email}`,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendPasswordResetEmail(user.email, token);

    await logAdminAction(adminId, "user.send_password_reset", { targetType: "User", targetId: userId });
    return { success: true, message: "Password reset email sent." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function grantPlanAction(
  userId: string,
  plan: "free" | "starter" | "pro" | "lifetime",
): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    await assertNotAdmin(userId);

    const farFuture = new Date("2099-01-01");
    const data =
      plan === "free"
        ? { lifetimeAccess: false, stripePriceId: null, stripeCurrentPeriodEnd: null }
        : plan === "lifetime"
          ? { lifetimeAccess: true, stripePriceId: null, stripeCurrentPeriodEnd: null }
          : plan === "starter"
            ? {
                lifetimeAccess: false,
                stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
                stripeCurrentPeriodEnd: farFuture,
              }
            : {
                lifetimeAccess: false,
                stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
                stripeCurrentPeriodEnd: farFuture,
              };

    await prisma.user.update({ where: { id: userId }, data });

    await logAdminAction(adminId, "user.grant_plan", {
      targetType: "User",
      targetId: userId,
      metadata: { plan },
    });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: `Plan updated to ${plan}. This is a manual override — no Stripe subscription was created.` };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function suspendUserAction(userId: string, suspend: boolean): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    await assertNotAdmin(userId);

    await prisma.user.update({
      where: { id: userId },
      data: { suspended: suspend, suspendedAt: suspend ? new Date() : null },
    });

    await logAdminAction(adminId, suspend ? "user.suspend" : "user.unsuspend", {
      targetType: "User",
      targetId: userId,
    });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { success: true, message: suspend ? "User suspended." : "User unsuspended." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();
    await assertNotAdmin(userId);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) return { success: false, message: "User not found." };

    // Cascades away this user's WorkspaceMember rows (schema-level onDelete:
    // Cascade), but any workspace they solely owned is left behind with no
    // members — /admin/workspaces surfaces ownerless workspaces for cleanup.
    await prisma.user.delete({ where: { id: userId } });

    await logAdminAction(adminId, "user.delete", {
      targetType: "User",
      targetId: userId,
      metadata: { email: user.email },
    });
    revalidatePath("/admin/users");
    return { success: true, message: "User deleted." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
