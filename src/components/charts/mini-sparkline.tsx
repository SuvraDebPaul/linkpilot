type Props = {
  data: number[];
  className?: string;
};

export function MiniSparkline({ data, className }: Props) {
  if (data.length < 2) return null;

  const max  = Math.max(...data, 1);
  const W    = 80;
  const H    = 40;
  const PAD  = 2;
  const cW   = W - PAD * 2;
  const cH   = H - PAD * 2;

  const pts = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * cW,
    y: PAD + cH - (v / max) * cH * 0.85,
  }));

  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = [
    `M${pts[0].x.toFixed(1)},${H}`,
    ...pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L${pts[pts.length - 1].x.toFixed(1)},${H}`,
    "Z",
  ].join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-hidden="true"
    >
      <path d={area} fill="currentColor" fillOpacity={0.12} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r="2.5"
        fill="currentColor"
      />
    </svg>
  );
}
