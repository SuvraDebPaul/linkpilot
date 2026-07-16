import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/server/db/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // One-time lifetime payment
        if (session.mode === "payment") {
          const pi = session.payment_intent
            ? await stripe.paymentIntents.retrieve(session.payment_intent as string)
            : null;
          const userId = pi?.metadata?.userId;
          if (userId && pi?.metadata?.plan === "lifetime") {
            await prisma.user.update({
              where: { id: userId },
              // Clear any stale subscription data — lifetime supersedes it
              data: {
                lifetimeAccess: true,
                stripeSubscriptionId: null,
                stripePriceId: null,
                stripeCurrentPeriodEnd: null,
              },
            });
          }
          break;
        }

        if (session.mode !== "subscription" || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = sub.metadata.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id ?? null,
            stripeCurrentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
          },
        });
        break;
      }

      // Renewal or mid-period plan change
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subId = typeof subRef === "string" ? subRef : subRef?.id;
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripePriceId: sub.items.data[0]?.price.id ?? null,
            stripeCurrentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
          },
        });
        break;
      }

      // Plan upgrade / downgrade via customer portal
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id ?? null,
            stripeCurrentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
          },
        });
        break;
      }

      // Cancellation / non-renewal
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });
        break;
      }

      // Failed charge — log; no action needed (Stripe retries automatically)
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("[stripe] payment failed for customer", invoice.customer);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook]", err);
    await prisma.webhookEventLog.create({
      data: {
        eventType: event.type,
        status: "error",
        errorMessage: err instanceof Error ? err.message : String(err),
      },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  await prisma.webhookEventLog.create({
    data: { eventType: event.type, status: "success" },
  });

  return NextResponse.json({ received: true });
}
