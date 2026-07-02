"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import crypto from "crypto";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { stripe } from "@/lib/stripe";
import { sendVerificationEmail } from "@/lib/email";
import {
  changePasswordSchema,
  setPasswordSchema,
  updateProfileSchema,
} from "@/features/settings/schemas/settings.schema";

type Result = { success: boolean; message: string };

export async function updateProfileAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, image: parsed.data.image || null },
  });

  revalidatePath("/dashboard");
  return { success: true, message: "Profile updated." };
}

export async function resendVerificationEmailAction(): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });
  if (!user?.email) return { success: false, message: "No email on file." };
  if (user.emailVerified) return { success: false, message: "Your email is already verified." };

  await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: user.email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  await sendVerificationEmail(user.email, token);
  return { success: true, message: "Verification email sent." };
}

export async function changePasswordAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

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
  await prisma.user.update({ where: { id: session.user.id }, data: { password: hash } });

  return { success: true, message: "Password changed." };
}

export async function setPasswordAction(input: unknown): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  const parsed = setPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

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
}

export async function updateThemeAction(theme: "light" | "dark" | "auto"): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  await prisma.user.update({ where: { id: session.user.id }, data: { theme } });
  return { success: true, message: "Theme updated." };
}

export async function updateMonthlyReportAction(enabled: boolean): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

  await prisma.user.update({ where: { id: session.user.id }, data: { monthlyReportEnabled: enabled } });
  return { success: true, message: enabled ? "Monthly report enabled." : "Monthly report disabled." };
}

export async function deleteAccountAction(): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, message: "Unauthorized" };

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

  await prisma.user.delete({ where: { id: session.user.id } });
  return { success: true, message: "Account deleted." };
}
