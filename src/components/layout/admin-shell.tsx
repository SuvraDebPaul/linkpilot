import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-zinc-900">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-4 text-zinc-100 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
