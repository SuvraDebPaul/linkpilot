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
    <section className="border-b border-border bg-background/10 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start free. Pay for what you actually use.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Free account includes 50 links, 2 campaigns, and basic analytics —
            no card needed. Yearly plans save 20%.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
            const fareCode = plan.name.slice(0, 2).toUpperCase();

            return (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 ${
                  plan.featured
                    ? "border-primary/30 bg-card shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/15"
                    : plan.agency
                      ? "border-slate-700 bg-slate-950 hover:shadow-lg hover:shadow-black/20"
                      : "border-border bg-muted/30 hover:border-primary/20 hover:bg-card hover:shadow-lg"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {plan.featured ? (
                    <div className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-semibold tracking-widest text-primary-foreground">
                      MOST BOOKED
                    </div>
                  ) : (
                    <span />
                  )}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-[10px] font-bold tracking-wide ${
                      plan.agency
                        ? "border-slate-700 text-slate-300"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {fareCode}
                  </span>
                </div>

                <p
                  className={`mt-3 text-lg font-bold ${plan.agency ? "text-white" : "text-foreground"}`}
                >
                  {plan.name}
                </p>
                <p
                  className={`mt-0.5 text-xs ${plan.agency ? "text-slate-400" : "text-muted-foreground"}`}
                >
                  {plan.tagline}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-black ${plan.agency ? "text-white" : "text-foreground"}`}
                  >
                    {plan.monthly}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm ${plan.agency ? "text-slate-400" : "text-muted-foreground"}`}
                    >
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
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span
                        className={
                          plan.agency
                            ? "text-slate-300"
                            : "text-muted-foreground"
                        }
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`my-5 border-t border-dashed ${plan.agency ? "border-slate-700" : "border-border"}`}
                  aria-hidden="true"
                />

                <Button
                  asChild
                  className={`w-full ${plan.agency ? "border-slate-700 bg-white text-slate-950 hover:bg-slate-100" : ""}`}
                  variant={plan.featured ? "default" : "outline"}
                  size="sm"
                >
                  <Link href={plan.href}>
                    {plan.agency && <Phone className="mr-1.5 h-3.5 w-3.5" />}
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Want to try without signing up?{" "}
          <Link href="/" className="underline hover:text-foreground">
            Use the free homepage shortener
          </Link>{" "}
          — no account, links expire in 7 days.
        </p>

        <div className="mt-4 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            See full pricing & feature comparison
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
