"use client";

import { EmptyState } from "@/components/shared/empty-state";

type DeviceRow = { device: string; count: number };

const COLORS: Record<string, string> = {
  DESKTOP: "#0d9488",
  MOBILE:  "#6366f1",
  TABLET:  "#f59e0b",
  UNKNOWN: "#94a3b8",
};

export function DeviceBarChart({ data }: { data: DeviceRow[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  if (data.length === 0) {
    return <EmptyState title="No click data yet" description="Device breakdown will appear once your links get clicks." />;
  }

  return (
    <div className="space-y-3">
      {data.map((row) => {
        const pct = Math.round((row.count / total) * 100);
        const color = COLORS[row.device] ?? "#94a3b8";
        return (
          <div key={row.device} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="capitalize text-foreground">
                {row.device.charAt(0) + row.device.slice(1).toLowerCase()}
              </span>
              <span className="text-muted-foreground">
                {row.count.toLocaleString()} ({pct}%)
              </span>
            </div>
            {/* Uses inline style because each device has a distinct semantic color */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
