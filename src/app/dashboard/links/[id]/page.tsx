import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getLinkById } from "@/server/queries/link.queries";
import { generateQrCodeDataUrl } from "@/server/services/qr.service";
import { getShortUrl } from "@/lib/short-url";
import { getLinkAnalytics } from "@/server/queries/link-analytics.queries";

import { Button } from "@/components/ui/button";
import { LinkDetailSidebar } from "@/features/links/components/link-detail-sidebar";
import { LinkDetailTabs } from "@/features/links/components/link-detail-tabs";

export const metadata: Metadata = { title: "Link Details" };

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [link, analytics7, analytics30, analytics90] = await Promise.all([
    getLinkById(id, session.user.id),
    getLinkAnalytics(id, session.user.id, 7),
    getLinkAnalytics(id, session.user.id, 30),
    getLinkAnalytics(id, session.user.id, 90),
  ]);
  if (!link) notFound();

  const shortUrl  = getShortUrl(link.shortCode, link.customDomain);
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
