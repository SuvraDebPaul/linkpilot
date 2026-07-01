import {
  Search, Share2, AtSign, MessageSquare, Users2, PlayCircle, Music2, Mail, Link2, Globe,
  DollarSign, TrendingUp, Handshake, BadgePercent, Megaphone, Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

type UtmRow = { label: string; count: number };

type IconDef = { icon: React.ElementType; color: string };

// utm_source values are user-typed but cluster around a small, recognizable
// set in practice — unlike campaign names, which are truly free-form.
const SOURCE_MAP: Record<string, IconDef> = {
  google:     { icon: Search,       color: "#4285F4" },
  bing:       { icon: Search,       color: "#00897B" },
  facebook:   { icon: Share2,       color: "#1877F2" },
  fb:         { icon: Share2,       color: "#1877F2" },
  instagram:  { icon: AtSign,       color: "#E1306C" },
  twitter:    { icon: MessageSquare, color: "#14171A" },
  x:          { icon: MessageSquare, color: "#14171A" },
  linkedin:   { icon: Users2,       color: "#0A66C2" },
  youtube:    { icon: PlayCircle,   color: "#FF0000" },
  tiktok:     { icon: Music2,       color: "#000000" },
  email:      { icon: Mail,         color: "#0d9488" },
  newsletter: { icon: Mail,         color: "#0d9488" },
  direct:     { icon: Link2,        color: "#94a3b8" },
};

const MEDIUM_MAP: Record<string, IconDef> = {
  cpc:      { icon: DollarSign,  color: "#f59e0b" },
  ppc:      { icon: DollarSign,  color: "#f59e0b" },
  paid:     { icon: DollarSign,  color: "#f59e0b" },
  organic:  { icon: TrendingUp,  color: "#10b981" },
  social:   { icon: Share2,      color: "#8b5cf6" },
  email:    { icon: Mail,        color: "#0d9488" },
  referral: { icon: Handshake,   color: "#0ea5e9" },
  affiliate:{ icon: BadgePercent, color: "#ec4899" },
  display:  { icon: Megaphone,   color: "#6366f1" },
  sms:      { icon: Smartphone,  color: "#22c55e" },
};

const FALLBACK: IconDef = { icon: Globe, color: "#94a3b8" };

function lookup(map: Record<string, IconDef>, label: string): IconDef {
  return map[label.trim().toLowerCase()] ?? FALLBACK;
}

type Props = {
  data: UtmRow[];
  kind: "source" | "medium";
};

export function LinkUtmBarList({ data, kind }: Props) {
  if (data.length === 0) {
    return <EmptyState title="No data yet" description="This breakdown will appear once your link has UTM-tagged clicks." />;
  }

  const map = kind === "source" ? SOURCE_MAP : MEDIUM_MAP;
  const total = data.reduce((s, r) => s + r.count, 0);
  const maxCount = data[0]?.count || 1;

  return (
    <div className="divide-y divide-border/60">
      {data.map((row) => {
        const { icon: Icon, color } = lookup(map, row.label);
        const barPct = Math.round((row.count / maxCount) * 100);
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;

        return (
          <div key={row.label} className="flex items-center gap-3 rounded-lg px-1 py-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg"
              style={{ backgroundColor: `${color}18` }}
            >
              <Icon className="h-4 w-4" style={{ color }} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground mb-1.5">{row.label}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barPct}%`, backgroundColor: color }} />
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
              <div className={cn("text-right", "min-w-[2.5rem]")}>
                <p className="text-sm font-black tabular-nums leading-tight" style={{ color }}>
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
