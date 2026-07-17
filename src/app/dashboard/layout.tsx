import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserWorkspaces, getActiveWorkspaceId } from "@/server/queries/workspace.queries";
import { getActionItems } from "@/server/queries/notifications.queries";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { getUserPlan } from "@/lib/subscription";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // Super-admins keep access during maintenance mode so they can actually turn
  // it back off from /admin/system/flags.
  if (!session.user.isSuperAdmin && (await isFeatureEnabled("maintenanceMode", false))) {
    redirect("/maintenance");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (!user?.onboardingCompleted) redirect("/onboarding");

  const [memberships, activeWorkspaceId, plan] = await Promise.all([
    getUserWorkspaces(session.user.id),
    getActiveWorkspaceId(session.user.id),
    getUserPlan(session.user.id),
  ]);
  const workspaces = memberships.map((m) => ({ id: m.workspace.id, name: m.workspace.name, role: m.role }));

  // A super-admin can suspend a whole workspace (ToS violations, abuse) without
  // deleting its data — every member is blocked out until it's unsuspended.
  const activeMembership = memberships.find((m) => m.workspace.id === activeWorkspaceId);
  if (activeMembership?.workspace.suspended) redirect("/workspace-suspended");

  const actionItems = activeWorkspaceId ? await getActionItems(session.user.id, activeWorkspaceId) : [];

  return (
    <DashboardShell workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} actionItems={actionItems} plan={plan}>
      {children}
    </DashboardShell>
  );
}
