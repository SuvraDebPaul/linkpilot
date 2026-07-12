import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Folder } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getCampaignsByWorkspace } from "@/server/queries/campaign.queries";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getUserPlan, getUserUsage, PLAN_LIMITS } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateCampaignDialog } from "@/features/campaigns/components/create-campaign-dialog";
import { CampaignsGrid } from "@/features/campaigns/components/campaigns-grid";

export const metadata: Metadata = { title: "Campaigns" };

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const workspaceId = await ensureWorkspace(session.user.id);
  const [campaigns, plan, usage] = await Promise.all([
    getCampaignsByWorkspace(workspaceId),
    getUserPlan(session.user.id),
    getUserUsage(session.user.id),
  ]);
  const limit = PLAN_LIMITS[plan].campaigns;
  const usedCount = plan === "free" ? usage.campaignsCreated : campaigns.length;
  const atLimit = isFinite(limit) && usedCount >= limit;

  const totalLinks = campaigns.reduce((s, c) => s + c._count.links, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description={`${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""} · ${totalLinks} link${totalLinks !== 1 ? "s" : ""} total`}
        action={
          atLimit ? (
            <Button asChild variant="secondary">
              <Link href="/dashboard/settings/billing">Upgrade to add campaigns</Link>
            </Button>
          ) : (
            <CreateCampaignDialog />
          )
        }
      />

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState
            icon={Folder}
            title="No campaigns yet"
            description="Group your links into a campaign to track combined performance and share a report with clients."
            action={!atLimit ? <CreateCampaignDialog /> : undefined}
            className="py-16"
          />
        </div>
      ) : (
        <CampaignsGrid campaigns={campaigns} atLimit={atLimit} />
      )}
    </div>
  );
}
