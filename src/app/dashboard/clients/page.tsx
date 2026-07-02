import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, Users, Sparkles, Lock } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getCampaignsByWorkspace } from "@/server/queries/campaign.queries";
import { getClientAccessListForWorkspace } from "@/server/queries/client-access.queries";
import { getUserPlan, PLAN_LIMITS } from "@/lib/subscription";
import { canAddClientPortal } from "@/lib/plans";
import { getDemoClients, getDemoCampaigns } from "@/lib/demo-stats";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ClientList } from "@/features/clients/components/client-list";
import { CreateClientDialog } from "@/features/clients/components/create-client-dialog";

export const metadata: Metadata = { title: "Client Portals" };

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let plan: Awaited<ReturnType<typeof getUserPlan>>;
  let campaigns: { id: string; name: string }[];
  let clients: Awaited<ReturnType<typeof getClientAccessListForWorkspace>>;
  let workspaceId: string;
  let atLimit = false;
  let limit: number;

  if (IS_DEMO) {
    plan        = "pro";
    clients     = getDemoClients() as unknown as Awaited<ReturnType<typeof getClientAccessListForWorkspace>>;
    campaigns   = getDemoCampaigns().map((c) => ({ id: c.id, name: c.name }));
    workspaceId = "demo-workspace";
    limit       = Infinity;
  } else {
    [workspaceId, plan] = await Promise.all([
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
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">Client portals are a Starter feature</h2>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Create a private portal link for each client showing their campaigns, click stats, and
                report links — no client login required.
              </p>
              <ul className="mt-4 space-y-2">
                {["3 portals on Starter", "Unlimited on Pro", "Branded with your logo & colors", "Invite via email"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/settings/billing"
                className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" /> Upgrade to Starter
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const [fetchedCampaigns, fetchedClients] = await Promise.all([
      getCampaignsByWorkspace(workspaceId),
      getClientAccessListForWorkspace(workspaceId),
    ]);
    campaigns = fetchedCampaigns.map((c) => ({ id: c.id, name: c.name }));
    clients   = fetchedClients;
    limit     = PLAN_LIMITS[plan].clientPortals;
    atLimit   = !canAddClientPortal(plan, clients.length);
  }

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
