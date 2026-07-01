"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet, Bot, HelpCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

type DeviceRow = { device: string; count: number };

const ICONS: Record<string, React.ElementType> = {
  DESKTOP: Monitor,
  MOBILE:  Smartphone,
  TABLET:  Tablet,
  BOT:     Bot,
  UNKNOWN: HelpCircle,
};

// Ranked teal shades — darkest = highest share, matches the brand donut
// used on the Overview dashboard (kept local so that shared component,
// and its layout, are untouched by this page-specific redesign).
const SHADES = ["#0f766e", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4"];

const ALL_DEVICES = ["DESKTOP", "MOBILE", "TABLET", "BOT", "UNKNOWN"];

// Same arc geometry as the Overview dashboard's donut (rounded pill segments)
// so the ring itself matches that design exactly.
const CX = 110;
const CY = 110;
const R  = 78;   // centerline radius
const SW = 34;   // ring thickness
const RO = R + SW / 2;
const RI = R - SW / 2;
const CR = 4;    // corner radius in px
const GAP = 5;   // visual gap between segments in px

type Pt = [number, number];
const pt = (r: number, a: number): Pt => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
const f = ([x, y]: Pt) => `${x.toFixed(2)},${y.toFixed(2)}`;

function segmentPath(startDeg: number, endDeg: number): string {
  const s = (startDeg - 90) * (Math.PI / 180);
  const e = (endDeg - 90) * (Math.PI / 180);

  const dao = CR / RO;
  const dai = CR / RI;

  const A = pt(RO, s + dao);
  const B = pt(RO, e - dao);
  const Ceo  = pt(RO, e);
  const Ceo2 = pt(RO - CR, e);
  const Cei2 = pt(RI + CR, e);
  const Cei  = pt(RI, e);
  const D = pt(RI, e - dai);
  const E = pt(RI, s + dai);
  const Csi  = pt(RI, s);
  const Csi2 = pt(RI + CR, s);
  const Cso2 = pt(RO - CR, s);
  const Cso  = pt(RO, s);

  const large = (endDeg - startDeg) > 180 ? 1 : 0;

  return [
    `M ${f(A)}`,
    `A ${RO} ${RO} 0 ${large} 1 ${f(B)}`,
    `Q ${f(Ceo)} ${f(Ceo2)}`,
    `L ${f(Cei2)}`,
    `Q ${f(Cei)} ${f(D)}`,
    `A ${RI} ${RI} 0 ${large} 0 ${f(E)}`,
    `Q ${f(Csi)} ${f(Csi2)}`,
    `L ${f(Cso2)}`,
    `Q ${f(Cso)} ${f(A)}`,
    "Z",
  ].join(" ");
}

function label(device: string) {
  return device.charAt(0) + device.slice(1).toLowerCase();
}

// Split a ranked list into two columns of up to 3 rows each, matching the
// Browsers / Top Countries table layout on this page.
function twoColumns<T>(items: T[]): [T[], T[]] {
  return [items.slice(0, 3), items.slice(3, 6)];
}

export function LinkDevicesCard({ data }: { data: DeviceRow[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Always show all 5 device categories — missing ones default to 0, matching
  // the Overview dashboard's donut so Bot/Unknown never silently disappear.
  const countMap = Object.fromEntries(data.map((d) => [d.device, d.count]));
  const full: DeviceRow[] = ALL_DEVICES.map((device) => ({ device, count: countMap[device] ?? 0 }));
  const total = full.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return (
      <EmptyState
        title="No click data yet"
        description="Device breakdown will appear once this link gets clicks."
      />
    );
  }

  const sorted = [...full].sort((a, b) => b.count - a.count);
  const colorMap = Object.fromEntries(sorted.map((r, i) => [r.device, SHADES[i] ?? SHADES[SHADES.length - 1]]));
  const [devicesLeft, devicesRight] = twoColumns(sorted);

  const gapDeg = (GAP / (2 * Math.PI * R)) * 360;

  const arcs = sorted
    .filter((r) => r.count > 0 && (r.count / total) * 360 > gapDeg * 2)
    .reduce<{ cumFrac: number; rows: (DeviceRow & { startDeg: number; endDeg: number; color: string })[] }>(
      (acc, row) => {
        const frac     = row.count / total;
        const startDeg = acc.cumFrac * 360 + gapDeg / 2;
        const cumFrac  = acc.cumFrac + frac;
        const endDeg   = cumFrac * 360 - gapDeg / 2;
        return {
          cumFrac,
          rows: [...acc.rows, { ...row, startDeg, endDeg, color: colorMap[row.device] }],
        };
      },
      { cumFrac: 0, rows: [] },
    ).rows;

  return (
    <div className="flex flex-1 flex-col gap-3">
      {/* Donut — grows to absorb the grid-stretched height so the table below stays bottom-aligned with the Browsers card */}
      <div className="flex flex-1 min-h-0 items-center justify-center">
        <svg viewBox="0 0 220 220" className="w-full max-w-[220px]">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--muted)" strokeWidth={SW} />

          {arcs.map((arc) => {
            const midDeg = (arc.startDeg + arc.endDeg) / 2;
            const midRad = (midDeg - 90) * (Math.PI / 180);
            const pct = total > 0 ? ((arc.count / total) * 100).toFixed(1) : "0";
            const isActive = hovered === arc.device;
            const spanDeg = arc.endDeg - arc.startDeg;
            const showLabel = spanDeg > 18;

            return (
              <g
                key={arc.device}
                style={{ opacity: hovered && !isActive ? 0.3 : 1, transition: "opacity 0.2s" }}
                onMouseEnter={() => setHovered(arc.device)}
                onMouseLeave={() => setHovered(null)}
              >
                <path
                  d={segmentPath(arc.startDeg, arc.endDeg)}
                  fill={arc.color}
                  style={{
                    cursor: "pointer",
                    transform: isActive ? "scale(1.03)" : "scale(1)",
                    transformOrigin: `${CX}px ${CY}px`,
                    transition: "transform 0.2s",
                  }}
                />
                {showLabel && (
                  <text
                    x={CX + R * Math.cos(midRad)}
                    y={CY + R * Math.sin(midRad)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#ffffff"
                    style={{ pointerEvents: "none" }}
                  >
                    {pct}%
                  </text>
                )}
              </g>
            );
          })}

          <text x={CX} y={CY - 10} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#64748b">
            Total Clicks
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" dominantBaseline="middle" fontSize="26" fontWeight="800" fill="#0f172a">
            {total.toLocaleString()}
          </text>
        </svg>
      </div>

      {/* Bottom data section — 2 columns × 3 rows, matching Browsers / Top Countries */}
      <div className="border-t border-border/60 shrink-0">
        <div className="grid grid-cols-2 divide-x divide-border/60">
          {[devicesLeft, devicesRight].map((col, ci) => (
            <div key={ci} className={ci === 1 ? "pl-3" : "pr-3"}>
              <div className="grid grid-cols-[1fr_44px_28px] items-center gap-1 px-1 py-1 border-b border-border/60">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Device</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Clicks</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">%</span>
              </div>
              <div className="divide-y divide-border/40">
                {col.map((row) => {
                  const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                  const isDim = hovered !== null && hovered !== row.device;
                  const Icon = ICONS[row.device] ?? HelpCircle;
                  return (
                    <div
                      key={row.device}
                      className="grid cursor-default grid-cols-[1fr_44px_28px] items-center px-1 gap-1 py-1.5 transition-opacity"
                      style={{ opacity: isDim ? 0.5 : 1 }}
                      onMouseEnter={() => setHovered(row.device)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <span className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-medium text-foreground">
                        <Icon className="h-3 w-3 shrink-0" style={{ color: colorMap[row.device] }} />
                        <span className="truncate">{label(row.device)}</span>
                      </span>
                      <span className="text-[11px] font-bold tabular-nums text-foreground text-right">{row.count.toLocaleString()}</span>
                      <span className="text-[11px] tabular-nums text-muted-foreground text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
