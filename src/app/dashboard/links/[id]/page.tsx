import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MousePointerClick, Lock, Clock, PenLine } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getLinkById } from "@/server/queries/link.queries";
import { generateQrCodeDataUrl } from "@/server/services/qr.service";
import { getDemoLinkDetail, getDemoLinkAnalytics } from "@/lib/demo-stats";
import { getShortUrl } from "@/lib/short-url";
import { getLinkAnalytics } from "@/server/queries/link-analytics.queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { CopyButton } from "@/components/shared/copy-button";
import { QrPreview } from "@/components/shared/qr-preview";
import { QrDownloadButton } from "@/features/links/components/qr-download-button";
import { RecentClicksTable } from "@/features/links/components/recent-clicks-table";
import { LinkAnalyticsSection } from "@/features/links/components/link-analytics-section";

export const metadata: Metadata = { title: "Link Details" };

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let link: Awaited<ReturnType<typeof getLinkById>>;
  let analytics7:  ReturnType<typeof getDemoLinkAnalytics> | null;
  let analytics30: ReturnType<typeof getDemoLinkAnalytics> | null;
  let analytics90: ReturnType<typeof getDemoLinkAnalytics> | null;

  if (IS_DEMO) {
    link        = getDemoLinkDetail(id) as unknown as Awaited<ReturnType<typeof getLinkById>>;
    analytics7  = getDemoLinkAnalytics(7);
    analytics30 = getDemoLinkAnalytics(30);
    analytics90 = getDemoLinkAnalytics(90);
  } else {
    const [fetchedLink, a7, a30, a90] = await Promise.all([
      getLinkById(id, session.user.id),
      getLinkAnalytics(id, session.user.id, 7),
      getLinkAnalytics(id, session.user.id, 30),
      getLinkAnalytics(id, session.user.id, 90),
    ]);
    if (!fetchedLink) notFound();
    link        = fetchedLink;
    analytics7  = a7;
    analytics30 = a30;
    analytics90 = a90;
  }

  if (!link) notFound();

  const shortUrl  = getShortUrl(link.shortCode, link.customDomain);
  const isExpired = link.expiresAt ? link.expiresAt < new Date() : false;
  const qrDataUrl = await generateQrCodeDataUrl(shortUrl, {
    fg:      link.qrFgColor,
    bg:      link.qrBgColor,
    ecLevel: link.qrEcLevel,
    margin:  link.qrMargin,
  });

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="mt-1 shrink-0">
          <Link href="/dashboard/links">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="truncate text-2xl font-bold text-foreground">
              {link.title || link.shortCode}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              {isExpired ? (
                <Badge variant="secondary" className="bg-destructive/10 text-destructive">Expired</Badge>
              ) : link.isActive ? (
                <Badge variant="secondary" className="bg-primary/10 text-primary">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {link.isPasswordProtected && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <Lock className="mr-1 h-3 w-3" /> Password
                </Badge>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/links/${id}/edit`}>
                  <PenLine className="mr-1.5 h-3.5 w-3.5" />
                  Edit link
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              {shortUrl}
            </a>
            <ExternalLink className="h-3 w-3 text-primary" />
            <CopyButton value={shortUrl} size="icon" label="" copiedLabel="" variant="ghost" />
          </div>

          <p className="break-all text-sm text-muted-foreground">{link.originalUrl}</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total clicks" value={link._count.clicks} icon={MousePointerClick} />
        <StatCard
          title="Max clicks"
          value={link.maxClicks ? `${link._count.clicks} / ${link.maxClicks}` : "No limit"}
          icon={MousePointerClick}
        />
        <StatCard
          title="Expires"
          value={
            link.expiresAt
              ? link.expiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Never"
          }
          icon={Clock}
        />
        <StatCard
          title="Created"
          value={link.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          icon={Clock}
        />
      </div>

      {/* ── Analytics ── */}
      {analytics30 && (
        <LinkAnalyticsSection
          analytics={{
            7:  analytics7  ?? analytics30,
            30: analytics30,
            90: analytics90 ?? analytics30,
          }}
        />
      )}

      {/* ── Recent clicks + QR code ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentClicksTable clicks={link.clicks} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <QrPreview src={qrDataUrl} size={180} />
            <QrDownloadButton dataUrl={qrDataUrl} shortCode={link.shortCode} />
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
