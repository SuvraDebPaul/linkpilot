"use client";

import { SlidersHorizontal, QrCode as QrCodeIcon, Crosshair, Layers } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrPreview } from "@/components/shared/qr-preview";
import { QrDownloadButton } from "@/features/links/components/qr-download-button";
import { QrCustomizerPanel } from "@/features/links/components/qr-customizer-panel";
import { EditLinkForm } from "@/features/links/components/edit-link-form";
import { GeoTargetsForm } from "@/features/links/components/geo-targets-form";
import { AbVariantsForm } from "@/features/links/components/ab-variants-form";
import { RetargetingPixelsForm } from "@/features/links/components/retargeting-pixels-form";
import { CloakingForm } from "@/features/links/components/cloaking-form";
import { RedirectTypeForm } from "@/features/links/components/redirect-type-form";
import { OgTagsForm } from "@/features/links/components/og-tags-form";
import type { GeoTarget } from "@/features/links/actions/geo-targets.actions";
import type { AbVariant } from "@/features/links/actions/ab-variants.actions";
import type { RetargetingPixel } from "@/features/links/actions/retargeting-pixels.actions";
import type { PlanTier } from "@/lib/plans";

type Campaign = { id: string; name: string };
type VerifiedDomain = { id: string; domain: string };

type LinkData = {
  id: string;
  title: string | null;
  isActive: boolean;
  isPasswordProtected: boolean;
  expiresAt: Date | null;
  maxClicks: number | null;
  notes: string | null;
  tags: string[];
  campaignId: string | null;
  customDomainId: string | null;
  originalUrl: string;
  shortCode: string;
  isCloaked: boolean;
  hideReferrer: boolean;
  redirectType: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  qrFgColor: string;
  qrBgColor: string;
  qrEcLevel: string;
  qrMargin: number;
  qrLogoUrl: string | null;
  geoTargets: GeoTarget[];
  abVariants: AbVariant[];
  retargetingPixels: RetargetingPixel[];
};

type Props = {
  link: LinkData;
  plan: PlanTier;
  campaigns: Campaign[];
  verifiedDomains: VerifiedDomain[];
  qrDataUrl: string;
  shortUrl: string;
  workspace: { brandLogoUrl: string | null; brandColor: string | null } | null;
};

export function LinkEditTabs({ link, plan, campaigns, verifiedDomains, qrDataUrl, shortUrl, workspace }: Props) {
  const isPaidPlan = plan === "starter" || plan === "pro";

  const targetingCount = link.geoTargets.length + link.abVariants.length;
  const advancedCount =
    link.retargetingPixels.length +
    (link.isCloaked || link.hideReferrer ? 1 : 0) +
    (link.redirectType !== "302" ? 1 : 0) +
    (link.ogTitle || link.ogDescription || link.ogImage ? 1 : 0);

  return (
    <Tabs defaultValue="overview" className="gap-4">
      <TabsList className="w-fit">
        <TabsTrigger value="overview" className="gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="qr" className="gap-1.5">
          <QrCodeIcon className="h-3.5 w-3.5" />
          QR Code
        </TabsTrigger>
        <TabsTrigger value="targeting" className="gap-1.5">
          <Crosshair className="h-3.5 w-3.5" />
          Targeting
          {targetingCount > 0 && (
            <span className="ml-1 rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
              {targetingCount}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="advanced" className="gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          Advanced
          {advancedCount > 0 && (
            <span className="ml-1 rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
              {advancedCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <EditLinkForm link={link} campaigns={campaigns} verifiedDomains={verifiedDomains} />
      </TabsContent>

      <TabsContent value="qr">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            {isPaidPlan ? (
              <QrCustomizerPanel
                url={shortUrl}
                shortCode={link.shortCode}
                linkId={link.id}
                savedFgColor={link.qrFgColor}
                savedBgColor={link.qrBgColor}
                savedEcLevel={link.qrEcLevel}
                savedMargin={link.qrMargin}
                savedLogoUrl={link.qrLogoUrl ?? ""}
                brandColor={workspace?.brandColor}
                brandLogoUrl={workspace?.brandLogoUrl}
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <QrPreview src={qrDataUrl} size={220} />
                <div className="w-full max-w-[220px]">
                  <QrDownloadButton dataUrl={qrDataUrl} shortCode={link.shortCode} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="targeting">
        <div className="grid gap-4 sm:grid-cols-2">
          <GeoTargetsForm linkId={link.id} isPaidPlan={isPaidPlan} initialTargets={link.geoTargets} />
          <AbVariantsForm linkId={link.id} plan={plan} originalUrl={link.originalUrl} initialVariants={link.abVariants} />
        </div>
      </TabsContent>

      <TabsContent value="advanced">
        <div className="grid gap-4 sm:grid-cols-2">
          <RetargetingPixelsForm linkId={link.id} plan={plan} initialPixels={link.retargetingPixels} />
          <CloakingForm linkId={link.id} plan={plan} initialCloaked={link.isCloaked} initialHideReferrer={link.hideReferrer} />
          <RedirectTypeForm linkId={link.id} plan={plan} initialType={link.redirectType} />
          <OgTagsForm
            linkId={link.id}
            plan={plan}
            initialTitle={link.ogTitle}
            initialDescription={link.ogDescription}
            initialImage={link.ogImage}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
