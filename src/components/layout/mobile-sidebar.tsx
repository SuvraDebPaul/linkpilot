"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import type { PlanTier } from "@/lib/subscription";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import { DashboardNavItem } from "./dashboard-nav-item";
import { DashboardNavGroup } from "./dashboard-nav-group";
import { SidebarHighlightProvider } from "./sidebar-highlight-context";
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

type WorkspaceOption = { id: string; name: string; role: string };

export function MobileSidebar({
  workspaces,
  activeWorkspaceId,
  plan,
}: {
  workspaces: WorkspaceOption[];
  activeWorkspaceId: string | null;
  plan: PlanTier;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card shadow-2xl">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Workspace switcher */}
            <div className="px-3 pt-3">
              <WorkspaceSwitcher workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} plan={plan} />
            </div>

            {/* Nav */}
            <SidebarHighlightProvider>
              <nav className="flex-1 overflow-y-auto px-3 py-5">
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Main Menu
                </p>
                <div className="space-y-0.5">
                  {mainNav.map((item) => (
                    <div key={item.href} onClick={() => setOpen(false)}>
                      <DashboardNavItem {...item} />
                    </div>
                  ))}
                </div>

                <div className="mt-6" onClick={(e) => {
                  const link = (e.target as HTMLElement).closest("a");
                  if (link) setOpen(false);
                }}>
                  <DashboardNavGroup label="Settings" items={settingsItems} />
                </div>
              </nav>
            </SidebarHighlightProvider>
          </aside>
        </>
      )}
    </>
  );
}
