"use client";

import { useState } from "react";

type DataPoint = { name: string; count: number };

type TooltipState = {
  x: number;
  y: number;
  idx: number;
  name: string;
  count: number;
  pct: number;
} | null;

const BAR_COLORS = ["#0d9488", "#8b5cf6", "#10b981", "#f59e0b", "#0ea5e9", "#94a3b8"];

const W     = 290;
const H     = 190;
const GAP   = 8;

export function OsBarChart({ data, total }: { data: DataPoint[]; total: number }) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const items    = data.slice(0, 6);
  const maxCount = items[0]?.count || 1;
  const N        = items.length;
  const BAR_W    = (W - (N - 1) * GAP) / N;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((v) => (
          <line
            key={v} x1={0} x2={W}
            y1={H * (1 - v)} y2={H * (1 - v)}
            strokeDasharray="4 4" strokeWidth={1}
            style={{ stroke: "hsl(var(--border))" }}
          />
        ))}

        {items.map((row, i) => {
          const pct    = Math.round((row.count / total) * 100);
          const barH   = Math.max((row.count / total) * H, 5);
          const x      = i * (BAR_W + GAP);
          const y      = H - barH;
          const mid    = x + BAR_W / 2;
          const color  = BAR_COLORS[i] ?? BAR_COLORS[5];
          const inside = barH > 28;
          const hovered = tooltip?.idx === i;

          return (
            <g key={row.name}>
              {/* Ghost bar */}
              <rect x={x} y={0} width={BAR_W} height={H} rx={6} fill={color} opacity={0.1} />
              {/* Actual bar — darken on hover */}
              <rect
                x={x} y={y} width={BAR_W} height={barH} rx={6}
                fill={color}
                opacity={hovered ? 0.8 : 1}
                style={{ cursor: "pointer" }}
              />
              {/* % label */}
              {inside
                ? <text x={mid} y={y + 16} textAnchor="middle" fontSize={10} fontWeight="700" fill="#fff">{pct}%</text>
                : <text x={mid} y={y - 5}  textAnchor="middle" fontSize={10} fontWeight="700" fill={color}>{pct}%</text>
              }
              {/* OS name */}
              <text x={mid} y={H + 14} textAnchor="middle" fontSize={9.5} style={{ fill: "hsl(var(--muted-foreground))" }}>
                {row.name}
              </text>
              {/* Invisible hit area over full bar column */}
              <rect
                x={x} y={0} width={BAR_W} height={H}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => {
                  const svg = (e.target as SVGRectElement).closest("svg")!;
                  const rect = svg.getBoundingClientRect();
                  const scaleX = rect.width / W;
                  const scaleY = rect.height / (H + 18);
                  setTooltip({
                    x:     (x + BAR_W / 2) * scaleX,
                    y:     y * scaleY,
                    idx:   i,
                    name:  row.name,
                    count: row.count,
                    pct,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (() => {
        const isFirst = tooltip.idx === 0;
        const isLast  = tooltip.idx === N - 1;
        const style = isFirst
          ? { left: 0,          top: tooltip.y - 12 }
          : isLast
          ? { right: 0,         top: tooltip.y - 12 }
          : { left: tooltip.x,  top: tooltip.y - 12 };
        const shift = isFirst ? "-translate-y-full" : isLast ? "-translate-y-full" : "-translate-x-1/2 -translate-y-full";
        return (
          <div
            className={`pointer-events-none absolute z-50 ${shift} rounded-lg border border-border bg-card px-3 py-2 shadow-lg`}
            style={style}
          >
            <p className="text-xs font-semibold text-foreground">{tooltip.name}</p>
            <p className="text-[11px] text-muted-foreground">
              <span className="font-bold tabular-nums" style={{ color: BAR_COLORS[tooltip.idx] ?? BAR_COLORS[5] }}>
                {tooltip.count.toLocaleString()}
              </span>
              {" clicks · "}
              <span className="font-bold text-foreground">{tooltip.pct}%</span>
            </p>
          </div>
        );
      })()}
    </div>
  );
}
