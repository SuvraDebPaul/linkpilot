"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubItem {
  href: string;
  label: string;
}

interface DashboardNavGroupProps {
  icon: LucideIcon;
  label: string;
  items: SubItem[];
}

export function DashboardNavGroup({ icon: Icon, label, items }: DashboardNavGroupProps) {
  const pathname = usePathname();
  const isAnyActive = items.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const [open, setOpen] = useState(isAnyActive);

  useEffect(() => {
    if (isAnyActive) setOpen(true);
  }, [isAnyActive]);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isAnyActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="ml-2 mt-0.5 space-y-0.5 border-l-2 border-border pl-4">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors",
                  isActive
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                    isActive ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
