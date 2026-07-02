import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MousePointerClick,
  Users,
  Flame,
  TrendingUp,
  TrendingDown,
  Smartphone,
  Globe2,
  Link2,
  Compass,
  MapPin,
  FolderKanban,
  UserCircle,
  Trophy,
  BarChart3,
  Monitor,
  HeartPulse,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getUserPlan } from "@/lib/subscription";
import {
  getAnalytics,
  getBusinessOverview,
} from "@/server/queries/analytics.queries";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getDemoAnalytics, getDemoBusinessOverview } from "@/lib/demo-stats";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClicksLineChart } from "@/components/charts/clicks-line-chart";
import { DeviceDonutChart } from "@/components/charts/device-donut-chart";
import { BrowserAreaChart } from "@/components/charts/browser-area-chart";
import { OsBarChart } from "@/components/charts/os-bar-chart";
import { WorldMap } from "@/components/charts/world-map";
import { PeriodTabs } from "@/features/analytics/components/period-tabs";
import { LockedCard } from "@/features/analytics/components/locked-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

const ALL_PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { period } = await searchParams;

  let plan: Awaited<ReturnType<typeof getUserPlan>>;
  let data: Awaited<ReturnType<typeof getAnalytics>>;
  let overview: Awaited<ReturnType<typeof getBusinessOverview>>;

  if (IS_DEMO) {
    plan = "pro";
    const days = ALL_PERIODS.find((p) => p.label === period)?.days ?? 30;
    data = getDemoAnalytics(days);
    overview = getDemoBusinessOverview(days);
  } else {
    const [fetchedPlan, workspaceId] = await Promise.all([
      getUserPlan(session.user.id),
      ensureWorkspace(session.user.id),
    ]);
    plan = fetchedPlan;
    const days =
      plan === "starter" || plan === "pro"
        ? (ALL_PERIODS.find((p) => p.label === period)?.days ?? 30)
        : 7;
    [data, overview] = await Promise.all([
      getAnalytics(workspaceId, days, plan),
      getBusinessOverview(workspaceId, days),
    ]);
  }

  const isStarter = plan === "starter" || plan === "pro";
  const isPro = plan === "pro";

  const allowedPeriods = isPro
    ? ALL_PERIODS
    : isStarter
      ? ALL_PERIODS.slice(0, 2)
      : [];
  const days = isStarter
    ? (ALL_PERIODS.find((p) => p.label === period)?.days ?? 30)
    : 7;

  const peakDay = data.clicksPerDay.reduce(
    (best, d) => (d.count > best.count ? d : best),
    { date: "", count: 0 },
  );

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last {days} days
            {!isStarter && (
              <span className="ml-2 text-xs text-amber-600 font-medium">
                · 7-day window —{" "}
                <Link
                  href="/dashboard/settings/billing"
                  className="underline hover:text-amber-700"
                >
                  upgrade for longer periods
                </Link>
              </span>
            )}
          </p>
        </div>
        {isStarter && (
          <PeriodTabs periods={allowedPeriods} active={period ?? "30d"} />
        )}
      </div>

      {/* Business overview — the whole-business picture, not just this period's clicks */}
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-teal-800 text-white shadow-sm">
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                Your business, at a glance
              </p>
              <h2 className="mt-1 text-xl font-bold">Lifetime performance</h2>
            </div>
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                overview.growthPct >= 0
                  ? "bg-white/15 text-white"
                  : "bg-black/15 text-white"
              }`}
            >
              {overview.growthPct >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {overview.growthPct >= 0 ? "+" : ""}
              {overview.growthPct}% vs previous {days}d
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total links", value: overview.totalLinks, icon: Link2 },
              {
                label: "Campaigns",
                value: overview.totalCampaigns,
                icon: FolderKanban,
              },
              {
                label: "Client portals",
                value: overview.totalClients,
                icon: UserCircle,
              },
              {
                label: "Lifetime clicks",
                value: overview.totalClicksAllTime,
                icon: BarChart3,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/10 px-4 py-3.5 backdrop-blur-sm"
              >
                <s.icon className="h-4 w-4 text-white/70" />
                <p className="mt-2 text-2xl font-black">
                  {s.value.toLocaleString()}
                </p>
                <p className="mt-0.5 text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top performing campaigns — where the business impact actually comes from */}
        {overview.topCampaigns.length > 0 && (
          <div className="border-t border-white/10 bg-black/10 px-6 py-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Trophy className="h-4 w-4 text-amber-300" /> Top campaigns this
              period
            </p>
            <div className="space-y-2.5">
              {overview.topCampaigns.map((c, i) => {
                const max = overview.topCampaigns[0].count || 1;
                const pct = Math.max(6, Math.round((c.count / max) * 100));
                return (
                  <Link
                    key={c.id}
                    href={`/dashboard/campaigns/${c.id}`}
                    className="block rounded-lg px-1 py-1 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="truncate font-medium">{c.name}</span>
                      </span>
                      <span className="shrink-0 text-white/70">
                        {c.count.toLocaleString()} clicks
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Performance breakdown for the selected period */}
      <div className="flex items-center gap-2 pt-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Performance breakdown — last {days} days
        </h2>
      </div>

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="overflow-hidden border-teal-200/60">
          <CardContent className="relative p-5">
            <MousePointerClick className="absolute -right-2 -top-2 h-16 w-16 text-teal-500/10" />
            <div className="relative flex items-center gap-1.5 text-teal-700">
              <MousePointerClick className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Total clicks
              </p>
            </div>
            <p className="relative mt-1 text-3xl font-black text-foreground">
              {data.totalClicks.toLocaleString()}
            </p>
            <p className="relative mt-0.5 text-xs text-muted-foreground">
              in the last {days} days
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-violet-200/60">
          <CardContent className="relative p-5">
            <Users className="absolute -right-2 -top-2 h-16 w-16 text-violet-500/10" />
            <div className="relative flex items-center gap-1.5 text-violet-700">
              <Users className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Unique visitors
              </p>
            </div>
            <p className="relative mt-1 text-3xl font-black text-foreground">
              {data.uniqueClicks.toLocaleString()}
            </p>
            <p className="relative mt-0.5 text-xs text-muted-foreground">
              distinct IP addresses
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden border-amber-200/60">
          <CardContent className="relative p-5">
            <Flame className="absolute -right-2 -top-2 h-16 w-16 text-amber-500/10" />
            <div className="relative flex items-center gap-1.5 text-amber-700">
              <Flame className="h-3.5 w-3.5" />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Peak day
              </p>
            </div>
            <p className="relative mt-1 text-3xl font-black text-foreground">
              {peakDay.count > 0 ? peakDay.count.toLocaleString() : "—"}
            </p>
            <p className="relative mt-0.5 text-xs text-muted-foreground">
              {peakDay.count > 0
                ? new Date(peakDay.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : "no clicks yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clicks over time + Link health (left) / Devices (right) — three separate cards, like Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Clicks over time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" /> Clicks over time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.totalClicks === 0 ? (
                <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
                  No clicks recorded yet. Share your links to start tracking.
                </div>
              ) : (
                <ClicksLineChart data={data.clicksPerDay} days={days} />
              )}
            </CardContent>
          </Card>

          {/* Link health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <HeartPulse className="h-4 w-4 text-primary" /> Link health
              </CardTitle>
              <p className="text-xs text-muted-foreground">Status of all your links</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {[
                  {
                    label: "Active",
                    count: overview.activeLinks,
                    dot: "bg-emerald-500",
                    text: "text-emerald-700 dark:text-emerald-400",
                    bg: "bg-emerald-50 dark:bg-emerald-950/40",
                    bar: "bg-emerald-500",
                  },
                  {
                    label: "Inactive",
                    count: overview.inactiveLinks,
                    dot: "bg-muted-foreground/40",
                    text: "text-muted-foreground",
                    bg: "bg-muted/40",
                    bar: "bg-muted-foreground/30",
                  },
                  {
                    label: "Expiring soon",
                    count: overview.expiringSoon,
                    dot: "bg-amber-500",
                    text: "text-amber-700 dark:text-amber-400",
                    bg: "bg-amber-50 dark:bg-amber-950/40",
                    bar: "bg-amber-500",
                  },
                  {
                    label: "Expired",
                    count: overview.expiredLinks,
                    dot: "bg-destructive",
                    text: "text-destructive",
                    bg: "bg-destructive/5",
                    bar: "bg-destructive",
                  },
                ].map(({ label, count, dot, text, bg, bar }) => {
                  const pct = overview.totalLinks > 0 ? Math.round((count / overview.totalLinks) * 100) : 0;
                  return (
                    <div key={label} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5", bg)}>
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot)} />
                      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/8">
                          <div className={cn("h-full rounded-full", bar)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={cn("w-6 text-right text-xs font-semibold tabular-nums", text)}>
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Devices */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4 text-primary" /> Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceDonutChart data={data.clicksByDevice} />
          </CardContent>
        </Card>
      </div>

      {/* Audience breakdown — Browsers, OS, Countries */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Browsers — area chart + mini table */}
        {isStarter ? (
          (() => {
            const browsers = data.clicksByBrowser
              .map((r) => ({ name: r.browser, count: r.count }))
              .slice(0, 6);
            const total = browsers.reduce((s, r) => s + r.count, 0) || 1;
            return (
              <Card className="flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe2 className="h-4 w-4 text-primary" /> Browsers
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 pt-2">
                  {browsers.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No data yet.
                    </p>
                  ) : (
                    <>
                      <div className="min-h-0 flex-1">
                        <BrowserAreaChart data={browsers} total={total} />
                      </div>
                      <MiniBreakdownTable
                        rows={browsers}
                        total={total}
                        colLabel="Browser"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })()
        ) : (
          <LockedCard title="Browsers" requiredPlan="Starter" />
        )}

        {/* Operating systems — bar chart + mini table */}
        {isStarter ? (
          (() => {
            const osRows = data.clicksByOs
              .map((r) => ({ name: r.os, count: r.count }))
              .slice(0, 6);
            const total = osRows.reduce((s, r) => s + r.count, 0) || 1;
            return (
              <Card className="flex flex-col">
                <CardHeader className="pb-2 shrink-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Monitor className="h-4 w-4 text-primary" /> Operating
                    systems
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3 pt-2">
                  {osRows.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No data yet.
                    </p>
                  ) : (
                    <>
                      <div className="min-h-0 flex-1">
                        <OsBarChart data={osRows} total={total} />
                      </div>
                      <MiniBreakdownTable
                        rows={osRows}
                        total={total}
                        colLabel="Platform"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })()
        ) : (
          <LockedCard title="Operating systems" requiredPlan="Starter" />
        )}

        {/* Top countries — world map + mini table */}
        {isPro ? (
          (() => {
            const countries = data.topCountries.map((r) => ({
              name: r.country,
              count: r.count,
            }));
            const total = countries.reduce((s, r) => s + r.count, 0) || 1;
            return (
              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="pb-2 shrink-0">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-primary" /> Top countries
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-3 pb-3 pt-0">
                  {countries.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No geo data yet.
                    </p>
                  ) : (
                    <>
                      <div className="-mt-3">
                        <WorldMap data={countries} />
                      </div>
                      <MiniBreakdownTable
                        rows={countries}
                        total={total}
                        colLabel="Country"
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })()
        ) : (
          <LockedCard title="Top countries" requiredPlan="Pro" />
        )}
      </div>

      {/* Top referrers + Top links — same ranked-medal design, side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isStarter ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Compass className="h-4 w-4 text-primary" /> Top referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankedList
                items={data.topReferrers.map((r) => ({
                  id: r.referrer,
                  label: parseReferrerLabel(r.referrer),
                  count: r.count,
                }))}
                total={data.totalClicks}
                emptyText="No referrer data yet."
              />
            </CardContent>
          </Card>
        ) : (
          <LockedCard title="Top referrers" requiredPlan="Starter" />
        )}

        {isStarter ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4 text-primary" /> Top links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RankedList
                items={data.topLinks.map((l) => ({
                  id: l.id,
                  label: l.label,
                  count: l.count,
                  href: `/dashboard/links/${l.id}`,
                }))}
                total={data.totalClicks}
                emptyText="No click data yet."
              />
            </CardContent>
          </Card>
        ) : (
          <LockedCard title="Top links" requiredPlan="Starter" />
        )}
      </div>
    </div>
  );
}

const RANK = [
  {
    medal: "bg-primary/15 text-primary",
    bar: "bg-primary",
    ring: "ring-primary/30",
    text: "text-primary",
  },
  {
    medal:
      "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    bar: "bg-violet-500",
    ring: "ring-violet-300/40",
    text: "text-violet-500",
  },
  {
    medal:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    bar: "bg-emerald-500",
    ring: "ring-emerald-300/40",
    text: "text-emerald-500",
  },
  {
    medal: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    bar: "bg-amber-500",
    ring: "ring-amber-300/40",
    text: "text-amber-500",
  },
  {
    medal: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground/40",
    ring: "ring-border",
    text: "text-muted-foreground",
  },
];

function parseReferrerLabel(raw: string): string {
  if (!raw || raw === "Direct" || raw === "(direct)") return "Direct / none";
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}

type RankedItem = { id: string; label: string; count: number; href?: string };

function RankedList({
  items,
  total,
  emptyText,
}: {
  items: RankedItem[];
  total: number;
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    );
  }

  const max = items[0].count || 1;

  return (
    <div className="divide-y divide-border/60">
      {items.map((item, i) => {
        const barPct = Math.round((item.count / max) * 100);
        const sharePct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const rs = RANK[i] ?? RANK[4];

        const inner = (
          <>
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ring-1",
                rs.medal,
                rs.ring,
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {item.label}
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
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground">
                {sharePct}%
              </span>
              <div className="min-w-[2.5rem] text-right">
                <p
                  className={cn(
                    "text-sm font-black leading-tight tabular-nums",
                    rs.text,
                  )}
                >
                  {item.count.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">clicks</p>
              </div>
            </div>
          </>
        );

        return item.href ? (
          <Link
            key={item.id}
            href={item.href}
            className="group flex items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-muted/50"
          >
            {inner}
          </Link>
        ) : (
          <div
            key={item.id}
            className="group flex items-center gap-3 rounded-lg px-1 py-3"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

function MiniBreakdownTable({
  rows,
  total,
  colLabel,
}: {
  rows: { name: string; count: number }[];
  total: number;
  colLabel: string;
}) {
  const left = rows.slice(0, 3);
  const right = rows.slice(3, 6);
  return (
    <div className="shrink-0 border-t border-border/60">
      <div className="grid grid-cols-2 divide-x divide-border/60">
        {[left, right].map((col, ci) => (
          <div key={ci} className={ci === 1 ? "pl-3" : "pr-3"}>
            <div className="grid grid-cols-[1fr_44px_28px] items-center gap-1 border-b border-border/60 px-1 py-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {colLabel}
              </span>
              <span className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Clicks
              </span>
              <span className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                %
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {col.map((row) => {
                const pct = Math.round((row.count / total) * 100);
                return (
                  <div
                    key={row.name}
                    className="grid grid-cols-[1fr_44px_28px] items-center gap-1 px-1 py-1.5"
                  >
                    <span className="min-w-0 truncate text-[11px] font-medium text-foreground">
                      {row.name}
                    </span>
                    <span className="text-right text-[11px] font-bold tabular-nums text-foreground">
                      {row.count.toLocaleString()}
                    </span>
                    <span className="text-right text-[11px] tabular-nums text-muted-foreground">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
