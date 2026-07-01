import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";

type Row = { referrer: string; count: number };

function parseLabel(raw: string): { label: string; isDirect: boolean } {
  if (!raw || raw === "Direct" || raw === "(direct)") {
    return { label: "Direct / none", isDirect: true };
  }
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return { label: host, isDirect: false };
  } catch {
    return { label: raw, isDirect: false };
  }
}

export function ReferrerTable({ data, total }: { data: Row[]; total: number }) {
  if (data.length === 0) {
    return <EmptyState title="No data yet" description="Referrer data will appear as your links get clicks." />;
  }

  return (
    <div className="divide-y divide-border/50">
      {data.map((row) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        const { label, isDirect } = parseLabel(row.referrer);

        return (
          <div key={row.referrer} className="flex items-center gap-3 py-2 text-sm">
            <div
              className={`h-2 w-2 shrink-0 rounded-full ${
                isDirect ? "bg-muted-foreground/30" : "bg-primary/60"
              }`}
            />
            <span className="min-w-0 flex-1 truncate text-foreground" title={row.referrer}>
              {label}
            </span>
            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden w-20 sm:block">
                <Progress value={pct} className="h-1.5" />
              </div>
              <span className="w-20 text-right text-xs text-muted-foreground">
                {row.count.toLocaleString()} ({pct}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
