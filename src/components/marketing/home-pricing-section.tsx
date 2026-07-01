import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    tagline: "50 links · 2 campaigns · analytics",
    monthly: "$0",
    yearly: "$0",
    period: "forever",
    cta: "Create free account",
    href: "/register",
    featured: false,
    agency: false,
    items: [
      "50 permanent managed links",
      "2 campaigns with basic analytics",
      "QR code, password protection & expiry",
    ],
  },
  {
    name: "Starter",
    tagline: "Campaign dashboard + analytics",
    monthly: "$5",
    yearly: "$4",
    period: "/mo",
    cta: "Start tracking",
    href: "/register",
    featured: true,
    agency: false,
    items: [
      "500 permanent links & 100 campaigns",
      "Click, device & referrer analytics",
      "QR code, custom slugs & max-click limits",
    ],
  },
  {
    name: "Pro",
    tagline: "Client reports + branded domains",
    monthly: "$10",
    yearly: "$8",
    period: "/mo",
    cta: "Get started",
    href: "/register",
    featured: false,
    agency: false,
    items: [
      "Unlimited links & campaigns",
      "Client-ready shareable report pages",
      "Branded custom domains",
    ],
  },
  {
    name: "Agency",
    tagline: "Teams, clients, advanced reporting",
    monthly: "Custom",
    yearly: "Custom",
    period: "",
    cta: "Contact us",
    href: "/contact",
    featured: false,
    agency: true,
    items: [
      "Multiple team workspaces",
      "Client management portal",
      "Dedicated support & onboarding",
    ],
  },
];

export function HomePricingSection() {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Start free. Pay for what you actually use.
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Free account includes 50 links, 2 campaigns, and basic analytics — no card needed. Yearly plans save 20%.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.featured
                  ? "border-primary/30 bg-white shadow-xl shadow-primary/10/60"
                  : plan.agency
                    ? "border-slate-300 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              {plan.featured && (
                <div className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </div>
              )}
              <p className={`text-lg font-bold ${plan.agency ? "text-white" : "text-slate-950"}`}>
                {plan.name}
              </p>
              <p className={`mt-0.5 text-xs ${plan.agency ? "text-slate-400" : "text-slate-500"}`}>
                {plan.tagline}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-3xl font-black ${plan.agency ? "text-white" : "text-slate-950"}`}>
                  {plan.monthly}
                </span>
                {plan.period && (
                  <span className={`text-sm ${plan.agency ? "text-slate-400" : "text-slate-400"}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              {plan.yearly !== plan.monthly && plan.monthly !== "Custom" && (
                <p className="mt-0.5 text-xs text-primary font-medium">
                  {plan.yearly}/mo billed yearly · save 20%
                </p>
              )}

              <ul className="mt-5 space-y-2">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${plan.agency ? "text-primary" : "text-primary"}`} />
                    <span className={plan.agency ? "text-slate-300" : "text-slate-600"}>{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-6 w-full ${plan.agency ? "border-slate-700 bg-white text-slate-950 hover:bg-slate-100" : ""}`}
                variant={plan.featured ? "default" : "outline"}
                size="sm"
              >
                <Link href={plan.href}>
                  {plan.agency && <Phone className="mr-1.5 h-3.5 w-3.5" />}
                  {plan.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Want to try without signing up?{" "}
          <Link href="/" className="underline hover:text-slate-600">
            Use the free homepage shortener
          </Link>{" "}
          — no account, links expire in 7 days.
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary"
          >
            See full pricing & feature comparison
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
