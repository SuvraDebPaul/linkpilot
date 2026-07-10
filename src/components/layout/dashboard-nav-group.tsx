"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useSidebarHighlight } from "./sidebar-highlight-context";

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
  const { hovered, setHovered } = useSidebarHighlight();

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
        className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground/80"
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 38 }}
            className="overflow-hidden"
          >
            <div className="mt-1 space-y-0.5">
              {items.map((item) => {
                const isActive = item.href === activeHref;
                const showHighlight = hovered ? hovered === item.href : isActive;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHovered(item.href)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    {showHighlight && (
                      <motion.span
                        layoutId="sidebar-nav-highlight"
                        className="absolute inset-0 rounded-lg bg-sidebar-accent"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <item.icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
