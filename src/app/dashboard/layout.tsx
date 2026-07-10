import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/server/db/prisma";
import { getUserWorkspaces, getActiveWorkspaceId } from "@/server/queries/workspace.queries";
import { getActionItems } from "@/server/queries/notifications.queries";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  if (!user?.onboardingCompleted) redirect("/onboarding");

  const [memberships, activeWorkspaceId] = await Promise.all([
    getUserWorkspaces(session.user.id),
    getActiveWorkspaceId(session.user.id),
  ]);
  const workspaces = memberships.map((m) => ({ id: m.workspace.id, name: m.workspace.name, role: m.role }));

  const actionItems = activeWorkspaceId ? await getActionItems(session.user.id, activeWorkspaceId) : [];

  return (
    <DashboardShell workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} actionItems={actionItems}>
      {children}
    </DashboardShell>
  );
}
