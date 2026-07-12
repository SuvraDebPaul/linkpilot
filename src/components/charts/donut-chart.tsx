"use client";

import { useState } from "react";

type Segment = {
  label: string;
  value: number;
  color: string;       // SVG stroke color (hex or CSS var)
  bgClass: string;     // Tailwind bg for legend dot
  textClass: string;   // Tailwind text for legend value
};

type Props = {
  segments: Segment[];
  total: number;
  centerLabel?: string;
};

const CX = 90;
const CY = 90;
const R  = 62;
const SW = 22;
const C  = 2 * Math.PI * R; // circumference ≈ 389.6
const GAP = 3; // px gap between segments

export function DonutChart({ segments, total, centerLabel = "Total" }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Filter out zero segments to avoid tiny arcs
  const visible = segments.filter((s) => s.value > 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 180 180" className="w-full max-w-[160px]">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor"
            strokeWidth={SW} className="text-muted/60" strokeLinecap="round" />
          <text x={CX} y={CY - 6} textAnchor="middle" dominantBaseline="middle"
            fontSize="22" fontWeight="700" fill="currentColor" className="text-muted-foreground">
            0
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="currentColor" className="text-muted-foreground">
            {centerLabel}
          </text>
        </svg>
      </div>
    );
  }

  // Build cumulative offsets
  const arcs = visible.reduce<
    { list: Array<Segment & { frac: number; arcLen: number; offset: number }>; cum: number }
  >(
    (acc, seg) => {
      const frac = seg.value / total;
      const arcLen = Math.max(frac * C - GAP, 0);
      const offset = -(acc.cum * C);
      acc.list.push({ ...seg, frac, arcLen, offset });
      acc.cum += frac;
      return acc;
    },
    { list: [], cum: 0 },
  ).list;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Donut SVG */}
      <div className="relative w-full max-w-[160px]">
        <svg viewBox="0 0 180 180" className="w-full drop-shadow-sm">
          {/* Background track */}
          <circle
            cx={CX} cy={CY} r={R} fill="none"
            stroke="currentColor" strokeWidth={SW}
            className="text-muted/40"
          />

          {/* Segments */}
          <g transform={`rotate(-90 ${CX} ${CY})`}>
            {arcs.map((arc) => (
              <circle
                key={arc.label}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth={hovered === arc.label ? SW + 4 : SW}
                strokeDasharray={`${arc.arcLen} ${C}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHovered(arc.label)}
                onMouseLeave={() => setHovered(null)}
                style={{ opacity: hovered && hovered !== arc.label ? 0.4 : 1 }}
              />
            ))}
          </g>

          {/* Center text */}
          <text x={CX} y={CY - 7} textAnchor="middle" dominantBaseline="middle"
            fontSize="26" fontWeight="800" fill="currentColor"
            className="fill-foreground">
            {hovered
              ? (visible.find((s) => s.label === hovered)?.value ?? total).toLocaleString()
              : total.toLocaleString()}
          </text>
          <text x={CX} y={CY + 13} textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fill="currentColor"
            className="fill-muted-foreground">
            {hovered ?? centerLabel}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="w-full space-y-2">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center gap-2 cursor-default"
            onMouseEnter={() => setHovered(seg.label)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered && hovered !== seg.label ? 0.4 : 1 }}
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${seg.bgClass}`} />
            <span className="flex-1 text-xs text-muted-foreground">{seg.label}</span>
            <span className={`text-xs font-semibold ${seg.textClass}`}>
              {seg.value.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground w-8 text-right">
              {total > 0 ? `${Math.round((seg.value / total) * 100)}%` : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
