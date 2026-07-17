"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function AdminNavItem({ href, label, icon: Icon, exact }: AdminNavItemProps) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-red-500/15 text-red-400"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {label}
    </Link>
  );
}
