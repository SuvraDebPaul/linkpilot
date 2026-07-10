"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarHighlight } from "./sidebar-highlight-context";

interface DashboardNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function DashboardNavItem({ href, label, icon: Icon, exact }: DashboardNavItemProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
  const { hovered, setHovered } = useSidebarHighlight();
  const showHighlight = hovered ? hovered === href : isActive;

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(href)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
        isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground",
      )}
    >
      {showHighlight && (
        <motion.span
          layoutId="sidebar-nav-highlight"
          className="absolute inset-0 rounded-lg bg-sidebar-accent"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <Icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}
