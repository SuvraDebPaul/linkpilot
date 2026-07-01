"use client";

import { useRef, useState } from "react";

type DataPoint = { date: string; count: number };

const W = 600;
const H = 260;
const PAD = { top: 14, right: 12, bottom: 32, left: 38 };
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d} ${MONTHS[parseInt(m, 10) - 1]}`;
}

export function ClicksLineChart({ data, days = 30 }: { data: DataPoint[]; days?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<{ index: number; svgX: number; svgY: number } | null>(null);

  if (data.length < 2) return null;

  const max = Math.max(...data.map((d) => d.count), 1);
  const mid = Math.round(max / 2);

  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * CHART_W,
    y: PAD.top + CHART_H - (d.count / max) * CHART_H,
    ...d,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = [
    `M${points[0].x},${PAD.top + CHART_H}`,
    ...points.map((p) => `L${p.x},${p.y}`),
    `L${points[points.length - 1].x},${PAD.top + CHART_H}`,
    "Z",
  ].join(" ");

  const yLabels = [
    { y: PAD.top + CHART_H, label: "0" },
    ...(mid > 0 && mid < max ? [{ y: PAD.top + CHART_H / 2, label: String(mid) }] : []),
    { y: PAD.top, label: String(max) },
  ];

  const xStep = Math.max(Math.floor(data.length / 5), 1);
  const xLabels = data
    .filter((_, i) => i % xStep === 0 || i === data.length - 1)
    .map((d) => {
      const idx = data.indexOf(d);
      return {
        x: PAD.left + (idx / (data.length - 1)) * CHART_W,
        label: fmtDate(d.date),
      };
    });

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const relX = mouseX - PAD.left;
    const ratio = Math.max(0, Math.min(1, relX / CHART_W));
    const index = Math.round(ratio * (data.length - 1));
    const p = points[index];
    if (p) setHovered({ index, svgX: p.x, svgY: p.y });
  }

  const hp = hovered !== null ? points[hovered.index] : null;
  const tooltipOnLeft = hp ? hp.x > W * 0.65 : false;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-crosshair"
        aria-label={`Clicks over the last ${days} days`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={PAD.left} x2={W - PAD.right}
            y1={PAD.top + CHART_H * (1 - t)}
            y2={PAD.top + CHART_H * (1 - t)}
            stroke="#e2e8f0" strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={area} fill="url(#clicksGrad)" />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Hover: vertical guideline */}
        {hp && (
          <line
            x1={hp.x} x2={hp.x}
            y1={PAD.top} y2={PAD.top + CHART_H}
            stroke="#0d9488" strokeWidth="1" strokeDasharray="3 3" opacity="0.5"
          />
        )}

        {/* Hover: dot */}
        {hp && (
          <>
            <circle cx={hp.x} cy={hp.y} r="5" fill="white" stroke="#0d9488" strokeWidth="2" />
            <circle cx={hp.x} cy={hp.y} r="2.5" fill="#0d9488" />
          </>
        )}

        {/* Y labels */}
        {yLabels.map(({ y, label }) => (
          <text key={y} x={PAD.left - 6} y={y}
            textAnchor="end" dominantBaseline="middle"
            fontSize="9" fill="#94a3b8"
          >
            {label}
          </text>
        ))}

        {/* X labels */}
        {xLabels.map(({ x, label }) => (
          <text key={label} x={x} y={H - 4}
            textAnchor="middle" fontSize="9" fill="#94a3b8"
          >
            {label}
          </text>
        ))}
      </svg>

      {/* Floating tooltip */}
      {hp && (
        <div
          className="pointer-events-none absolute top-0 z-10"
          style={{
            left: `${(hp.x / W) * 100}%`,
            transform: tooltipOnLeft ? "translateX(-100%) translateX(-8px)" : "translateX(8px)",
          }}
        >
          <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs whitespace-nowrap">
            <p className="font-semibold text-foreground">{hp.count.toLocaleString()} clicks</p>
            <p className="text-muted-foreground">{fmtDate(hp.date)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
