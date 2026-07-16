"use client";

import Link from "next/link";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Building2,
  ScrollText,
  CreditCard,
  Link2Off,
  ShieldBan,
  Clock,
  Webhook,
  ToggleLeft,
  Settings,
  BarChart3,
} from "lucide-react";
import { AdminNavItem } from "./admin-nav-item";

const mainNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const moderationNav = [
  { href: "/admin/moderation/links", label: "Links", icon: Link2Off },
  { href: "/admin/moderation/blocklist", label: "Blocklist", icon: ShieldBan },
];

const systemNav = [
  { href: "/admin/system/cron-jobs", label: "Cron Jobs", icon: Clock },
  { href: "/admin/system/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/admin/system/flags", label: "Feature Flags", icon: ToggleLeft },
  { href: "/admin/config", label: "Site Settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: typeof mainNav }) {
  return (
    <div className="mt-6">
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
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
          {mainNav.map((item) => (
            <AdminNavItem key={item.href} {...item} />
          ))}
        </div>
        <NavGroup label="Moderation" items={moderationNav} />
        <NavGroup label="System" items={systemNav} />
        <NavGroup label="Compliance" items={[{ href: "/admin/audit-log", label: "Audit Log", icon: ScrollText }]} />
      </nav>

      <div className="border-t border-white/10 px-5 py-3">
        <Link href="/dashboard" className="text-[11px] text-zinc-500 hover:text-zinc-300">
          ← Back to regular dashboard
        </Link>
      </div>
    </aside>
  );
}
