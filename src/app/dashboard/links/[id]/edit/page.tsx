import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart2 } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getLinkById } from "@/server/queries/link.queries";
import { getUserPlan } from "@/lib/subscription";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { prisma } from "@/server/db/prisma";
import { generateQrCodeDataUrl } from "@/server/services/qr.service";
import { getDemoLinkDetail } from "@/lib/demo-stats";
import { siteConfig } from "@/config/site";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrPreview } from "@/components/shared/qr-preview";
import { QrDownloadButton } from "@/features/links/components/qr-download-button";
import { QrCustomizerDialog } from "@/features/links/components/qr-customizer-dialog";
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

export const metadata: Metadata = { title: "Edit Link" };

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";

export default async function EditLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let link: Awaited<ReturnType<typeof getLinkById>>;
  let plan: Awaited<ReturnType<typeof getUserPlan>>;

  let workspace: { brandLogoUrl: string | null; brandColor: string | null } | null;

  if (IS_DEMO) {
    link      = getDemoLinkDetail(id) as unknown as Awaited<ReturnType<typeof getLinkById>>;
    plan      = "pro";
    workspace = { brandLogoUrl: null, brandColor: null };
  } else {
    const [fetchedLink, fetchedPlan, workspaceId] = await Promise.all([
      getLinkById(id, session.user.id),
      getUserPlan(session.user.id),
      ensureWorkspace(session.user.id),
    ]);
    if (!fetchedLink) notFound();
    link      = fetchedLink;
    plan      = fetchedPlan;
    workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { brandLogoUrl: true, brandColor: true },
    });
  }

  if (!link) notFound();

  const isPaidPlan = plan === "starter" || plan === "pro";
  const shortUrl   = `${siteConfig.url}/${link.shortCode}`;
  const qrDataUrl  = await generateQrCodeDataUrl(shortUrl, {
    fg:      link.qrFgColor,
    bg:      link.qrBgColor,
    ecLevel: link.qrEcLevel,
    margin:  link.qrMargin,
  });

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href={`/dashboard/links/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-foreground">
            Edit — {link.title || link.shortCode}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground truncate">{link.originalUrl}</p>
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={`/dashboard/links/${id}`}>
            <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
            View analytics
          </Link>
        </Button>
      </div>

      {/* ── Settings grid ── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <EditLinkForm link={link} />

        {/* QR Code customizer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <QrPreview src={qrDataUrl} size={160} />
            {isPaidPlan ? (
              <QrCustomizerDialog
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
              <QrDownloadButton dataUrl={qrDataUrl} shortCode={link.shortCode} />
            )}
          </CardContent>
        </Card>

        <OgTagsForm
          linkId={link.id}
          plan={plan}
          initialTitle={link.ogTitle ?? null}
          initialDescription={link.ogDescription ?? null}
          initialImage={link.ogImage ?? null}
        />

        <RetargetingPixelsForm
          linkId={link.id}
          plan={plan}
          initialPixels={(link.retargetingPixels as RetargetingPixel[] | null) ?? []}
        />

        <GeoTargetsForm
          linkId={link.id}
          isPaidPlan={isPaidPlan}
          initialTargets={(link.geoTargets as GeoTarget[] | null) ?? []}
        />

        <AbVariantsForm
          linkId={link.id}
          plan={plan}
          originalUrl={link.originalUrl}
          initialVariants={(link.abVariants as AbVariant[] | null) ?? []}
        />

        <CloakingForm
          linkId={link.id}
          plan={plan}
          initialCloaked={link.isCloaked ?? false}
          initialHideReferrer={link.hideReferrer ?? false}
        />

        <RedirectTypeForm
          linkId={link.id}
          plan={plan}
          initialType={link.redirectType ?? "302"}
        />
      </div>

    </div>
  );
}
