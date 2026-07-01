"use client";

type DataPoint = { name: string; count: number };

const ARC_COLORS  = ["#0d9488", "#8b5cf6", "#10b981", "#f59e0b", "#0ea5e9"];
const DOT_CLASSES  = ["bg-primary", "bg-violet-500", "bg-emerald-500", "bg-amber-500", "bg-sky-500"];
const TEXT_CLASSES = ["text-primary", "text-violet-500", "text-emerald-500", "text-amber-500", "text-sky-500"];

// Each ring starts at a different angle — creates the offset pinwheel look from the reference
const START_OFFSETS = [0, 50, -40, 80, -60]; // degrees, relative to the top (after -rotate-90)

const CX      = 160;
const CY      = 160;
const STROKE  = 14;  // thinner so inner rings stay away from center
const GAP     = 8;
const OUTER_R = 149;

export function OsConcentricChart({ data }: { data: DataPoint[] }) {
  const items    = data.slice(0, 5);
  const total = items.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Chart */}
      <div className="relative mx-auto w-64 h-64">
        <svg viewBox="0 0 320 320" className="w-full h-full -rotate-90">
          {items.map((item, i) => {
            const r          = OUTER_R - i * (STROKE + GAP);
            const circ       = 2 * Math.PI * r;
            const fill       = (item.count / total) * circ; // actual % of total, not relative to max
            const color      = ARC_COLORS[i] ?? ARC_COLORS[4];
            // Shift each ring's start by a unique offset
            const dashOffset = -(START_OFFSETS[i]! / 360) * circ;

            return (
              <g key={item.name}>
                {/* Dotted track ring */}
                <circle
                  cx={CX} cy={CY} r={r}
                  fill="none"
                  strokeWidth={STROKE}
                  strokeDasharray="3 7"
                  strokeLinecap="round"
                  style={{ stroke: "hsl(var(--muted-foreground) / 0.18)" }}
                />
                {/* Colored arc — offset start position */}
                <circle
                  cx={CX} cy={CY} r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  strokeDasharray={`${fill} ${circ}`}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dasharray 0.8s ease" }}
                />
              </g>
            );
          })}
        </svg>

        {/* Center — white card circle matching reference design */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-card shadow-md ring-1 ring-border/30">
            <span className="text-lg font-black tabular-nums leading-none text-foreground">
              {total.toLocaleString()}
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={item.name} className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_CLASSES[i] ?? DOT_CLASSES[4]}`} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{item.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
              <span className={`w-14 text-right text-sm font-bold tabular-nums ${TEXT_CLASSES[i] ?? TEXT_CLASSES[4]}`}>
                {item.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
