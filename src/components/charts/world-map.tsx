"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

type DataPoint = { name: string; count: number };

// Country name → ISO 3166-1 numeric (matches topojson feature IDs)
const COUNTRY_NUM: Record<string, number> = {
  "United States": 840, "India": 356, "United Kingdom": 826, "Germany": 276,
  "Canada": 124, "Australia": 36, "France": 250, "Brazil": 76,
  "Japan": 392, "China": 156, "Netherlands": 528, "Spain": 724,
  "Italy": 380, "Mexico": 484, "South Korea": 410, "Russia": 643,
  "Turkey": 792, "Indonesia": 360, "Poland": 616, "Sweden": 752,
  "Norway": 578, "Denmark": 208, "Switzerland": 756, "Belgium": 56,
  "Portugal": 620, "Ireland": 372, "New Zealand": 554, "Singapore": 702,
  "Pakistan": 586, "Nigeria": 566, "South Africa": 710, "Philippines": 608,
  "Vietnam": 704, "Thailand": 764, "Malaysia": 458, "Argentina": 32,
  "Colombia": 170, "Egypt": 818, "Saudi Arabia": 682, "United Arab Emirates": 784,
  "Chile": 152, "Ukraine": 804, "Romania": 642, "Czech Republic": 203,
  "Hungary": 348, "Greece": 300, "Finland": 246, "Austria": 40,
  "Israel": 376, "Bangladesh": 50,
};

// Teal color scale — 5 levels (matches primary palette)
function getColor(count: number, max: number): string {
  if (!count || max === 0) return "#e2e8f0";
  const r = count / max;
  if (r < 0.15) return "#ccfbf1";
  if (r < 0.35) return "#5eead4";
  if (r < 0.60) return "#2dd4bf";
  if (r < 0.85) return "#0d9488";
  return "#0f766e";
}

export function WorldMap({ data }: { data: DataPoint[] }) {
  const [tooltip, setTooltip] = useState<{ name: string; count: number; x: number; y: number } | null>(null);

  const countMap: Record<number, { name: string; count: number }> = {};
  for (const d of data) {
    const num = COUNTRY_NUM[d.name];
    if (num) countMap[num] = d;
  }

  const max = data.reduce((m, d) => Math.max(m, d.count), 0);

  return (
    <div
      className="relative w-full"
      onMouseLeave={() => setTooltip(null)}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 155 }}
        style={{ width: "calc(100% + 16px)", height: "auto", marginLeft: "-8px", marginRight: "-8px" }}
      >
        <Geographies geography="/world-110m.json">
          {({ geographies }) =>
            geographies.map((geo) => {
              const id     = Number(geo.id);
              const entry  = countMap[id];
              const fill   = getColor(entry?.count ?? 0, max);
              const active = !!entry;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth={0.4}
                  style={{
                    default:  { outline: "none", transition: "fill 0.2s" },
                    hover:    { outline: "none", fill: active ? "#0f766e" : "#cbd5e1", cursor: active ? "pointer" : "default" },
                    pressed:  { outline: "none" },
                  }}
                  onMouseEnter={(e) => {
                    if (!active) return;
                    setTooltip({ name: entry.name, count: entry.count, x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    if (!active) return;
                    setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 px-1">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {["#e2e8f0", "#ccfbf1", "#5eead4", "#0d9488", "#0f766e"].map((c) => (
          <span
            key={c}
            className="h-2.5 w-4 rounded-sm"
            style={{ background: c, border: "1px solid rgba(0,0,0,0.06)" }}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>

      {/* Tooltip — fixed, follows cursor */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-border bg-card px-3 py-2 shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="text-xs font-semibold text-foreground">{tooltip.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {tooltip.count.toLocaleString()} clicks
          </p>
        </div>
      )}
    </div>
  );
}
