import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { stripe, PLANS, type PlanKey } from "@/lib/stripe";
import { siteConfig } from "@/config/site";
import { prisma } from "@/server/db/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: PlanKey };
  if (!PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const selectedPlan = PLANS[plan];

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      lifetimeAccess: true,
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Block lifetime users from re-purchasing
  if (user.lifetimeAccess) {
    return NextResponse.json({ error: "You already have lifetime access." }, { status: 400 });
  }

  // Block duplicate active subscriptions
  if (
    selectedPlan.mode === "subscription" &&
    user.stripeSubscriptionId &&
    user.stripeCurrentPeriodEnd &&
    user.stripeCurrentPeriodEnd > new Date()
  ) {
    return NextResponse.json(
      { error: "You already have an active subscription. Use the billing portal to change plans." },
      { status: 400 }
    );
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const isLifetime = selectedPlan.mode === "payment";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: selectedPlan.mode,
    payment_method_types: ["card"],
    line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
    success_url: `${siteConfig.url}/dashboard/settings/billing?success=1`,
    cancel_url: `${siteConfig.url}/dashboard/settings/billing?canceled=1`,
    ...(isLifetime
      ? { payment_intent_data: { metadata: { userId: session.user.id, plan: "lifetime" } } }
      : { subscription_data: { metadata: { userId: session.user.id } } }),
  });

  return NextResponse.json({ url: checkoutSession.url });
}
