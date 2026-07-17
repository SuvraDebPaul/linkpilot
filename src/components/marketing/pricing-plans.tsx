"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Cycle = "monthly" | "yearly";

const plans = [
  {
    name: "Free",
    badge: "Free account",
    description: "50 permanent links, 2 campaigns, 7-day analytics. No card needed, no time limit. A real taste of the platform.",
    monthly: { price: "$0", note: "forever" },
    yearly: { price: "$0", note: "forever" },
    cta: "Create free account",
    href: "/register",
    featured: false,
    agency: false,
    features: [
      "50 permanent managed links",
      "2 campaigns to organise your links",
      "Basic analytics — clicks & device type",
      "QR code for every managed link",
      "Password protection & expiry controls",
      "Custom short link slugs",
    ],
    unavailable: [
      "Advanced analytics (referrer, country)",
      "Client-ready report pages",
      "Branded custom domains",
      "Team workspaces",
    ],
  },
  {
    name: "Starter",
    badge: "Most popular",
    description: "Track every link you share — by channel, by campaign, by day. Stop guessing which channel drove the click.",
    monthly: { price: "$5", note: "per month" },
    yearly: { price: "$4", note: "per month, billed $48/yr" },
    cta: "Start tracking",
    href: "/register",
    featured: true,
    agency: false,
    features: [
      "Up to 500 permanent managed links",
      "Up to 100 campaigns",
      "Campaign dashboard & link organisation",
      "Click, device, referrer & country analytics",
      "QR code for every managed link",
      "Password protection & expiry controls",
      "Max-click limits on links",
      "Custom short link slugs",
      "Shareable campaign summary links",
      "Link status control (active / paused)",
    ],
    unavailable: [
      "Client-ready report pages",
      "Branded custom domains",
      "Team workspaces",
    ],
  },
  {
    name: "Pro",
    badge: "Full power",
    description: "Send clients a live report and branded links. go.yourclient.com — not lnkplt.co. That's the upgrade that lets you charge more.",
    monthly: { price: "$10", note: "per month" },
    yearly: { price: "$8", note: "per month, billed $96/yr" },
    cta: "Get started",
    href: "/register",
    featured: false,
    agency: false,
    features: [
      "Everything in Starter",
      "Unlimited links & campaigns",
      "Advanced analytics (all metrics)",
      "Client-ready shareable report pages",
      "Campaign reports with date-range filtering",
      "Shareable public reports — no client login needed",
      "Branded custom domains (e.g. go.yourbrand.com)",
      "Campaign PDF export",
      "Max-click limits & advanced expiry controls",
      "Priority support",
    ],
    unavailable: [
      "Multiple team workspaces",
      "Client management portal",
    ],
  },
  {
    name: "Agency",
    badge: "Custom",
    description: "For teams managing multiple clients, workspaces, and reporting workflows at scale.",
    monthly: { price: "Custom", note: "contact us" },
    yearly: { price: "Custom", note: "contact us" },
    cta: "Contact us",
    href: "/contact",
    featured: false,
    agency: true,
    features: [
      "Everything in Pro",
      "Multiple team workspaces",
      "Client management portal",
      "Advanced reporting & data exports",
      "Custom link volume — no cap",
      "Custom branded domain setup & support",
      "Dedicated account manager",
      "Custom onboarding & team training",
      "Priority feature requests",
      "SLA & billing flexibility",
    ],
    unavailable: [],
  },
];

const comparison = [
  {
    feature: "Permanent managed links",
    free: "50", starter: "500", pro: "Unlimited", agency: "Unlimited",
  },
  {
    feature: "Campaigns",
    free: "2", starter: "100", pro: "Unlimited", agency: "Unlimited",
  },
  {
    feature: "QR code per link",
    free: true, starter: true, pro: true, agency: true,
  },
  {
    feature: "Password protection",
    free: true, starter: true, pro: true, agency: true,
  },
  {
    feature: "Link expiry control",
    free: true, starter: true, pro: true, agency: true,
  },
  {
    feature: "Custom link slugs",
    free: true, starter: true, pro: true, agency: true,
  },
  {
    feature: "Max-click limits",
    free: false, starter: true, pro: true, agency: true,
  },
  {
    feature: "Link status control (pause/resume)",
    free: false, starter: true, pro: true, agency: true,
  },
  {
    feature: "Click & device analytics",
    free: "Basic", starter: true, pro: true, agency: true,
  },
  {
    feature: "Referrer & country analytics",
    free: false, starter: true, pro: true, agency: true,
  },
  {
    feature: "Advanced analytics",
    free: false, starter: false, pro: true, agency: true,
  },
  {
    feature: "Shareable campaign summary",
    free: false, starter: true, pro: true, agency: true,
  },
  {
    feature: "Client-ready report pages",
    free: false, starter: false, pro: true, agency: true,
  },
  {
    feature: "Campaign PDF export",
    free: false, starter: false, pro: true, agency: true,
  },
  {
    feature: "Shareable public reports",
    free: false, starter: false, pro: true, agency: true,
  },
  {
    feature: "Branded custom domains",
    free: false, starter: false, pro: true, agency: true,
  },
  {
    feature: "Team workspaces",
    free: false, starter: false, pro: false, agency: true,
  },
  {
    feature: "Client management portal",
    free: false, starter: false, pro: false, agency: true,
  },
  {
    feature: "Data exports",
    free: false, starter: false, pro: false, agency: true,
  },
  {
    feature: "Dedicated account manager",
    free: false, starter: false, pro: false, agency: true,
  },
  {
    feature: "Support",
    free: "Community", starter: "Email", pro: "Priority", agency: "Dedicated",
  },
];

