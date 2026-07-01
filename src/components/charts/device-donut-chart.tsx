"use client";

import { useState } from "react";
import { Monitor, Smartphone, Tablet, Bot, HelpCircle } from "lucide-react";

type DeviceRow = { device: string; count: number };

const SHADES = ["#0f766e", "#0d9488", "#14b8a6", "#2dd4bf", "#5eead4"];
const BG_HEX = ["#0f766e22", "#0d948822", "#14b8a622", "#2dd4bf22", "#5eead422"];

const ICONS: Record<string, React.ElementType> = {
  DESKTOP: Monitor,
  MOBILE:  Smartphone,
  TABLET:  Tablet,
  BOT:     Bot,
  UNKNOWN: HelpCircle,
};

const ALL_DEVICES = ["DESKTOP", "MOBILE", "TABLET", "BOT", "UNKNOWN"];

const CX  = 110;
const CY  = 110;
const R   = 78;   // centerline radius
const SW  = 34;   // ring thickness
const RO  = R + SW / 2; // outer radius
const RI  = R - SW / 2; // inner radius
const CR  = 4;    // corner radius in px
const GAP = 5;    // visual gap between segments in px (circumference units)

type Pt = [number, number];
const pt = (r: number, a: number): Pt => [
  CX + r * Math.cos(a),
  CY + r * Math.sin(a),
];
const f = ([x, y]: Pt) => `${x.toFixed(2)},${y.toFixed(2)}`;

function segmentPath(startDeg: number, endDeg: number): string {
  // Convert to radians offset by -90° so 0° is at top
  const s = (startDeg - 90) * (Math.PI / 180);
  const e = (endDeg   - 90) * (Math.PI / 180);

  // Angular inset for CR on each radius
  const dao = CR / RO;
  const dai = CR / RI;

  // Outer arc endpoints (inset from corners by CR)
  const A = pt(RO, s + dao); // outer arc start
  const B = pt(RO, e - dao); // outer arc end

  // End-cap corners (outer side → inner side)
  const Ceo  = pt(RO,      e);       // outer corner at end
  const Ceo2 = pt(RO - CR, e);       // step in along radial
  const Cei2 = pt(RI + CR, e);       // step out along radial (inner side)
  const Cei  = pt(RI,      e);       // inner corner at end

  // Inner arc endpoints
  const D = pt(RI, e - dai); // inner arc end   (CCW)
  const E = pt(RI, s + dai); // inner arc start (CCW)

  // Start-cap corners (inner side → outer side)
  const Csi  = pt(RI,      s);
  const Csi2 = pt(RI + CR, s);
  const Cso2 = pt(RO - CR, s);
  const Cso  = pt(RO,      s);

  const large = (endDeg - startDeg) > 180 ? 1 : 0;

  return [
    `M ${f(A)}`,
    `A ${RO} ${RO} 0 ${large} 1 ${f(B)}`,  // outer arc
    `Q ${f(Ceo)} ${f(Ceo2)}`,               // round outer-end corner
    `L ${f(Cei2)}`,                          // end cap radial line
    `Q ${f(Cei)} ${f(D)}`,                  // round inner-end corner
    `A ${RI} ${RI} 0 ${large} 0 ${f(E)}`,  // inner arc (reversed)
    `Q ${f(Csi)} ${f(Csi2)}`,               // round inner-start corner
    `L ${f(Cso2)}`,                          // start cap radial line
    `Q ${f(Cso)} ${f(A)}`,                  // round outer-start corner
    "Z",
  ].join(" ");
}

export function DeviceDonutChart({ data }: { data: DeviceRow[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const countMap = Object.fromEntries(data.map((d) => [d.device, d.count]));
  const full: DeviceRow[] = ALL_DEVICES.map((device) => ({
    device,
    count: countMap[device] ?? 0,
  }));

  const total  = full.reduce((s, d) => s + d.count, 0);
  const sorted = [...full].sort((a, b) => b.count - a.count);

  const colorMap = Object.fromEntries(sorted.map((r, i) => [r.device, SHADES[i]]));
  const bgMap    = Object.fromEntries(sorted.map((r, i) => [r.device, BG_HEX[i]]));

  // Gap in degrees
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
    <div>
      {/* Donut */}
      <div className="flex justify-center">
        <svg viewBox="0 0 220 220" className="w-full">
          {/* Background track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#ffffff" strokeWidth={SW} />

          {arcs.map((arc) => {
            const midDeg = (arc.startDeg + arc.endDeg) / 2;
            const midRad = (midDeg - 90) * (Math.PI / 180);
            const pct    = total > 0 ? ((arc.count / total) * 100).toFixed(1) : "0";
            const isActive = hovered === arc.device;
            // Only show label if segment is wide enough to fit text
            const spanDeg = arc.endDeg - arc.startDeg;
            const showLabel = spanDeg > 18;

            return (
              <g key={arc.device}
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
                {/* Percentage label inside the bar */}
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

          {/* Center text */}
          <text x={CX} y={CY - 10} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="#64748b">
            Total Clicks
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" dominantBaseline="middle"
            fontSize="26" fontWeight="800" fill="#0f172a">
            {total.toLocaleString()}
          </text>
        </svg>
      </div>

      {/* Device list */}
      <div className="mt-1 divide-y divide-border">
        {sorted.map((row) => {
          const Icon  = ICONS[row.device] ?? HelpCircle;
          const pct   = total > 0 ? Math.round((row.count / total) * 100) : 0;
          const label = row.device.charAt(0) + row.device.slice(1).toLowerCase();
          const isHov = hovered === row.device;

          return (
            <div
              key={row.device}
              className="flex items-center gap-3 py-2.5 cursor-default"
              style={{ opacity: hovered && !isHov ? 0.35 : 1, transition: "opacity 0.15s" }}
              onMouseEnter={() => setHovered(row.device)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: bgMap[row.device] }}>
                <Icon className="h-4 w-4" style={{ color: colorMap[row.device] }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
                <p className="text-xs text-muted-foreground">{pct}% of clicks</p>
              </div>
              <span className="text-sm font-bold text-foreground tabular-nums">
                {row.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
