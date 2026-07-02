"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardNavGroupProps {
  label: string;
  items: SubItem[];
}

export function DashboardNavGroup({ label, items }: DashboardNavGroupProps) {
  const pathname = usePathname();

  // Match the single longest href instead of every prefix independently —
  // otherwise a root item like "/dashboard/settings" would also light up
  // for nested routes like "/dashboard/settings/billing".
  const matches = items.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const activeHref = matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const isAnyActive = matches.length > 0;
  // null = no manual override yet; follow isAnyActive. Once the user toggles,
  // that choice sticks until the active item changes again.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? isAnyActive;

  return (
    <div>
      <button
        onClick={() => setManualOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-muted-foreground"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="mt-1 space-y-0.5">
          {items.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
