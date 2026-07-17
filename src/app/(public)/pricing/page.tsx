import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

import { PricingPlans } from "@/components/marketing/pricing-plans";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free with 50 links and 2 campaigns. Upgrade to Starter or Pro for longer analytics windows, more links, custom domains, and shareable client reports.",
  alternates: { canonical: `${siteConfig.url}/pricing` },
  openGraph: {
    title: "LinkPilot Pricing — Free, Starter, and Pro Plans",
    description:
      "Free account includes 50 links, 2 campaigns, and basic analytics. Upgrade for custom domains, unlimited campaigns, and client-ready reports.",
    url: `${siteConfig.url}/pricing`,
    siteName: "LinkPilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkPilot Pricing — Free, Starter, and Pro Plans",
    description:
      "Free account includes 50 links, 2 campaigns, and basic analytics. Upgrade for custom domains, unlimited campaigns, and client-ready reports.",
  },
};

const faqs = [
  {
    q: "Is the free plan really permanent?",
    a: "Yes. No trial period, no expiry. Your free account gives you 50 managed links, 2 campaigns, and basic analytics — forever. No credit card needed to sign up.",
  },
  {
    q: "If I delete a link, do I get my slot back?",
    a: "On the free plan, no. We use a lifetime counter to prevent abuse, so deleted links still count toward your 50-link allowance. On Starter and Pro, your quota is based on active links, so deleting one frees up a slot.",
  },
  {
    q: "Does my client need to log in to view a campaign report?",
    a: "No. Campaign reports are shared via a public link — your client opens it in any browser, no account required. This is available on Pro and Agency plans.",
  },
  {
    q: "What's the difference between Starter and Pro?",
    a: "Starter is for tracking: 500 links, 100 campaigns, per-channel analytics, 30-day history. Pro adds the client-facing layer: shareable report pages, branded custom domains, and campaign PDF export. If you send reports to clients, you want Pro.",
  },
  {
    q: "Can I switch plans or cancel anytime?",
    a: "Yes. Upgrade, downgrade, or cancel anytime from your billing settings — no lock-in, no cancellation fees. If you cancel, you stay on your paid plan until the end of the billing period.",
  },
  {
    q: "What counts as a 'link' on the free plan?",
    a: "A managed link is one you create in your dashboard with a custom slug, analytics, and optional features like expiry or password. Guest links (created on the homepage without an account) are separate and expire in 7 days.",
  },
];

export default function PricingPage() {
  return (
    <main>
      {/* Header */}
      <section className="border-b border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Starter is $5/month.
            <span className="block text-primary">One client report pays for it.</span>
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Start free with 50 permanent links and 2 campaigns. Upgrade when you need
            longer analytics, more campaigns, or a report you can share with a client
            instead of a screenshot.
          </p>
        </div>
      </section>

      {/* Value framing strip */}
      <section className="border-b border-border bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-0 overflow-hidden rounded-2xl border border-border shadow-sm sm:grid-cols-2">
            <div className="border-b border-border bg-destructive/10 px-6 py-7 sm:border-b-0 sm:border-r">
              <p className="text-xs font-semibold uppercase tracking-widest text-destructive mb-4">Without LinkPilot</p>
              <ul className="space-y-3 text-sm text-foreground/80">
                {[
                  "Sending Google Analytics screenshots to clients",
                  "No idea which channel drove the most clicks",
                  "Links scattered across Bitly, email drafts, spreadsheets",
                  "Manually exporting CSVs and building reports in Slides",
                  "Client asks 'how did the campaign do?' — you guess",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-destructive shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary/10 px-6 py-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">With Starter — $5/month</p>
              <ul className="space-y-3 text-sm text-foreground/80">
                {[
                  "Every link tracked by channel from day one",
                  "Per-channel analytics — Instagram vs email vs Google",
                  "All campaign links organised in one dashboard",
                  "Share a live report — client opens it, no login",
                  "Client asks the same question — you send one link",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-primary shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Branded domain call-out */}
      <section className="border-b border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-primary">
            Pro feature spotlight
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="grid sm:grid-cols-[1fr_auto_1fr]">
              {/* Before */}
              <div className="px-8 py-8 text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Free / Starter</p>
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  <code className="text-sm font-mono font-semibold text-muted-foreground">lnkplt.co/xk92m</code>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Looks like a generic shortener.</p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center border-x border-border px-4 py-4 sm:py-8">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>

              {/* After */}
              <div className="px-8 py-8 text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Pro plan</p>
                <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <code className="text-sm font-mono font-semibold text-primary">go.acmecorp.com/summer</code>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Looks like you built something for them.</p>
              </div>
            </div>

            <div className="border-t border-border bg-muted/30 px-8 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Branded custom domains</strong> are a Pro feature.
                Your client sees your domain — not ours. That&apos;s the link that justifies your agency fee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans + comparison */}
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PricingPlans />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
            Common questions
          </h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-border bg-card shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-sm font-semibold text-foreground hover:text-primary">
                  {q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="border-t border-border px-6 pb-5 pt-4 text-sm leading-7 text-muted-foreground">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Agency / contact CTA */}
      <section className="border-t border-border bg-background px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-slate-950 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-bold text-white">
            Need a custom Agency setup?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Multiple client workspaces, advanced reporting exports, custom link
            volume, dedicated onboarding, and an account manager. Pricing based
            on team size.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/contact">Talk to us about Agency</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-800 bg-transparent">
              <Link href="/features">See all features</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
