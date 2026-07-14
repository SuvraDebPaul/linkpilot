import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { siteConfig } from "@/config/site";
import { prisma } from "@/server/db/prisma";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth-messages";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: SESSION_EXPIRED_MESSAGE }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${siteConfig.url}/dashboard/settings/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[stripe-portal] failed:", err);
    return NextResponse.json(
      { error: "Couldn't open the billing portal. Please try again or contact support." },
      { status: 500 },
    );
  }
}