function CellValue({ val }: { val: boolean | string }) {
  if (val === true)
    return <Check className="mx-auto h-4 w-4 text-primary" />;
  if (val === false)
    return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  return <span className="text-muted-foreground">{val}</span>;
}

export function PricingPlans() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <div className="space-y-20">
      {/* Toggle */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCycle("monthly")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
              cycle === "monthly"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("yearly")}
            className={`relative rounded-lg px-5 py-2.5 text-sm font-medium transition ${
              cycle === "yearly"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Yearly
            <span className="absolute -top-2.5 -right-3 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground leading-none">
              −20%
            </span>
          </button>
        </div>
        {cycle === "yearly" && (
          <p className="text-xs text-primary font-medium">
            Starter yearly = $48/yr — save $12 vs monthly billing
          </p>
        )}
      </div>

      {/* Guest shortener note */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t want to sign up yet?{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          Use the free homepage shortener
        </Link>{" "}
        — no account needed, links expire in 7 days.
      </p>

      {/* Plan cards — 2-column on md, 4-column on xl */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const pricing = plan[cycle];
          const isCustom = pricing.price === "Custom";

          return (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? "relative border-primary/30 bg-card shadow-xl shadow-primary/10"
                  : plan.agency
                    ? "border-slate-700 bg-slate-950 text-white shadow-sm"
                    : "border-border bg-card shadow-sm"
              }
            >
              <CardHeader className="pb-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2
                    className={`text-xl font-bold ${plan.agency ? "text-white" : "text-foreground"}`}
                  >
                    {plan.name}
                  </h2>
                  <Badge
                    className={
                      plan.featured
                        ? "bg-primary/10 text-primary"
                        : plan.agency
                          ? "bg-slate-800 text-slate-300"
                          : "bg-muted text-foreground"
                    }
                  >
                    {plan.badge}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-black tracking-tight ${plan.agency ? "text-white" : "text-foreground"}`}
                  >
                    {pricing.price}
                  </span>
                  {!isCustom && (
                    <span className={`text-sm ${plan.agency ? "text-slate-400" : "text-muted-foreground"}`}>
                      /mo
                    </span>
                  )}
                </div>

                <p className={`text-xs ${plan.agency ? "text-slate-400" : "text-muted-foreground"}`}>
                  {pricing.note}
                  {cycle === "yearly" && !isCustom && plan.name !== "Free" && (
                    <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      Save 20%
                    </span>
                  )}
                </p>
                {plan.featured && (
                  <p className="mt-1.5 text-xs font-medium text-primary">
                    Less than a coffee/mo — one campaign report pays for it.
                  </p>
                )}

                <p
                  className={`mt-3 text-sm leading-6 ${plan.agency ? "text-slate-300" : "text-muted-foreground"}`}
                >
                  {plan.description}
                </p>

                {plan.name === "Pro" && (
                  <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-center">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Your links look like</p>
                    <div className="flex flex-col items-center gap-1.5">
                      <code className="text-xs font-mono text-muted-foreground line-through">lnkplt.co/xk92m</code>
                      <span className="text-[10px] text-muted-foreground/60">↓</span>
                      <code className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-mono font-semibold text-primary">go.yourclient.com/promo</code>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  asChild
                  className={`w-full ${
                    plan.featured
                      ? ""
                      : plan.agency
                        ? "border-slate-700 bg-white text-slate-950 hover:bg-slate-100"
                        : ""
                  }`}
                  variant={plan.featured ? "default" : plan.agency ? "outline" : "outline"}
                >
                  <Link href={plan.href}>
                    {plan.agency && <Phone className="mr-2 h-4 w-4" />}
                    {plan.cta}
                  </Link>
                </Button>

                <div className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className={plan.agency ? "text-slate-300" : "text-foreground/80"}>
                        {f}
                      </span>
                    </div>
                  ))}
                  {plan.unavailable.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm">
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                      <span className="text-muted-foreground/70">{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison table */}
      <div>
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
          Full feature comparison
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-6 py-4 font-semibold text-foreground">Feature</th>
                  {["Free", "Starter", "Pro", "Agency"].map((h) => (
                    <th key={h} className="px-6 py-4 text-center font-semibold text-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison.map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/30">
                    <td className="px-6 py-3.5 font-medium text-foreground/80">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center"><CellValue val={row.free} /></td>
                    <td className="px-6 py-3.5 text-center"><CellValue val={row.starter} /></td>
                    <td className="px-6 py-3.5 text-center"><CellValue val={row.pro} /></td>
                    <td className="px-6 py-3.5 text-center"><CellValue val={row.agency} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
