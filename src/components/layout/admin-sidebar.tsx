"use client";

import { ShieldAlert } from "lucide-react";
import { AdminNavItem } from "./admin-nav-item";
import {
  adminMainNav,
  adminModerationNav,
  adminSystemNav,
  adminComplianceNav,
} from "./admin-nav-config";

function NavGroup({ label, items }: { label: string; items: typeof adminMainNav }) {
  return (
    <div className="mt-6">
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <AdminNavItem key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
}

// The red "Super Admin" branding (not the light/dark theme, which follows
// the same site-wide toggle as the regular dashboard) is what keeps this
// area visually unmistakable from the regular dashboard.
export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card text-foreground lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <ShieldAlert className="h-5 w-5 text-red-500" />
        <span className="font-semibold tracking-tight">Super Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-0.5">
          {adminMainNav.map((item) => (
            <AdminNavItem key={item.href} {...item} />
          ))}
        </div>
        <NavGroup label="Moderation" items={adminModerationNav} />
        <NavGroup label="System" items={adminSystemNav} />
        <NavGroup label="Compliance" items={adminComplianceNav} />
      </nav>
    </aside>
  );
}
