import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getLinkById } from "@/server/queries/link.queries";
import { getUserPlan } from "@/lib/subscription";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getWorkspaceCampaignsForSelect } from "@/server/queries/campaign.queries";
import { getVerifiedDomainsForWorkspace } from "@/server/queries/domain.queries";
import { prisma } from "@/server/db/prisma";
import { generateQrCodeDataUrl } from "@/server/services/qr.service";
import { getShortUrl } from "@/lib/short-url";

import { Button } from "@/components/ui/button";
import { LinkEditSidebar } from "@/features/links/components/link-edit-sidebar";
import { LinkEditTabs } from "@/features/links/components/link-edit-tabs";
import type { GeoTarget } from "@/features/links/actions/geo-targets.actions";
import type { AbVariant } from "@/features/links/actions/ab-variants.actions";
import type { RetargetingPixel } from "@/features/links/actions/retargeting-pixels.actions";

export const metadata: Metadata = { title: "Edit Link" };

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [link, plan, workspaceId] = await Promise.all([
    getLinkById(id, session.user.id),
    getUserPlan(session.user.id),
    ensureWorkspace(session.user.id),
  ]);
  if (!link) notFound();

  const [campaigns, verifiedDomains, workspace] = await Promise.all([
    getWorkspaceCampaignsForSelect(workspaceId),
    getVerifiedDomainsForWorkspace(workspaceId),
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { brandLogoUrl: true },
    }),
  ]);

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
        <Link href={`/dashboard/links/${id}`}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to link
        </Link>
      </Button>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-6">
          <LinkEditSidebar
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
          />
        </div>

        <LinkEditTabs
          link={{
            id: link.id,
            title: link.title,
            isActive: link.isActive,
            isPasswordProtected: link.isPasswordProtected,
            expiresAt: link.expiresAt,
            maxClicks: link.maxClicks,
            notes: link.notes,
            tags: link.tags,
            campaignId: link.campaignId,
            customDomainId: link.customDomainId,
            originalUrl: link.originalUrl,
            shortCode: link.shortCode,
            isCloaked: link.isCloaked ?? false,
            hideReferrer: link.hideReferrer ?? false,
            redirectType: link.redirectType ?? "302",
            ogTitle: link.ogTitle ?? null,
            ogDescription: link.ogDescription ?? null,
            ogImage: link.ogImage ?? null,
            qrFgColor: link.qrFgColor,
            qrBgColor: link.qrBgColor,
            qrEcLevel: link.qrEcLevel,
            qrMargin: link.qrMargin,
            qrLogoUrl: link.qrLogoUrl ?? null,
            geoTargets: (link.geoTargets as GeoTarget[] | null) ?? [],
            abVariants: (link.abVariants as AbVariant[] | null) ?? [],
            retargetingPixels: (link.retargetingPixels as RetargetingPixel[] | null) ?? [],
          }}
          plan={plan}
          campaigns={campaigns}
          verifiedDomains={verifiedDomains}
          qrDataUrl={qrDataUrl}
          workspace={workspace}
        />
      </div>
    </div>
  );
}
