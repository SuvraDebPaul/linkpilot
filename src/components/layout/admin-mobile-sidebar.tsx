"use client";

import { useState } from "react";
import { Menu, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminNavItem } from "./admin-nav-item";
import {
  adminMainNav,
  adminModerationNav,
  adminSystemNav,
  adminComplianceNav,
} from "./admin-nav-config";

function NavGroup({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: typeof adminMainNav;
  onNavigate: () => void;
}) {
  return (
    <div className="mt-6" onClick={onNavigate}>
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

export function AdminMobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
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
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card text-foreground shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <span className="font-semibold tracking-tight">Super Admin</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">
              <div className="space-y-0.5" onClick={() => setOpen(false)}>
                {adminMainNav.map((item) => (
                  <AdminNavItem key={item.href} {...item} />
                ))}
              </div>
              <NavGroup label="Moderation" items={adminModerationNav} onNavigate={() => setOpen(false)} />
              <NavGroup label="System" items={adminSystemNav} onNavigate={() => setOpen(false)} />
              <NavGroup label="Compliance" items={adminComplianceNav} onNavigate={() => setOpen(false)} />
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
