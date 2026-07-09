import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Building2, Palette, Users } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getUserWorkspaces, getWorkspaceWithMembers, getPendingInvites } from "@/server/queries/workspace.queries";
import { getUserPlan } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { RenameWorkspaceForm } from "@/features/workspace/components/rename-workspace-form";
import { InviteMemberForm } from "@/features/workspace/components/invite-member-form";
import { CreateMemberAccountForm } from "@/features/workspace/components/create-member-account-form";
import { PendingInvitesList } from "@/features/workspace/components/pending-invites-list";
import { MembersTable } from "@/features/workspace/components/members-table";
import { WorkspaceBrandingForm } from "@/features/workspace/components/workspace-branding-form";

export const metadata: Metadata = { title: "Workspace" };

export default async function WorkspaceSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [memberships, plan] = await Promise.all([
    getUserWorkspaces(session.user.id),
    getUserPlan(session.user.id),
  ]);

  // Show first workspace (personal). Multi-workspace switcher is a future phase.
  const membership = memberships[0];
  if (!membership) redirect("/dashboard");

  const [workspace, pendingInvites] = await Promise.all([
    getWorkspaceWithMembers(membership.workspaceId),
    getPendingInvites(membership.workspaceId),
  ]);
  if (!workspace) redirect("/dashboard");

  const canInvite = plan === "pro" || plan === "starter";
  const isPro = plan === "pro";
  const isPaidPlan = plan === "starter" || plan === "pro";
  const isOwnerOrAdmin = membership.role === "OWNER" || membership.role === "ADMIN";

  const memberSince = workspace.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title="Organization" description="Manage your workspace, branding, and team members." />

      {/* Workspace name + Branding — side by side when both apply */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isOwnerOrAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" /> Workspace details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-semibold capitalize",
                    plan === "pro" && "bg-primary/10 text-primary",
                    plan === "starter" && "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
                    plan === "free" && "bg-muted text-muted-foreground",
                  )}
                >
                  {plan} plan
                </span>
                <span>·</span>
                <span>
                  {workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}
                </span>
                <span>·</span>
                <span>Created {memberSince}</span>
              </div>
              <RenameWorkspaceForm workspaceId={workspace.id} currentName={workspace.name} />
            </CardContent>
          </Card>
        )}

        {isPaidPlan && isOwnerOrAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-primary" /> Report branding
              </CardTitle>
              <CardDescription>
                Customise the logo and color shown on shared campaign reports.
                {!isPro && " Upgrade to Pro to fully remove LinkPilot branding."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkspaceBrandingForm
                workspaceId={workspace.id}
                isPro={isPro}
                initialLogoUrl={workspace.brandLogoUrl ?? ""}
                initialColor={workspace.brandColor ?? ""}
                initialHideBranding={workspace.hideBranding}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" /> Members
          </CardTitle>
          <CardDescription>{workspace.members.length} member{workspace.members.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOwnerOrAdmin && (
            canInvite ? (
              <div className="flex flex-wrap items-center gap-2">
                <InviteMemberForm workspaceId={workspace.id} />
                <CreateMemberAccountForm workspaceId={workspace.id} />
              </div>
            ) : (
              <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Upgrade to Starter or Pro to invite team members.
              </p>
            )
          )}

          {isOwnerOrAdmin && pendingInvites.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pending invites
              </p>
              <PendingInvitesList workspaceId={workspace.id} invites={pendingInvites} />
            </div>
          )}

          <MembersTable
            members={workspace.members}
            workspaceId={workspace.id}
            currentUserId={session.user.id}
            currentUserRole={membership.role}
          />
        </CardContent>
      </Card>
    </div>
  );
}
