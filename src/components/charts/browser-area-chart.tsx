"use client";

import { useState } from "react";
import { CANONICAL_BROWSERS, padToSix } from "@/lib/audience-breakdown";

type DataPoint = { name: string; count: number };

type TooltipState = {
  x: number;
  y: number;
  idx: number;
  name: string;
  count: number;
  pct: number;
} | null;

const W       = 280;
const H       = 150;
const PAD_TOP = 22;
const PAD_X   = 20;
const LABEL_H = 28;
const TOTAL_H = PAD_TOP + H + LABEL_H;

export function BrowserAreaChart({ data, total }: { data: DataPoint[]; total: number }) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const browsers  = padToSix(data, CANONICAL_BROWSERS);
  const maxCount  = browsers[0]?.count || 1;
  const N         = browsers.length;
  const STEP      = N > 1 ? (W - PAD_X * 2) / (N - 1) : 0;
  const BASE_Y    = PAD_TOP + H;

  if (N === 0) return null;

  const pts = browsers.map((b, i) => ({
    x:     N === 1 ? W / 2 : PAD_X + i * STEP,
    y:     PAD_TOP + H - Math.max((b.count / maxCount) * H, 4),
    pct:   Math.round((b.count / total) * 100),
    name:  b.name.replace(" Browser", ""),
    count: b.count,
  }));

  let curveSegment = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    curveSegment += ` C ${mx} ${pts[i].y} ${mx} ${pts[i + 1].y} ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  const linePath = `M 0 ${pts[0].y} L ${pts[0].x} ${pts[0].y}${curveSegment} L ${W} ${pts[N - 1].y}`;
  const areaPath = `${linePath} L ${W} ${BASE_Y} L 0 ${BASE_Y} Z`;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${TOTAL_H}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="browser-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0d9488" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((v) => (
          <line
            key={v}
            x1={PAD_X} x2={W - PAD_X}
            y1={PAD_TOP + H * (1 - v)} y2={PAD_TOP + H * (1 - v)}
            strokeDasharray="4 4" strokeWidth={1}
            style={{ stroke: "hsl(var(--border))" }}
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#browser-area-grad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#0d9488" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + labels + hover targets */}
        {pts.map((p) => (
          <g key={p.name}>
            {/* % above dot */}
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={10} fontWeight="700" fill="#0d9488">
              {p.pct}%
            </text>
            {/* Dot */}
            <circle
              cx={p.x} cy={p.y} r={5.5}
              fill={tooltip?.name === p.name ? "#0f766e" : "#0d9488"}
              stroke="white" strokeWidth={2.5}
              style={{ cursor: "pointer" }}
            />
            {/* Invisible wider hit area */}
            <circle
              cx={p.x} cy={p.y} r={14}
              fill="transparent"
              onMouseEnter={(e) => {
                const svg = (e.target as SVGCircleElement).closest("svg")!;
                const rect = svg.getBoundingClientRect();
                const scaleX = rect.width / W;
                setTooltip({
                  x:     p.x * scaleX,
                  y:     p.y * (rect.height / TOTAL_H),
                  idx:   pts.indexOf(p),
                  name:  p.name,
                  count: p.count,
                  pct:   p.pct,
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
            {/* Browser label */}
            <text x={p.x} y={BASE_Y + 18} textAnchor="middle" fontSize={9.5} style={{ fill: "hsl(var(--foreground))", fontWeight: 500 }}>
              {p.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip — shift alignment at edges to prevent overflow */}
      {tooltip && (() => {
        const isFirst = tooltip.idx === 0;
        const isLast  = tooltip.idx === N - 1;
        const style = isFirst
          ? { left: 0,         top: tooltip.y - 12 }
          : isLast
          ? { right: 0,        top: tooltip.y - 12 }
          : { left: tooltip.x, top: tooltip.y - 12 };
        const translate = isFirst ? "-translate-y-full" : isLast ? "-translate-x-0 -translate-y-full" : "-translate-x-1/2 -translate-y-full";
        return (
          <div
            className={`pointer-events-none absolute z-50 ${translate} rounded-lg border border-border bg-card px-3 py-2 shadow-lg`}
            style={style}
          >
            <p className="text-xs font-semibold text-foreground">{tooltip.name}</p>
            <p className="text-[11px] text-muted-foreground">
              <span className="font-bold text-primary tabular-nums">{tooltip.count.toLocaleString()}</span>
              {" clicks · "}
              <span className="font-bold text-foreground">{tooltip.pct}%</span>
            </p>
          </div>
        );
      })()}
    </div>
  );
}
