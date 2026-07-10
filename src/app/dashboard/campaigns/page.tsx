import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Folder, Link2, ArrowRight, Sparkles } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getCampaignsByWorkspace } from "@/server/queries/campaign.queries";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getUserPlan, getUserUsage, PLAN_LIMITS } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateCampaignDialog } from "@/features/campaigns/components/create-campaign-dialog";

export const metadata: Metadata = { title: "Campaigns" };

const ACCENTS = [
  { icon: "text-teal-600", chip: "bg-teal-500/10", ring: "group-hover:border-teal-500/40" },
  { icon: "text-violet-600", chip: "bg-violet-500/10", ring: "group-hover:border-violet-500/40" },
  { icon: "text-amber-600", chip: "bg-amber-500/10", ring: "group-hover:border-amber-500/40" },
  { icon: "text-sky-600", chip: "bg-sky-500/10", ring: "group-hover:border-sky-500/40" },
  { icon: "text-rose-600", chip: "bg-rose-500/10", ring: "group-hover:border-rose-500/40" },
  { icon: "text-emerald-600", chip: "bg-emerald-500/10", ring: "group-hover:border-emerald-500/40" },
] as const;

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <Link key={c.id} href={`/dashboard/campaigns/${c.id}`} className="group block">
                <Card
                  className={`h-full overflow-hidden border-border/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md ${accent.ring}`}
                >
                  <CardContent className="flex h-full flex-col justify-between p-5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}>
                          <Folder className={`h-5 w-5 ${accent.icon}`} />
                        </div>
                        <ArrowRight className="mt-1.5 h-4 w-4 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                      </div>
                      <p className="mt-3 truncate font-semibold text-foreground">{c.name}</p>
                      {c.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {c.description}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm italic text-muted-foreground/50">No description</p>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Link2 className="h-3.5 w-3.5" />
                        {c._count.links} link{c._count.links !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground/70">
                        {c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {!atLimit && (
            <CreateCampaignDialog
              trigger={
                <button className="group flex h-full min-h-[164px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-transparent p-5 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-sm font-medium">New campaign</span>
                </button>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
