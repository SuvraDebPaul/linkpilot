import { Suspense } from "react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getUserPlan } from "@/lib/subscription";
import { getCampaignById, getCampaignDeviceBreakdown } from "@/server/queries/campaign.queries";
import { getDemoCampaignDetail, getDemoCampaignDeviceBreakdown } from "@/lib/demo-stats";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/features/campaigns/components/print-button";
import { ReportContent } from "@/features/campaigns/components/report-content";
import { ReportDateFilter } from "@/features/campaigns/components/report-date-filter";
import { ShareReportButton } from "@/features/campaigns/components/share-report-button";
import { LockedShareButton } from "@/features/campaigns/components/locked-share-button";

export const metadata: Metadata = { title: "Campaign Report" };

export default async function CampaignReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { id } = await params;
  const { from: fromStr, to: toStr } = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let campaign: Awaited<ReturnType<typeof getCampaignById>>;
  let plan: Awaited<ReturnType<typeof getUserPlan>>;
  let deviceBreakdown: { device: string; count: number }[];

  const from = fromStr ? new Date(fromStr) : null;
  const to   = toStr ? new Date(toStr + "T23:59:59") : null;

  if (IS_DEMO) {
    campaign        = getDemoCampaignDetail(id) as unknown as Awaited<ReturnType<typeof getCampaignById>>;
    plan            = "pro";
    deviceBreakdown = getDemoCampaignDeviceBreakdown();
  } else {
    const [c, p] = await Promise.all([
      getCampaignById(id, session.user.id),
      getUserPlan(session.user.id),
    ]);
    campaign = c;
    plan     = p;
    if (!campaign) notFound();
    const linkIds = campaign!.links.map((l) => l.id);
    const raw     = await getCampaignDeviceBreakdown(linkIds, from, to);
    deviceBreakdown = raw.map((r) => ({ device: r.device, count: r._count.id }));
  }
  if (!campaign) notFound();

  const basePath = `/dashboard/campaigns/${id}/report`;
  const isPro    = plan === "pro";

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href={`/dashboard/campaigns/${id}`}>
            <ArrowLeft className="h-4 w-4" /> Back to campaign
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense>
            <ReportDateFilter basePath={basePath} />
          </Suspense>
          {isPro ? (
            <ShareReportButton campaignId={id} initialToken={campaign.shareToken ?? null} />
          ) : (
            <LockedShareButton />
          )}
          <PrintButton />
        </div>
      </div>

      <ReportContent
        campaignName={campaign.name}
        campaignDescription={campaign.description ?? null}
        links={campaign.links}
        deviceBreakdown={deviceBreakdown}
        from={from}
        to={to}
      />
    </>
  );
}
