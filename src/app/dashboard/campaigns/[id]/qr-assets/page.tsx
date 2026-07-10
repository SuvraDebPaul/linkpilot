import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getCampaignById } from "@/server/queries/campaign.queries";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { CampaignQrGrid } from "@/features/campaigns/components/campaign-qr-grid";

export const metadata: Metadata = { title: "QR Assets" };

export default async function CampaignQrAssetsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const campaign = await getCampaignById(id, session.user.id);
  if (!campaign) notFound();

  const links = campaign.links.map((link) => ({
    id: link.id,
    title: link.title,
    shortCode: link.shortCode,
    originalUrl: link.originalUrl,
    shortUrl: `${siteConfig.url}/${link.shortCode}`,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href={`/dashboard/campaigns/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h1 className="truncate text-2xl font-bold text-foreground">
              QR Assets
            </h1>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {campaign.name} · {links.length} link{links.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <CampaignQrGrid links={links} campaignName={campaign.name} />
    </div>
  );
}
