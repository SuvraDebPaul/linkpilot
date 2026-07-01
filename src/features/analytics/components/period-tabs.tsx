"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Period = { label: string; days: number };

export function PeriodTabs({
  periods,
  active,
}: {
  periods: Period[];
  active: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex rounded-lg border border-border bg-muted/50 p-1 gap-1">
      {periods.map((p) => (
        <button
          key={p.label}
          onClick={() => router.push(`${pathname}?period=${p.label}`)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            active === p.label
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
