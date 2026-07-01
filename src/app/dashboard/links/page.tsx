import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getLinksByWorkspace } from "@/server/queries/link.queries";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getUserPlan, getUserUsage, PLAN_LIMITS } from "@/lib/subscription";
import { getDemoLinks } from "@/lib/demo-stats";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { FreeUsageBanner } from "@/features/billing/components/free-usage-banner";
import { ImportLinksDialog } from "@/features/links/components/import-links-dialog";
import { LinksTable } from "@/features/links/components/links-table";

export const metadata: Metadata = { title: "Links" };

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";

export default async function LinksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  if (IS_DEMO) {
    const links = getDemoLinks();
    return (
      <div className="space-y-6">
        <PageHeader
          title="Links"
          description={`${links.length} links`}
          action={
            <div className="flex items-center gap-2">
              <ImportLinksDialog />
              <Button asChild>
                <Link href="/dashboard/links/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New link
                </Link>
              </Button>
            </div>
          }
        />
        <LinksTable links={links} />
      </div>
    );
  }

  const workspaceId = await ensureWorkspace(session.user.id);

  const [links, plan, usage] = await Promise.all([
    getLinksByWorkspace(workspaceId),
    getUserPlan(session.user.id),
    getUserUsage(session.user.id),
  ]);

  const limit = PLAN_LIMITS[plan].links;
  const usedCount = plan === "free" ? usage.linksCreated : links.length;
  const atLimit = isFinite(limit) && usedCount >= limit;

  return (
    <div className="space-y-6">
      {plan === "free" && (
        <FreeUsageBanner
          linksUsed={usage.linksCreated}
          linksLimit={PLAN_LIMITS.free.links}
          campaignsUsed={usage.campaignsCreated}
          campaignsLimit={PLAN_LIMITS.free.campaigns}
        />
      )}

      <PageHeader
        title="Links"
        description={`${links.length} link${links.length !== 1 ? "s" : ""}${isFinite(limit) ? ` · ${usedCount} of ${limit} quota used` : ""}`}
        action={
          atLimit ? (
            <Button asChild variant="secondary">
              <Link href="/dashboard/settings/billing">Upgrade to add links</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <ImportLinksDialog />
              <Button asChild>
                <Link href="/dashboard/links/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New link
                </Link>
              </Button>
            </div>
          )
        }
      />

      <LinksTable links={links} />
    </div>
  );
}
