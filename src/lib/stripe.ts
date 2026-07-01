import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia", typescript: true });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const PLANS = {
  starter_monthly: {
    name: "Starter",
    billing: "monthly",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 5,
    mode: "subscription" as const,
  },
  starter_yearly: {
    name: "Starter",
    billing: "yearly",
    priceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID!,
    price: 49,
    mode: "subscription" as const,
  },
  pro_monthly: {
    name: "Pro",
    billing: "monthly",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 10,
    mode: "subscription" as const,
  },
  pro_yearly: {
    name: "Pro",
    billing: "yearly",
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
    price: 99,
    mode: "subscription" as const,
  },
  lifetime: {
    name: "Pro Lifetime",
    billing: "once",
    priceId: process.env.STRIPE_LIFETIME_PRICE_ID!,
    price: 199,
    mode: "payment" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
