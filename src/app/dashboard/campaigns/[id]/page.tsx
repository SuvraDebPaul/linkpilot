import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Link2,
  MousePointerClick,
  ExternalLink,
  FileText,
  QrCode,
  Mail,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getCampaignById } from "@/server/queries/campaign.queries";
import { getUserPlan } from "@/lib/subscription";
import { getDemoCampaignDetail } from "@/lib/demo-stats";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { LinkStatusBadge } from "@/components/shared/link-status-badge";
import { CampaignActions } from "@/features/campaigns/components/campaign-actions";
import { AddLinkToCampaign } from "@/features/campaigns/components/add-link-to-campaign";
import { RemoveLinkFromCampaign } from "@/features/campaigns/components/remove-link-from-campaign";
import { ReportEmailForm } from "@/features/campaigns/components/report-email-form";
import { faviconUrl } from "@/lib/favicon";

export const metadata: Metadata = { title: "Campaign" };

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let campaign: Awaited<ReturnType<typeof getCampaignById>>;
  let plan: Awaited<ReturnType<typeof getUserPlan>>;

  if (IS_DEMO) {
    campaign = getDemoCampaignDetail(id) as unknown as Awaited<
      ReturnType<typeof getCampaignById>
    >;
    plan = "pro";
  } else {
    const [c, p] = await Promise.all([
      getCampaignById(id, session.user.id),
      getUserPlan(session.user.id),
    ]);
    campaign = c;
    plan = p;
  }
  if (!campaign) notFound();

  const canScheduleEmails = plan === "starter" || plan === "pro";

  const totalClicks = campaign.links.reduce(
    (sum, l) => sum + l._count.clicks,
    0,
  );
  const activeLinks = campaign.links.filter(
    (l) => l.isActive && (!l.expiresAt || l.expiresAt > new Date()),
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button asChild variant="ghost" size="icon" className="mt-1 shrink-0">
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {campaign.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={`/dashboard/campaigns/${campaign.id}/qr-assets`}>
                <QrCode className="h-4 w-4" /> QR Assets
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={`/dashboard/campaigns/${campaign.id}/report`}>
                <FileText className="h-4 w-4" /> Report
              </Link>
            </Button>
            <CampaignActions
              campaign={{
                id: campaign.id,
                name: campaign.name,
                description: campaign.description,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total links"
          value={campaign.links.length}
          icon={Link2}
        />
        <StatCard
          title="Total clicks"
          value={totalClicks}
          icon={MousePointerClick}
        />
        <StatCard
          title="Active links"
          value={activeLinks}
          icon={Link2}
          variant="success"
        />
      </div>

      {/* Scheduled report emails */}
      {canScheduleEmails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-primary" /> Scheduled report emails
            </CardTitle>
            <CardDescription>
              Send clients an automatic campaign summary — weekly or monthly, no
              login required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReportEmailForm
              campaignId={campaign.id}
              hasShareToken={!!campaign.shareToken}
              initialEnabled={campaign.reportEmailEnabled}
              initialFrequency={campaign.reportEmailFrequency ?? "weekly"}
              initialRecipients={campaign.reportEmailRecipients}
            />
          </CardContent>
        </Card>
      )}

      {/* Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Link2 className="h-4 w-4 text-primary" /> Links in this campaign
          </CardTitle>
          <AddLinkToCampaign
            campaignId={campaign.id}
            userId={session.user.id}
          />
        </CardHeader>
        <CardContent>
          {campaign.links.length === 0 ? (
            <EmptyState
              icon={Link2}
              title="No links yet"
              description="Use Add link to assign existing links to this campaign."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide">
                        Link
                      </th>
                      <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide sm:table-cell">
                        Clicks
                      </th>
                      <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide md:table-cell">
                        Status
                      </th>
                      <th className="w-10 px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {campaign.links.map((link) => {
                      const favicon = faviconUrl(link.originalUrl);
                      return (
                        <tr
                          key={link.id}
                          className="group transition-colors hover:bg-muted/40"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                                {favicon ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={favicon}
                                    alt=""
                                    className="h-3.5 w-3.5"
                                  />
                                ) : (
                                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <Link
                                  href={`/dashboard/links/${link.id}`}
                                  className="block truncate font-medium text-foreground hover:underline"
                                >
                                  {link.title || link.shortCode}
                                </Link>
                                <a
                                  href={`${siteConfig.url}/${link.shortCode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex w-fit items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  {siteConfig.url.replace(/^https?:\/\//, "")}/
                                  {link.shortCode}
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-foreground sm:table-cell">
                            {link._count.clicks.toLocaleString()}
                          </td>
                          <td className="hidden px-4 py-3 md:table-cell">
                            <LinkStatusBadge
                              isActive={link.isActive}
                              expiresAt={link.expiresAt}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <RemoveLinkFromCampaign
                              linkId={link.id}
                              campaignId={campaign.id}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
