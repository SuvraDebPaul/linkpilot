"use client";

import Link from "next/link";
import { ShieldAlert, LayoutDashboard, Users, Building2, ScrollText } from "lucide-react";
import { AdminNavItem } from "./admin-nav-item";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
];

// Deliberately dark regardless of the site's own light/dark theme toggle — an
// admin acting with full override power over every user's data should never
// be able to mistake this for the regular dashboard.
export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-zinc-950 text-zinc-100 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <ShieldAlert className="h-5 w-5 text-red-500" />
        <span className="font-semibold tracking-tight">Super Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-0.5">
          {adminNav.map((item) => (
            <AdminNavItem key={item.href} {...item} />
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 px-5 py-3">
        <Link href="/dashboard" className="text-[11px] text-zinc-500 hover:text-zinc-300">
          ← Back to regular dashboard
        </Link>
      </div>
    </aside>
  );
}
