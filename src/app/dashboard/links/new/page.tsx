import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getUserPlan, getUserUsage, PLAN_LIMITS, canCreateLink } from "@/lib/subscription";
import { prisma } from "@/server/db/prisma";
import { ensureWorkspace, getWorkspaceDefaults } from "@/server/queries/workspace.queries";
import { getWorkspaceCampaignsForSelect } from "@/server/queries/campaign.queries";
import { getVerifiedDomainsForWorkspace } from "@/server/queries/domain.queries";
import { getCampaignTemplates } from "@/server/queries/templates.queries";
import { Button } from "@/components/ui/button";
import { CreateLinkForm } from "@/features/links/components/create-link-form";

export const metadata: Metadata = { title: "New link" };

export default async function NewLinkPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const [plan, workspaceId] = await Promise.all([
    getUserPlan(userId),
    ensureWorkspace(userId),
  ]);
  const limit = PLAN_LIMITS[plan].links;

  if (isFinite(limit)) {
    const count =
      plan === "free"
        ? (await getUserUsage(userId)).linksCreated
        : await prisma.link.count({ where: { userId } });

    if (!canCreateLink(plan, count)) {
      redirect("/dashboard/links?limitReached=1");
    }
  }

  const [campaigns, verifiedDomains, workspaceDefaults, campaignTemplates] = await Promise.all([
    getWorkspaceCampaignsForSelect(workspaceId),
    getVerifiedDomainsForWorkspace(workspaceId),
    getWorkspaceDefaults(workspaceId),
    getCampaignTemplates(workspaceId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/links">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New link</h1>
          <p className="text-sm text-muted-foreground">
            Shorten a URL and configure tracking, limits, and security
          </p>
        </div>
      </div>

      <CreateLinkForm
        plan={plan}
        campaigns={campaigns}
        verifiedDomains={verifiedDomains}
        campaignTemplates={campaignTemplates}
        defaultQrFgColor={workspaceDefaults?.defaultQrFgColor}
        defaultQrBgColor={workspaceDefaults?.defaultQrBgColor}
        defaultQrEcLevel={workspaceDefaults?.defaultQrEcLevel as "L" | "M" | "Q" | "H" | undefined}
      />
    </div>
  );
}
