import { Link2, MousePointerClick, Zap, Trophy } from "lucide-react";
import { siteConfig } from "@/config/site";

type ReportLink = {
  id: string;
  title: string | null;
  shortCode: string;
  isActive: boolean;
  expiresAt: Date | null;
  _count: { clicks: number };
};

type DeviceRow = { device: string; count: number };

type Props = {
  campaignName: string;
  campaignDescription: string | null;
  links: ReportLink[];
  deviceBreakdown?: DeviceRow[];
  from?: Date | null;
  to?: Date | null;
};

const DEVICE_BARS: Record<string, string> = {
  mobile: "bg-teal-500",
  desktop: "bg-violet-500",
  tablet: "bg-amber-500",
};

export function ReportContent({ campaignName, campaignDescription, links, deviceBreakdown, from, to }: Props) {
  const now = new Date();

  const totalClicks = links.reduce((s, l) => s + l._count.clicks, 0);
  const activeLinks = links.filter(
    (l) => l.isActive && (!l.expiresAt || l.expiresAt > now),
  ).length;

  const generatedAt = now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const periodLabel =
    from || to
      ? `${from ? from.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} to ${to ? to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "today"}`
      : "All time";

  const sortedLinks = links.slice().sort((a, b) => b._count.clicks - a._count.clicks);
  const maxClicks = sortedLinks[0]?._count.clicks || 1;

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:shadow-none print:border-0">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-primary to-teal-700 px-8 pb-8 pt-9 text-white print:bg-primary print:bg-none">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          {siteConfig.name} · Campaign Report
        </p>
        <h1 className="mt-2 text-3xl font-bold">{campaignName}</h1>
        {campaignDescription && (
          <p className="mt-1.5 max-w-xl text-sm text-white/80">{campaignDescription}</p>
        )}
        <p className="mt-4 text-xs text-white/60">
          Generated {generatedAt} · Period: {periodLabel}
        </p>
      </div>

      <div className="space-y-8 px-8 py-8">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total links", value: links.length, icon: Link2 },
            { label: "Active links", value: activeLinks, icon: Zap },
            { label: "Total clicks", value: totalClicks.toLocaleString(), icon: MousePointerClick },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 text-center">
              <s.icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
              <p className="text-2xl font-bold text-slate-950">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Links breakdown */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-950">
            <Trophy className="h-4 w-4 text-amber-500" /> Link performance
          </h2>
          {sortedLinks.length === 0 ? (
            <p className="text-sm text-slate-400">No links in this campaign.</p>
          ) : (
            <div className="space-y-2.5">
              {sortedLinks.map((link, i) => {
                const isExpired = link.expiresAt ? link.expiresAt < now : false;
                const status = isExpired ? "Expired" : link.isActive ? "Active" : "Inactive";
                const pct = Math.max(4, Math.round((link._count.clicks / maxClicks) * 100));
                return (
                  <div key={link.id} className="rounded-lg border border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{link.title || link.shortCode}</p>
                          <p className="truncate text-xs text-slate-400">
                            {siteConfig.url.replace(/^https?:\/\//, "")}/{link.shortCode}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold text-slate-950">{link._count.clicks.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{status}</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-950">
                <span>Total</span>
                <span>{totalClicks.toLocaleString()} clicks</span>
              </div>
            </div>
          )}
        </div>

        {/* Device breakdown */}
        {deviceBreakdown && deviceBreakdown.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-950">Clicks by device</h2>
            <div className="space-y-3">
              {deviceBreakdown.map((row) => {
                const pct = totalClicks > 0 ? Math.round((row.count / totalClicks) * 100) : 0;
                const barColor = DEVICE_BARS[row.device.toLowerCase()] ?? "bg-slate-400";
                return (
                  <div key={row.device} className="flex items-center gap-3">
                    <p className="w-16 shrink-0 text-xs font-medium capitalize text-slate-600">
                      {row.device.toLowerCase()}
                    </p>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="w-24 shrink-0 text-right text-xs text-slate-500">
                      <span className="font-semibold text-slate-950">{pct}%</span> · {row.count.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-8 py-4 text-center text-xs text-slate-400">
        {siteConfig.url} · {siteConfig.name}
      </div>
    </div>
  );
}
