"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/server/db/prisma";
import { stripe } from "@/lib/stripe";
import { requireSuperAdmin } from "@/lib/admin-guard";
import { logAdminAction } from "@/server/services/admin-audit.service";

type ActionResult = { success: boolean; message: string };

export async function cancelSubscriptionAction(userId: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });
    if (!user?.stripeSubscriptionId) {
      return { success: false, message: "This user has no active Stripe subscription." };
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    await prisma.user.update({
      where: { id: userId },
      data: { stripeSubscriptionId: null, stripePriceId: null, stripeCurrentPeriodEnd: null },
    });

    await logAdminAction(adminId, "billing.cancel_subscription", {
      targetType: "User",
      targetId: userId,
      metadata: { subscriptionId: user.stripeSubscriptionId },
    });
    revalidatePath(`/admin/users/${userId}`);
    return { success: true, message: "Subscription canceled." };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function refundLatestChargeAction(userId: string): Promise<ActionResult> {
  try {
    const { adminId } = await requireSuperAdmin();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) {
      return { success: false, message: "This user has no Stripe customer record." };
    }

    const charges = await stripe.charges.list({ customer: user.stripeCustomerId, limit: 1 });
    const latestCharge = charges.data[0];
    if (!latestCharge) {
      return { success: false, message: "No charges found for this customer." };
    }
    if (latestCharge.refunded) {
      return { success: false, message: "The most recent charge has already been refunded." };
    }

    const refund = await stripe.refunds.create({ charge: latestCharge.id });

    await logAdminAction(adminId, "billing.refund", {
      targetType: "User",
      targetId: userId,
      metadata: { chargeId: latestCharge.id, amount: refund.amount, currency: refund.currency },
    });
    revalidatePath(`/admin/users/${userId}`);
    return {
      success: true,
      message: `Refunded ${(refund.amount / 100).toFixed(2)} ${refund.currency.toUpperCase()}.`,
    };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : "Something went wrong." };
  }
}
