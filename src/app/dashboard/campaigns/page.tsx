import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Folder, Link2, ArrowRight } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getCampaignsByWorkspace } from "@/server/queries/campaign.queries";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getUserPlan, getUserUsage, PLAN_LIMITS } from "@/lib/subscription";
import { getDemoCampaigns } from "@/lib/demo-stats";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FreeUsageBanner } from "@/features/billing/components/free-usage-banner";
import { CreateCampaignDialog } from "@/features/campaigns/components/create-campaign-dialog";

export const metadata: Metadata = { title: "Campaigns" };

export default async function CampaignsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let campaigns: Awaited<ReturnType<typeof getCampaignsByWorkspace>>;
  let plan: Awaited<ReturnType<typeof getUserPlan>>;
  let atLimit = false;

  if (IS_DEMO) {
    campaigns = getDemoCampaigns() as unknown as Awaited<ReturnType<typeof getCampaignsByWorkspace>>;
    plan      = "pro";
  } else {
    const workspaceId = await ensureWorkspace(session.user.id);
    const [c, p, usage] = await Promise.all([
      getCampaignsByWorkspace(workspaceId),
      getUserPlan(session.user.id),
      getUserUsage(session.user.id),
    ]);
    campaigns = c;
    plan      = p;
    const limit   = PLAN_LIMITS[plan].campaigns;
    const usedCount = plan === "free" ? usage.campaignsCreated : campaigns.length;
    atLimit = isFinite(limit) && usedCount >= limit;
  }

  return (
    <div className="space-y-6">
      {/* FreeUsageBanner shown only in non-demo free plan — usage comes from the non-demo branch */}

      <PageHeader
        title="Campaigns"
        description={`${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""}`}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/dashboard/campaigns/${c.id}`} className="group block">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="flex h-full flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Folder className="h-5 w-5 text-primary" />
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground/30 transition-colors group-hover:text-muted-foreground" />
                    </div>
                    <p className="mt-3 font-semibold text-foreground">{c.name}</p>
                    {c.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {c.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Link2 className="h-3.5 w-3.5" />
                    {c._count.links} link{c._count.links !== 1 ? "s" : ""}
                    <span className="ml-auto">{c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
