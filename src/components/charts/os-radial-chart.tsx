"use client";

type DataPoint = { name: string; count: number };

const COLORS = [
  { stroke: "#0d9488", bg: "bg-primary/10",    text: "text-primary"    },
  { stroke: "#8b5cf6", bg: "bg-violet-100 dark:bg-violet-950",  text: "text-violet-600 dark:text-violet-400" },
  { stroke: "#10b981", bg: "bg-emerald-100 dark:bg-emerald-950", text: "text-emerald-600 dark:text-emerald-400" },
  { stroke: "#f59e0b", bg: "bg-amber-100 dark:bg-amber-950",   text: "text-amber-600 dark:text-amber-400" },
  { stroke: "#0ea5e9", bg: "bg-sky-100 dark:bg-sky-950",      text: "text-sky-600 dark:text-sky-400" },
  { stroke: "#94a3b8", bg: "bg-muted",          text: "text-muted-foreground" },
];

const R   = 14;   // arc radius
const CX  = 18;   // circle center x
const CY  = 18;   // circle center y
const CIRC = 2 * Math.PI * R; // full circumference

function RadialArc({ pct, stroke }: { pct: number; stroke: string }) {
  const filled = (pct / 100) * CIRC;
  return (
    <svg width={36} height={36} viewBox="0 0 36 36" className="shrink-0 -rotate-90">
      {/* Track */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth={3} className="dark:[stroke:#334155]" />
      {/* Arc */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${CIRC}`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
}

export function OsRadialChart({ data }: { data: DataPoint[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="space-y-2.5">
      {data.map((row, i) => {
        const pct = Math.round((row.count / total) * 100);
        const c   = COLORS[i] ?? COLORS[5];

        return (
          <div key={row.name} className="flex items-center gap-3">
            {/* Radial arc */}
            <RadialArc pct={pct} stroke={c.stroke} />

            {/* Name */}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {row.name}
            </span>

            {/* Pct pill */}
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${c.bg} ${c.text}`}>
              {pct}%
            </span>

            {/* Count */}
            <div className="shrink-0 text-right min-w-[2.5rem]">
              <p className="text-sm font-black tabular-nums leading-tight text-foreground">
                {row.count.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">clicks</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
