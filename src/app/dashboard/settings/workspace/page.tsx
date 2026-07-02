import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Building2, Palette, Users } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getUserWorkspaces, getWorkspaceWithMembers, getPendingInvites } from "@/server/queries/workspace.queries";
import { getUserPlan } from "@/lib/subscription";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { RenameWorkspaceForm } from "@/features/workspace/components/rename-workspace-form";
import { InviteMemberForm } from "@/features/workspace/components/invite-member-form";
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

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Organization" description="Manage your workspace, branding, and team members." />

      {/* Workspace name + Branding — side by side when both apply */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isOwnerOrAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary" /> Workspace name
              </CardTitle>
            </CardHeader>
            <CardContent>
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
              <InviteMemberForm workspaceId={workspace.id} />
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
