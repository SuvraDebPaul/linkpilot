import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getLinkById } from "@/server/queries/link.queries";
import { generateQrCodeDataUrl } from "@/server/services/qr.service";
import { getDemoLinkDetail, getDemoLinkAnalytics } from "@/lib/demo-stats";
import { siteConfig } from "@/config/site";
import { getLinkAnalytics } from "@/server/queries/link-analytics.queries";

import { Button } from "@/components/ui/button";
import { LinkDetailSidebar } from "@/features/links/components/link-detail-sidebar";
import { LinkDetailTabs } from "@/features/links/components/link-detail-tabs";

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

  const shortUrl  = `${siteConfig.url}/${link.shortCode}`;
  const qrDataUrl = await generateQrCodeDataUrl(shortUrl, {
    fg:      link.qrFgColor,
    bg:      link.qrBgColor,
    ecLevel: link.qrEcLevel,
    margin:  link.qrMargin,
  });

  return (
    <div className="space-y-4">
      {/* ── Back link ── */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link href="/dashboard/links">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to links
        </Link>
      </Button>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-6">
          <LinkDetailSidebar
            id={link.id}
            title={link.title}
            shortCode={link.shortCode}
            shortUrl={shortUrl}
            originalUrl={link.originalUrl}
            isActive={link.isActive}
            isPasswordProtected={link.isPasswordProtected}
            isFavorite={link.isFavorite}
            expiresAt={link.expiresAt}
            createdAt={link.createdAt}
            maxClicks={link.maxClicks}
            totalClicks={link._count.clicks}
            tags={link.tags}
            qrDataUrl={qrDataUrl}
          />
        </div>

        <LinkDetailTabs
          analytics={{
            7:  analytics7  ?? analytics30!,
            30: analytics30!,
            90: analytics90 ?? analytics30!,
          }}
          clicks={link.clicks}
        />
      </div>
    </div>
  );
}
