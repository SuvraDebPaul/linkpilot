import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getCampaignByShareToken, getCampaignReportData, getCampaignDeviceBreakdown } from "@/server/queries/campaign.queries";
import { ReportContent } from "@/features/campaigns/components/report-content";
import { ReportDateFilter } from "@/features/campaigns/components/report-date-filter";
import { PrintButton } from "@/features/campaigns/components/print-button";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const campaign = await getCampaignByShareToken(token);
  if (!campaign) return { title: "Report not found", robots: { index: false, follow: false } };
  return {
    title: `${campaign.name} — Campaign Report`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { token } = await params;
  const { from: fromStr, to: toStr } = await searchParams;

  const from = fromStr ? new Date(fromStr) : null;
  const to = toStr ? new Date(toStr + "T23:59:59") : null;

  const campaign = await getCampaignReportData(token, from, to);
  if (!campaign) notFound();

  const deviceBreakdown = await getCampaignDeviceBreakdown(
    campaign.links.map((l: { id: string }) => l.id),
    from,
    to,
  );

  const basePath = `/report/${token}`;
  const branding = campaign.workspace;
  const hasBranding = !!(branding?.brandLogoUrl || branding?.brandColor);

  // CSS variable override for brand color — cascades to all text-primary / bg-primary usages
  const brandStyle = branding?.brandColor
    ? ({ "--primary": branding.brandColor, "--primary-foreground": "#ffffff" } as React.CSSProperties)
    : undefined;

  return (
    <div
      className="min-h-screen bg-muted/40 px-4 py-10 sm:px-6 lg:px-8 print:bg-card print:p-0"
      style={brandStyle}
    >
      {/* Header */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between print:hidden">
        {branding?.brandLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.brandLogoUrl}
            alt="Brand logo"
            className="h-8 max-w-[160px] object-contain"
          />
        ) : (
          <Logo />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Suspense>
            <ReportDateFilter basePath={basePath} />
          </Suspense>
          <PrintButton />
        </div>
      </div>

      <ReportContent
        campaignName={campaign.name}
        campaignDescription={campaign.description ?? null}
        links={campaign.links}
        deviceBreakdown={deviceBreakdown.map((r) => ({ device: r.device, count: r._count.id }))}
        from={from}
        to={to}
      />

      {/* Footer — three states */}
      <div className="mx-auto mt-10 max-w-3xl print:hidden">
        {hasBranding && branding?.hideBranding ? null : hasBranding ? (
          // Starter white-label: subtle powered-by footer
          <p className="text-center text-xs text-muted-foreground">
            Powered by{" "}
            <Link href="/" className="font-medium text-foreground hover:underline">
              LinkPilot
            </Link>
          </p>
        ) : (
          // No branding set: full conversion CTA
          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-6 py-6 text-center">
            <p className="text-sm font-semibold text-foreground">
              Want reports like this for your own campaigns?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              LinkPilot gives you 50 managed links and 2 campaigns free — no credit card needed.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="sm">
                <Link href="/register">Create free account</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/pricing">See all plans</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
