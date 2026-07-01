import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

type UtmRow = { label: string; count: number };

// Same rank palette as Top Referrers / the Overview dashboard's Top
// Performers — campaign names are free-form, so rank position (not the
// label itself) drives the color here.
const RANK = [
  { chip: "bg-primary/15 text-primary ring-primary/30",                                        bar: "bg-primary",             text: "text-primary" },
  { chip: "bg-violet-100 text-violet-600 ring-violet-300/40 dark:bg-violet-950 dark:text-violet-400",   bar: "bg-violet-500",  text: "text-violet-500" },
  { chip: "bg-emerald-100 text-emerald-600 ring-emerald-300/40 dark:bg-emerald-950 dark:text-emerald-400", bar: "bg-emerald-500", text: "text-emerald-500" },
  { chip: "bg-amber-100 text-amber-600 ring-amber-300/40 dark:bg-amber-950 dark:text-amber-400",     bar: "bg-amber-500",   text: "text-amber-500" },
  { chip: "bg-muted text-muted-foreground ring-border",                                              bar: "bg-muted-foreground/40", text: "text-muted-foreground" },
];

export function LinkUtmCampaignsCard({ data }: { data: UtmRow[] }) {
  if (data.length === 0) {
    return <EmptyState title="No data yet" description="This breakdown will appear once your link has UTM-tagged clicks." />;
  }

  const total = data.reduce((s, r) => s + r.count, 0);
  const maxCount = data[0]?.count || 1;

  return (
    <div className="divide-y divide-border/60">
      {data.map((row, i) => {
        const barPct = Math.round((row.count / maxCount) * 100);
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        const rs = RANK[i] ?? RANK[4];

        return (
          <div key={row.label} className="flex items-center gap-3 rounded-lg px-1 py-3">
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ring-1", rs.chip)}>
              {i + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground mb-1.5">{row.label}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-all duration-500", rs.bar)} style={{ width: `${barPct}%` }} />
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
              <div className="text-right min-w-[2.5rem]">
                <p className={cn("text-sm font-black tabular-nums leading-tight", rs.text)}>{row.count.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">clicks</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
