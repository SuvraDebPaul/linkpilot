import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Logo } from "@/components/shared/logo";
import type { ActionItem } from "@/server/queries/notifications.queries";

type WorkspaceOption = { id: string; name: string; role: string };

export function DashboardShell({
  children,
  workspaces,
  activeWorkspaceId,
  actionItems,
}: {
  children: React.ReactNode;
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string | null;
  actionItems: ActionItem[];
}) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-muted">
      <DashboardSidebar workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center border-b border-border bg-card px-4 lg:hidden">
          <MobileSidebar workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
          <div className="ml-3">
            <Logo />
          </div>
        </div>
        <DashboardTopbar actionItems={actionItems} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
