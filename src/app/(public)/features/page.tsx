import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Globe2,
  Lock,
  Monitor,
  QrCode,
  ShieldCheck,
  Smartphone,
  TrendingUp,
} from "lucide-react";

import { FinalCta } from "@/components/marketing/final-cta";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore LinkPilot features: short links with expiry and passwords, trackable QR codes, campaign dashboards, click analytics, and shareable client reports.",
  alternates: { canonical: `${siteConfig.url}/features` },
  openGraph: {
    title: "LinkPilot Features — Short Links, QR Codes, Campaigns & Analytics",
    description:
      "Everything you need to manage links for clients: short links, QR codes, campaign grouping, click analytics, and branded shareable reports.",
    url: `${siteConfig.url}/features`,
    siteName: "LinkPilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkPilot Features — Short Links, QR Codes, Campaigns & Analytics",
    description:
      "Everything you need to manage links for clients: short links, QR codes, campaign grouping, click analytics, and branded shareable reports.",
  },
};

const corFeatures = [
  {
    icon: QrCode,
    title: "Trackable QR codes",
    description:
      "Every link gets a QR code automatically. Put it on a flyer, menu, or poster — and see exactly how many people scanned it, from where, and on which device.",
  },
  {
    icon: BarChart3,
    title: "Per-channel analytics",
    description:
      "See which channel drove the click — Google, Instagram, email, or printed QR. Compare sources side by side before you spend again.",
  },
  {
    icon: FileText,
    title: "Shareable client reports",
    description:
      "Send your client one link. They open a live campaign report — no login, no PDF, no screenshot. You look like a pro.",
  },
  {
    icon: Globe2,
    title: "Clean short links",
    description:
      "lnkplt.co/summer-sale looks trustworthy. A 98-character UTM URL does not. Every link gets a brandable slug.",
  },
  {
    icon: Lock,
    title: "Password-protected links",
    description:
      "Share client previews, internal docs, or gated resources behind a password. Access the link, enter the password, done.",
  },
  {
    icon: ShieldCheck,
    title: "Full link control",
    description:
      "Set expiry dates, click limits, and active/paused status. Expire a link when stock runs out — no 404, just a clean redirect.",
  },
];

const steps = [
  {
    n: "01",
    title: "Create a link for each channel",
    description:
      "Paste a URL, set a slug, choose expiry, add an optional password. Every link gets a QR code automatically — ready to embed or print.",
  },
  {
    n: "02",
    title: "Group them into one campaign",
    description:
      "Instagram link, Google Ad link, email CTA, printed QR code — all in one campaign. Run them side by side and see which channel wins.",
  },
  {
    n: "03",
    title: "Share the report, not the screenshot",
    description:
      "Send your client one link. They see a live campaign report — clicks by channel, device breakdown, QR scans, top links. No login needed.",
  },
];

