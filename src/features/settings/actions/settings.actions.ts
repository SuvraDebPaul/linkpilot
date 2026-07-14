"use server";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import crypto from "crypto";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { stripe } from "@/lib/stripe";
import { sendVerificationEmail } from "@/lib/email";
import { isDemoAccount } from "@/server/services/demo-guard.service";
import {
  changePasswordSchema,
  setPasswordSchema,
  updateProfileSchema,
} from "@/features/settings/schemas/settings.schema";

type Result = { success: boolean; message: string };

const DEMO_ACCOUNT_MESSAGE =
  "This is the public demo account, shared by everyone trying LinkPilot — changing credentials or deleting it is disabled.";

export async function updateProfileAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name, image: parsed.data.image || null },
    });
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true, message: "Profile updated." };
}

export async function resendVerificationEmailAction(): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });
  if (!user?.email) return { success: false, message: "No email on file." };
  if (user.emailVerified) return { success: false, message: "Your email is already verified." };

  try {
    await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: { identifier: user.email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });

    await sendVerificationEmail(user.email, token);
    return { success: true, message: "Verification email sent." };
  } catch {
    return { success: false, message: "Couldn't send the verification email. Please try again." };
  }
}

export async function changePasswordAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };
  if (await isDemoAccount(session.user.id)) {
    return { success: false, message: DEMO_ACCOUNT_MESSAGE };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user?.password) {
      return {
        success: false,
        message: "This account uses social login — no password to change.",
      };
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!valid) return { success: false, message: "Current password is incorrect." };

    const hash = await bcrypt.hash(parsed.data.newPassword, 12);
    // Bump sessionVersion so a change made specifically because a session was
    // compromised actually revokes that session, not just the password itself.
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hash, sessionVersion: { increment: 1 } },
    });

    return { success: true, message: "Password changed. You've been signed out on all other devices." };
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function setPasswordAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };
  if (await isDemoAccount(session.user.id)) {
    return { success: false, message: DEMO_ACCOUNT_MESSAGE };
  }

  const parsed = setPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (user?.password) {
      return { success: false, message: "You already have a password set. Use the change password form instead." };
    }

    const hash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({ where: { id: session.user.id }, data: { password: hash } });

    return { success: true, message: "Password set. You can now also sign in with your email and password." };
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function updateThemeAction(theme: "light" | "dark" | "auto"): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  try {
    await prisma.user.update({ where: { id: session.user.id }, data: { theme } });
    return { success: true, message: "Theme updated." };
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function updateMonthlyReportAction(enabled: boolean): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };

  try {
    await prisma.user.update({ where: { id: session.user.id }, data: { monthlyReportEnabled: enabled } });
    return { success: true, message: enabled ? "Monthly report enabled." : "Monthly report disabled." };
  } catch {
    return { success: false, message: "Something went wrong. Please try again." };
  }
}

export async function deleteAccountAction(): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: SESSION_EXPIRED_MESSAGE };
  if (await isDemoAccount(session.user.id)) {
    return { success: false, message: DEMO_ACCOUNT_MESSAGE };
  }

  try {
    // Deleting the account cascade-deletes this user's WorkspaceMember rows, but
    // Workspace itself has no direct FK to a user — so a workspace this user
    // solely owns would otherwise either orphan its remaining teammates (no one
    // left who can manage it) or, if they're the only member, linger forever
    // with zero members. Block the former; clean up the latter below.
    const ownedMemberships = await prisma.workspaceMember.findMany({
      where: { userId: session.user.id, role: "OWNER" },
      select: {
        workspaceId: true,
        workspace: { select: { name: true, _count: { select: { members: true } } } },
      },
    });

    const ownedWithTeammates = ownedMemberships.filter((m) => m.workspace._count.members > 1);
    if (ownedWithTeammates.length > 0) {
      const names = ownedWithTeammates.map((m) => m.workspace.name).join(", ");
      return {
        success: false,
        message: `Transfer ownership of ${names} before deleting your account — those workspaces still have other members.`,
      };
    }

    const soloOwnedWorkspaceIds = ownedMemberships
      .filter((m) => m.workspace._count.members === 1)
      .map((m) => m.workspaceId);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true, stripeSubscriptionId: true },
    });

    // Cancel active subscription and delete Stripe customer before wiping user data
    if (user?.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch { /* subscription may already be cancelled */ }
    }
    if (user?.stripeCustomerId) {
      try {
        await stripe.customers.del(user.stripeCustomerId);
      } catch { /* customer may already be deleted */ }
    }

    if (soloOwnedWorkspaceIds.length > 0) {
      await prisma.workspace.deleteMany({ where: { id: { in: soloOwnedWorkspaceIds } } });
    }

    await prisma.user.delete({ where: { id: session.user.id } });
    return { success: true, message: "Account deleted." };
  } catch {
    return { success: false, message: "Something went wrong deleting your account. Please try again." };
  }
}
