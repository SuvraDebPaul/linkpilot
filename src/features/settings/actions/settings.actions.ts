"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { stripe } from "@/lib/stripe";
import {
  changePasswordSchema,
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
    data: { name: parsed.data.name },
  });

  revalidatePath("/dashboard");
  return { success: true, message: "Profile updated." };
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
