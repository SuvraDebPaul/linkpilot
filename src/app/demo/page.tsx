import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { ReportContent } from "@/features/campaigns/components/report-content";
import { PrintButton } from "@/features/campaigns/components/print-button";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Example Campaign Report — LinkPilot Demo",
  description:
    "See what a LinkPilot client-ready campaign report looks like. No login required — this is a live interactive example.",
  robots: { index: true, follow: true },
};

// Realistic demo campaign data
const DEMO_CAMPAIGN = {
  name: "Spring Product Launch",
  description: "Q2 multi-channel campaign for Acme Co. — tracking all paid and organic traffic sources.",
  links: [
    {
      id: "demo-1",
      title: "Google Ads — Homepage",
      shortCode: "acme-google",
      isActive: true,
      expiresAt: null,
      _count: { clicks: 847 },
    },
    {
      id: "demo-2",
      title: "Instagram Bio Link",
      shortCode: "acme-ig",
      isActive: true,
      expiresAt: null,
      _count: { clicks: 612 },
    },
    {
      id: "demo-3",
      title: "Email Newsletter — Main CTA",
      shortCode: "acme-email",
      isActive: true,
      expiresAt: null,
      _count: { clicks: 391 },
    },
    {
      id: "demo-4",
      title: "Facebook Ad — Product Page",
      shortCode: "acme-fb",
      isActive: true,
      expiresAt: null,
      _count: { clicks: 284 },
    },
    {
      id: "demo-5",
      title: "Twitter/X Promotion",
      shortCode: "acme-x",
      isActive: false,
      expiresAt: null,
      _count: { clicks: 156 },
    },
  ],
  deviceBreakdown: [
    { device: "Mobile", count: 1558 },
    { device: "Desktop", count: 504 },
    { device: "Tablet", count: 160 },
    { device: "Other", count: 68 },
  ],
  from: new Date("2026-03-01"),
  to: new Date("2026-04-30"),
};

export default function DemoReportPage() {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10 sm:px-6 lg:px-8 print:bg-card print:p-0">
      {/* Header */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between print:hidden">
        <Logo />
        <PrintButton />
      </div>

      {/* Demo banner */}
      <div className="mx-auto mb-6 max-w-3xl print:hidden">
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-primary">
            <strong>This is an example report.</strong> Your real campaign reports look exactly like this —
            and your clients can open them with a single link, no login required.
          </p>
        </div>
      </div>

      <ReportContent
        campaignName={DEMO_CAMPAIGN.name}
        campaignDescription={DEMO_CAMPAIGN.description}
        links={DEMO_CAMPAIGN.links}
        deviceBreakdown={DEMO_CAMPAIGN.deviceBreakdown}
        from={DEMO_CAMPAIGN.from}
        to={DEMO_CAMPAIGN.to}
      />

      {/* Conversion footer */}
      <div className="mx-auto mt-10 max-w-3xl print:hidden">
        <div className="rounded-2xl border border-border bg-card px-8 py-8 text-center shadow-sm">
          <p className="text-xl font-bold text-foreground">
            Stop sending screenshots. Send reports like this.
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Create short links for every channel, group them into a campaign, and share
            a live report with your client in one click. Free account includes 50 links
            and 2 campaigns — no credit card needed.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See all plans</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/70">
            Shareable reports available on Pro plan · Agency plan for client workspaces
          </p>
        </div>
      </div>
    </div>
  );
}
