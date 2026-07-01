import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

type ReferrerRow = { referrer: string; count: number };

// Same rank palette as the Overview dashboard's "Top Performers" card, so
// this card reads as a sibling of that design rather than a one-off.
const RANK = [
  {
    chip: "bg-primary/15 ring-primary/30",
    bar: "bg-primary",
    text: "text-primary",
  },
  {
    chip: "bg-violet-100 ring-violet-300/40 dark:bg-violet-950",
    bar: "bg-violet-500",
    text: "text-violet-500",
  },
  {
    chip: "bg-emerald-100 ring-emerald-300/40 dark:bg-emerald-950",
    bar: "bg-emerald-500",
    text: "text-emerald-500",
  },
  {
    chip: "bg-amber-100 ring-amber-300/40 dark:bg-amber-950",
    bar: "bg-amber-500",
    text: "text-amber-500",
  },
  {
    chip: "bg-muted ring-border",
    bar: "bg-muted-foreground/40",
    text: "text-muted-foreground",
  },
];

function parseReferrer(raw: string): {
  label: string;
  isDirect: boolean;
  faviconDomain: string | null;
} {
  if (!raw || raw === "Direct" || raw === "(direct)") {
    return { label: "Direct / none", isDirect: true, faviconDomain: null };
  }
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return { label: host, isDirect: false, faviconDomain: host };
  } catch {
    // Demo data / bare-domain values ("google.com") aren't valid URLs on their own.
    return { label: raw, isDirect: false, faviconDomain: raw };
  }
}

export function LinkReferrersCard({ data }: { data: ReferrerRow[] }) {
  const top = data.slice(0, 6);

  if (top.length === 0) {
    return (
      <EmptyState
        title="No data yet"
        description="Referrer data will appear as your links get clicks."
      />
    );
  }

  const total = data.reduce((s, r) => s + r.count, 0);
  const maxCount = top[0]?.count || 1;

  return (
    <div className="divide-y divide-border/60">
      {top.map((row, i) => {
        const { label, isDirect, faviconDomain } = parseReferrer(row.referrer);
        const barPct = Math.round((row.count / maxCount) * 100);
        const sharePct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        const rs = RANK[i] ?? RANK[4];

        return (
          <div
            key={row.referrer}
            className="flex items-center gap-3 rounded-lg px-1 py-3"
          >
            {/* Favicon / direct-traffic chip */}
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1",
                rs.chip,
              )}
            >
              {isDirect || !faviconDomain ? (
                <Compass className="h-4 w-4 text-muted-foreground" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://www.google.com/s2/favicons?domain=${faviconDomain}&sz=64`}
                  alt=""
                  className="h-4 w-4"
                />
              )}
            </span>

            {/* Label + bar */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground mb-1.5">
                {label}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    rs.bar,
                  )}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>

            {/* % + count + label */}
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {sharePct}%
              </span>
              <div className="text-right min-w-[2.5rem]">
                <p
                  className={cn(
                    "text-sm font-black tabular-nums leading-tight",
                    rs.text,
                  )}
                >
                  {row.count.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">clicks</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
