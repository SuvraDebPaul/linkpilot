"use client";

import { Logo } from "@/components/shared/logo";
import { DashboardNavItem } from "./dashboard-nav-item";
import { DashboardNavGroup } from "./dashboard-nav-group";
import {
  LayoutDashboard,
  Link2,
  BarChart2,
  Folder,
  CreditCard,
  Building2,
  Globe2,
  Contact,
  CircleUserRound,
  SlidersHorizontal,
  LayoutTemplate,
} from "lucide-react";

const mainNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Folder },
  { href: "/dashboard/clients", label: "Clients", icon: Contact },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
];

const settingsItems = [
  { href: "/dashboard/settings", label: "Profile", icon: CircleUserRound },
  { href: "/dashboard/settings/workspace", label: "Organization", icon: Building2 },
  { href: "/dashboard/settings/domains", label: "Domains", icon: Globe2 },
  { href: "/dashboard/settings/defaults", label: "Defaults", icon: SlidersHorizontal },
  { href: "/dashboard/settings/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/dashboard/settings/billing", label: "Billing", icon: CreditCard },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Main Menu
        </p>
        <div className="space-y-0.5">
          {mainNav.map((item) => (
            <DashboardNavItem key={item.href} {...item} />
          ))}
        </div>

        <div className="mt-6">
          <DashboardNavGroup label="Settings" items={settingsItems} />
        </div>
      </nav>

      {/* Footer version badge */}
      <div className="border-t border-border px-5 py-3">
        <p className="text-[10px] text-muted-foreground/50">LinkPilot · v1.0</p>
      </div>
    </aside>
  );
}
