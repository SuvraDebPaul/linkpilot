import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getCampaignsByWorkspace } from "@/server/queries/campaign.queries";
import { getClientAccessListForWorkspace } from "@/server/queries/client-access.queries";
import { getUserPlan, PLAN_LIMITS } from "@/lib/subscription";
import { canAddClientPortal } from "@/lib/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { LockedFeatureHero } from "@/components/shared/locked-feature-hero";
import { ClientList } from "@/features/clients/components/client-list";
import { CreateClientDialog } from "@/features/clients/components/create-client-dialog";

export const metadata: Metadata = { title: "Client Portals" };

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [workspaceId, plan] = await Promise.all([
    ensureWorkspace(session.user.id),
    getUserPlan(session.user.id),
  ]);

  const isPaidPlan = plan === "starter" || plan === "pro";

  if (!isPaidPlan) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Client Portals"
          description="Give clients a private, branded view of their campaigns."
        />
        <LockedFeatureHero
          title="Client portals are a Starter feature"
          description="Create a private portal link for each client showing their campaigns, click stats, and report links — no client login required."
          features={["3 portals on Starter", "Unlimited on Pro", "Branded with your logo & colors", "Invite via email"]}
          ctaLabel="Upgrade to Starter"
        />
      </div>
    );
  }

  const [fetchedCampaigns, clients] = await Promise.all([
    getCampaignsByWorkspace(workspaceId),
    getClientAccessListForWorkspace(workspaceId),
  ]);
  const campaigns = fetchedCampaigns.map((c) => ({ id: c.id, name: c.name }));
  const limit = PLAN_LIMITS[plan].clientPortals;
  const atLimit = !canAddClientPortal(plan, clients.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Portals"
        description="Each portal gives a client a private, bookmarkable link showing their campaign reports."
        action={
          !atLimit && (
            <CreateClientDialog
              workspaceId={workspaceId}
              campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
            />
          )
        }
      />

      {atLimit && plan === "starter" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You&apos;ve used all {limit} client portals on your Starter plan.{" "}
          <Link href="/dashboard/settings/billing" className="font-semibold underline underline-offset-2">
            Upgrade to Pro
          </Link>{" "}
          for unlimited portals.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" /> Active portals
            {limit !== Infinity && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                {clients.length}/{limit}
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Share the portal link with your client — they can bookmark it and view their reports without logging in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientList items={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
