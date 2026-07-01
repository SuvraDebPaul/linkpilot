import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Logo } from "@/components/shared/logo";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-muted">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center border-b border-border bg-card px-4 lg:hidden">
          <MobileSidebar />
          <div className="ml-3">
            <Logo />
          </div>
        </div>
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