export default function FeaturesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Platform features"
            title="Every link you share should tell you something."
            description="LinkPilot turns short links into campaign data — and turns that data into a client report you can share in one click."
            align="center"
            headingLevel="h1"
          />
        </div>
      </section>

      {/* Feature grid */}
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {corFeatures.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-muted/30 p-7 transition duration-300 hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-lg"
              >
                <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep dive 1 — QR codes */}
      <section className="border-y border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* Mock */}
            <div className="order-2 lg:order-1">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-4">
                  <p className="text-sm font-semibold text-foreground">QR code — Summer Flyer</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">lnkplt.co/summer-flyer</p>
                </div>

                <div className="flex items-center gap-8 px-6 py-6">
                  {/* SVG QR placeholder */}
                  <div className="shrink-0">
                    <svg viewBox="0 0 80 80" className="h-20 w-20" xmlns="http://www.w3.org/2000/svg">
                      <rect width="80" height="80" fill="white"/>
                      {/* Top-left finder */}
                      <rect x="4" y="4" width="24" height="24" rx="3" fill="#0f172a"/>
                      <rect x="8" y="8" width="16" height="16" rx="1" fill="white"/>
                      <rect x="11" y="11" width="10" height="10" rx="1" fill="#0f172a"/>
                      {/* Top-right finder */}
                      <rect x="52" y="4" width="24" height="24" rx="3" fill="#0f172a"/>
                      <rect x="56" y="8" width="16" height="16" rx="1" fill="white"/>
                      <rect x="59" y="11" width="10" height="10" rx="1" fill="#0f172a"/>
                      {/* Bottom-left finder */}
                      <rect x="4" y="52" width="24" height="24" rx="3" fill="#0f172a"/>
                      <rect x="8" y="56" width="16" height="16" rx="1" fill="white"/>
                      <rect x="11" y="59" width="10" height="10" rx="1" fill="#0f172a"/>
                      {/* Data modules */}
                      {[36,40,44,48,52].map(x => [36,40,44,48,52].map(y => (
                        (x + y) % 8 === 0 &&
                        <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" fill="#0d9488"/>
                      )))}
                      {[36,44,52].map(x => [36,44,52].map(y => (
                        (x * y) % 12 === 0 &&
                        <rect key={`d-${x}-${y}`} x={x} y={y} width="4" height="4" fill="#0f172a"/>
                      )))}
                    </svg>
                  </div>

                  <div className="space-y-3 min-w-0">
                    {[
                      { label: "Total scans", value: "641", sub: "all time" },
                      { label: "This week", value: "48", sub: "+12% vs last week" },
                      { label: "Top city", value: "London", sub: "38% of scans" },
                    ].map(({ label, value, sub }) => (
                      <div key={label} className="flex items-baseline justify-between gap-4">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-foreground">{value}</span>
                          <span className="ml-1 text-xs text-muted-foreground">{sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border px-6 py-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Device split</span>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Smartphone className="h-3 w-3 text-primary"/> 74% mobile
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Monitor className="h-3 w-3 text-muted-foreground"/> 26% desktop
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                QR codes
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Every scan is a data point.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Put a QR code on your flyer, menu, event banner, or product packaging.
                Every time someone scans it, you see it — the city, the device, the time of day.
                You stop guessing whether the print campaign worked.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Generated automatically for every link you create",
                  "Download as PNG — ready to paste into any design",
                  "Track QR scans separately from digital clicks",
                  "See device type: were they on mobile or desktop?",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">
                QR code analytics available on all plans including free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep dive 2 — Campaigns */}
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* Copy */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Campaigns
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                One campaign. Every channel. One report.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Create a separate link for each channel — Instagram, email, Google Ad, printed flyer.
                Group them into a campaign. Now you can see which channel actually drives the click.
                That&apos;s how agencies justify their strategy fee.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Group unlimited links under a single campaign",
                  "Compare channels: social vs email vs offline vs paid",
                  "See total campaign performance at a glance",
                  "Share the full report with one link — no login needed",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">
                2 campaigns on free · 100 campaigns on Starter · Unlimited on Pro
              </p>
            </div>

            {/* Mock — campaign summary */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-muted/40 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Campaign
                    </p>
                    <p className="mt-0.5 text-base font-bold text-foreground">
                      Spring Product Launch
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-center">
                    <p className="text-xl font-black text-primary">2,290</p>
                    <p className="text-xs text-primary">total clicks</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border px-6 py-2">
                {[
                  { channel: "Google Ads", clicks: 847, pct: 100, color: "bg-primary" },
                  { channel: "Instagram Bio", clicks: 612, pct: 72, color: "bg-blue-400" },
                  { channel: "Email newsletter", clicks: 391, pct: 46, color: "bg-violet-400" },
                  { channel: "Facebook Ad", clicks: 284, pct: 34, color: "bg-pink-400" },
                  { channel: "QR — Store flyer", clicks: 156, pct: 18, color: "bg-amber-400" },
                ].map(({ channel, clicks, pct, color }) => (
                  <div key={channel} className="py-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground/80">{channel}</span>
                      <span className="font-semibold text-foreground">{clicks.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border bg-muted/30 px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Google Ads drove <strong className="text-foreground/80">37%</strong> of all clicks.
                  QR flyer drove <strong className="text-foreground/80">7%</strong> — worth scaling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep dive 3 — Analytics */}
      <section className="border-y border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* Mock — analytics summary */}
            <div className="order-2 lg:order-1">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Analytics — last 30 days</p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      Starter plan
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                  {[
                    { label: "Total clicks", value: "4,820", trend: "+24%" },
                    { label: "Unique visitors", value: "3,101", trend: "+18%" },
                    { label: "QR scans", value: "892", trend: "+61%" },
                  ].map(({ label, value, trend }) => (
                    <div key={label} className="px-4 py-4 text-center">
                      <p className="text-lg font-bold text-foreground">{value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                      <p className="mt-1 text-xs font-semibold text-primary">{trend}</p>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Device breakdown
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Mobile", pct: 68 },
                      { label: "Desktop", pct: 22 },
                      { label: "Tablet", pct: 7 },
                      { label: "Other", pct: 3 },
                    ].map(({ label, pct }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="w-14 text-right text-xs text-muted-foreground">{label}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-muted h-1.5">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs font-semibold text-foreground">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border bg-muted/30 px-6 py-3 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    68% of your audience is on mobile. Is your landing page optimised for it?
                  </p>
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Analytics
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Stop guessing. Start knowing.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Total clicks, unique visitors, QR scans, device types, top countries — all per
                link and per campaign. The data you need to tell your client a confident story,
                and to decide where to spend the next budget.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "7-day window on free, 30-day on Starter, 90-day on Pro",
                  "Device breakdown — are your visitors mobile or desktop?",
                  "Compare QR scans vs digital clicks in the same view",
                  "Per-link performance inside each campaign",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">
                Basic analytics free · 30-day history on Starter · 90-day on Pro
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep dive 4 — Branded domains */}
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* Copy */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Branded custom domains
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Your domain. Your client&apos;s trust.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-muted-foreground">lnkplt.co/xk92m</code> looks
                like a free tool. <code className="rounded bg-primary/10 px-1.5 py-0.5 text-sm font-mono text-primary">go.acmecorp.com/summer</code> looks
                like you built it for them. That single change is the difference between a freelancer
                and an agency — and it&apos;s the link that lets you charge more.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Use any domain you own: go.yourbrand.com, links.client.com, track.studio.io",
                  "Every link you create uses your branded domain automatically",
                  "Clients see your domain in every email, message, and QR code",
                  "One domain per workspace — Agency plan for multiple clients",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">
                Branded domains available on Pro plan · $10/month
              </p>
            </div>

            {/* Visual — before/after */}
            <div className="space-y-4">
              {/* Before */}
              <div className="rounded-2xl border border-border bg-muted/30 p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Free / Starter — generic link</p>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                  </div>
                  <code className="flex-1 text-center text-sm font-mono text-muted-foreground">lnkplt.co/<span className="text-muted-foreground/60">xk92m</span></code>
                </div>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Looks like a shortener. Client wonders who &ldquo;lnkplt&rdquo; is.
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                  <ArrowRight className="h-4 w-4 rotate-90 text-primary" />
                </div>
              </div>

              {/* After */}
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">Pro — your branded domain</p>
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-card px-5 py-3.5 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                  </div>
                  <code className="flex-1 text-center text-sm font-mono font-semibold text-primary">
                    go.acmecorp.com/<span className="text-primary">summer-sale</span>
                  </code>
                </div>
                <p className="mt-3 text-center text-xs text-primary font-medium">
                  Looks like you built it specifically for them. That&apos;s the link that charges more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="How it works"
            title="From short link to campaign report in three steps."
            description="Your free account includes 50 links, 2 campaigns, and 7-day analytics — enough to run a real campaign and see what LinkPilot can do."
            align="center"
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(({ n, title, description }) => (
              <div
                key={n}
                className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 p-7"
              >
                <div className="mb-5 text-4xl font-black text-primary/15 select-none">{n}</div>
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </div>
      </section>

      <FinalCta />
    </main>
  );
}
