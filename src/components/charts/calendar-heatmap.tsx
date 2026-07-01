"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type DataPoint = { date: string; count: number };

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Fixed cell dimensions — matches GitHub contribution style
const CELL   = 11; // px
const GAP    =  3; // px
const STRIDE = CELL + GAP; // 14px per column/row

function getColorClass(count: number, max: number): string {
  if (count < 0)              return "bg-transparent";
  if (count === 0 || max === 0) return "bg-border/60 dark:bg-border/40";
  const r = count / max;
  if (r < 0.15) return "bg-primary/20";
  if (r < 0.35) return "bg-primary/40";
  if (r < 0.60) return "bg-primary/65";
  if (r < 0.85) return "bg-primary/85";
  return "bg-primary";
}

function fmtDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d} ${MONTHS[parseInt(m, 10) - 1]}`;
}

export function CalendarHeatmap({ data }: { data: DataPoint[] }) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number } | null>(null);

  const map: Record<string, number> = {};
  for (const d of data) map[d.date] = d.count;

  const max   = Math.max(...data.map((d) => d.count), 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDOW  = today.getDay();
  const daysToMon = (todayDOW + 6) % 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysToMon - 77);

  // Build 12 × 7 grid
  const weeks: { date: string; count: number; iso: string }[][] = [];
  for (let col = 0; col < 12; col++) {
    const week: { date: string; count: number; iso: string }[] = [];
    for (let row = 0; row < 7; row++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + col * 7 + row);
      d.setHours(0, 0, 0, 0);
      const iso = d.toISOString().slice(0, 10);
      week.push({ date: fmtDate(iso), count: d > today ? -1 : (map[iso] ?? 0), iso });
    }
    weeks.push(week);
  }

  // Month label: first column where the month changes
  const monthLabels: { col: number; label: string }[] = [];
  for (let col = 0; col < 12; col++) {
    const month = parseInt(weeks[col][0].iso.split("-")[1], 10);
    const prev  = col > 0 ? parseInt(weeks[col - 1][0].iso.split("-")[1], 10) : -1;
    if (month !== prev) monthLabels.push({ col, label: MONTHS[month - 1] });
  }

  const DAY_LABEL_W = 24; // px — width of day-of-week column

  return (
    <div className="relative select-none">
      {/* Month labels — positioned absolutely over the grid */}
      <div
        className="flex mb-1"
        style={{ paddingLeft: DAY_LABEL_W + GAP }}
      >
        {weeks.map((_, col) => {
          const ml = monthLabels.find((m) => m.col === col);
          return (
            <div
              key={col}
              style={{ width: STRIDE, flexShrink: 0 }}
              className="text-[10px] font-semibold text-primary"
            >
              {ml ? ml.label : ""}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex" style={{ gap: GAP }}>
        {/* Day labels */}
        <div
          className="flex flex-col shrink-0"
          style={{ gap: GAP, width: DAY_LABEL_W }}
        >
          {DAY_LABELS.map((d, i) => (
            <div
              key={d}
              style={{ height: CELL }}
              className="text-[9px] text-muted-foreground flex items-center justify-end pr-1.5"
            >
              {/* Show Mon, Wed, Fri */}
              {i === 0 || i === 2 || i === 4 ? d : ""}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, col) => (
          <div key={col} className="flex flex-col shrink-0" style={{ gap: GAP }}>
            {week.map((cell) => (
              <div
                key={cell.iso}
                style={{ width: CELL, height: CELL, borderRadius: 2 }}
                className={cn(
                  "transition-all duration-100 cursor-default",
                  getColorClass(cell.count, max),
                  cell.count >= 0 && "hover:ring-1 hover:ring-primary/60 hover:brightness-110",
                )}
                onMouseEnter={() => cell.count >= 0 && setTooltip({ date: cell.date, count: cell.count })}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-end gap-1">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0, 0.15, 0.35, 0.60, 1].map((r, i) => (
          <div
            key={i}
            style={{ width: CELL, height: CELL, borderRadius: 2, flexShrink: 0 }}
            className={getColorClass(r === 0 ? 0 : r * max, max)}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="pointer-events-none absolute bottom-8 right-0 z-10 rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-foreground">
            {tooltip.count.toLocaleString()} click{tooltip.count !== 1 ? "s" : ""}
          </p>
          <p className="text-[11px] text-muted-foreground">{tooltip.date}</p>
        </div>
      )}
    </div>
  );
}
