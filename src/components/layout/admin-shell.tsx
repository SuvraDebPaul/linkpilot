import { ShieldAlert } from "lucide-react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileSidebar } from "@/components/layout/admin-mobile-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center gap-2 border-b border-border bg-card px-4 lg:hidden">
          <AdminMobileSidebar />
          <ShieldAlert className="h-5 w-5 text-red-500" />
          <span className="font-semibold tracking-tight text-foreground">Super Admin</span>
        </div>
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 text-foreground sm:p-6">{children}</main>
      </div>
    </div>
  );
}
