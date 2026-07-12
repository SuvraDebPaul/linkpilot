import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Link2,
  MousePointerClick,
  Activity,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  Folder,
  Zap,
  Globe,
  Monitor,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/server/queries/dashboard.queries";
import { WorldMap } from "@/components/charts/world-map";
import { BrowserAreaChart } from "@/components/charts/browser-area-chart";
import { OsBarChart } from "@/components/charts/os-bar-chart";
import { CANONICAL_BROWSERS, CANONICAL_OS, padToSix } from "@/lib/audience-breakdown";

const COUNTRY_CODE: Record<string, string> = {
  "United States": "US",
  India: "IN",
  "United Kingdom": "GB",
  Germany: "DE",
  Canada: "CA",
  Australia: "AU",
  France: "FR",
  Brazil: "BR",
  Japan: "JP",
  China: "CN",
  Netherlands: "NL",
  Spain: "ES",
  Italy: "IT",
  Mexico: "MX",
  "South Korea": "KR",
  Russia: "RU",
  Turkey: "TR",
  Indonesia: "ID",
  Poland: "PL",
  Sweden: "SE",
  Norway: "NO",
  Denmark: "DK",
  Switzerland: "CH",
  Belgium: "BE",
  Portugal: "PT",
  Ireland: "IE",
  "New Zealand": "NZ",
  Singapore: "SG",
  Pakistan: "PK",
  Nigeria: "NG",
  "South Africa": "ZA",
  Philippines: "PH",
  Vietnam: "VN",
  Thailand: "TH",
  Malaysia: "MY",
  Argentina: "AR",
  Colombia: "CO",
  Egypt: "EG",
  "Saudi Arabia": "SA",
  "United Arab Emirates": "AE",
};

function countryFlag(name: string): string {
  const code = COUNTRY_CODE[name];
  if (!code) return "🌍";
  return [...code]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getUserPlan, getUserUsage, PLAN_LIMITS } from "@/lib/subscription";
import { siteConfig } from "@/config/site";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClicksLineChart } from "@/components/charts/clicks-line-chart";
import { DeviceDonutChart } from "@/components/charts/device-donut-chart";
import { MiniSparkline } from "@/components/charts/mini-sparkline";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { EmptyState } from "@/components/shared/empty-state";
import { DashboardOnboarding } from "@/features/onboarding/components/dashboard-onboarding";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const workspaceId = await ensureWorkspace(session.user.id);
  const [stats, plan, usage] = await Promise.all([
    getDashboardStats(session.user.id, workspaceId),
    getUserPlan(session.user.id),
    getUserUsage(session.user.id),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? null;
  const isOnboarding =
    stats.totalLinks === 0 ||
    stats.totalCampaigns === 0 ||
    stats.totalClicks === 0;

  if (isOnboarding) {
    return (
      <DashboardOnboarding
        firstName={firstName}
        totalLinks={stats.totalLinks}
        totalCampaigns={stats.totalCampaigns}
        totalClicks={stats.totalClicks}
      />
    );
  }

  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const limit = PLAN_LIMITS[plan].links;
  const usedCount = plan === "free" ? usage.linksCreated : stats.totalLinks;
  const usagePercent = isFinite(limit)
    ? Math.round((usedCount / limit) * 100)
    : 0;
  const nearLimit = isFinite(limit) && usagePercent >= 80;

  const activePercent =
    stats.totalLinks > 0
      ? Math.round((stats.activeLinks / stats.totalLinks) * 100)
      : 0;

  // Last 7 days of clicks — used as sparkline data on all stat cards
  const spark7 = stats.clicksPerDay.slice(-7).map((d) => d.count);

  return (
    <div className="space-y-6">
      {/* ── Welcome header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{firstName ? `, ${firstName}` : ""}! 👋
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formattedDate} — here&apos;s what&apos;s happening with your links.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "capitalize font-medium",
              plan === "pro" && "bg-primary/10 text-primary",
              plan === "starter" &&
                "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
            )}
          >
            {plan} plan
          </Badge>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/campaigns/new">
              <Folder className="mr-1.5 h-3.5 w-3.5" />
              Campaign
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/links/new">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New link
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Free plan usage notice ── */}
      {nearLimit && (
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <Zap className="h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              You&apos;ve used {usedCount} of {limit} links ({usagePercent}%)
            </p>
            <div className="mt-1.5">
              <Progress
                value={usagePercent}
                className="h-1.5 bg-amber-100 dark:bg-amber-900"
              />
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
          >
            <Link href="/dashboard/settings/billing">Upgrade</Link>
          </Button>
        </div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Links */}
        <Card>
          <CardContent className="px-4 py-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Total Links
              </span>
            </div>

            {/* Number + sparkline */}
            <div className="mt-2.5 flex items-end justify-between gap-2">
              <p className="text-4xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={stats.totalLinks} />
              </p>
              <MiniSparkline
                data={spark7}
                className="mb-1 h-10 w-20 text-primary"
              />
            </div>

            {/* Trend */}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              Increase by
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                +{stats.linksThisWeek}
              </span>
              this week
            </div>
          </CardContent>
        </Card>

        {/* Total Clicks */}
        <Card>
          <CardContent className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
                <MousePointerClick className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Total Clicks
              </span>
            </div>

            <div className="mt-2.5 flex items-end justify-between gap-2">
              <p className="text-4xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={stats.totalClicks} />
              </p>
              <MiniSparkline
                data={spark7}
                className="mb-1 h-10 w-20 text-violet-500"
              />
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              vs last week
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-semibold",
                  stats.clickTrend > 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : stats.clickTrend < 0
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {stats.clickTrend > 0 ? "+" : ""}
                {stats.clickTrend}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Links */}
        <Card>
          <CardContent className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Active Links
              </span>
            </div>

            <div className="mt-2.5 flex items-end justify-between gap-2">
              <p className="text-4xl font-bold tracking-tight text-foreground">
                <AnimatedNumber value={stats.activeLinks} />
              </p>
              <MiniSparkline
                data={spark7}
                className="mb-1 h-10 w-20 text-emerald-500"
              />
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                {activePercent}%
              </span>
              of total links active
            </div>
          </CardContent>
        </Card>

        {/* Expiring Soon / Campaigns */}
        <Card
          className={cn(
            stats.expiringSoon > 0 && "border-amber-200 dark:border-amber-900",
          )}
        >
          <CardContent className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  stats.expiringSoon > 0
                    ? "bg-amber-100 dark:bg-amber-950"
                    : "bg-sky-100 dark:bg-sky-950",
                )}
              >
                {stats.expiringSoon > 0 ? (
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <Folder className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                )}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {stats.expiringSoon > 0 ? "Expiring Soon" : "Campaigns"}
              </span>
            </div>

            <div className="mt-2.5 flex items-end justify-between gap-2">
              <p className="text-4xl font-bold tracking-tight text-foreground">
                <AnimatedNumber
                  value={stats.expiringSoon > 0 ? stats.expiringSoon : stats.totalCampaigns}
                />
              </p>
              <MiniSparkline
                data={spark7}
                className={cn(
                  "mb-1 h-10 w-20",
                  stats.expiringSoon > 0 ? "text-amber-500" : "text-sky-500",
                )}
              />
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              {stats.expiringSoon > 0 ? (
                <>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    !
                  </span>
                  Review and renew soon
                </>
              ) : (
                <>{stats.totalLinks} links tracked across campaigns</>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Click Activity + Link Health */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Clicks chart */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Click Activity
                  </CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Last 30 days
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">
                    <AnimatedNumber value={stats.clicksLast30Days} />
                  </span>
                  <span className="text-xs text-muted-foreground">
                    total clicks
                  </span>
                  {stats.clicksLast7Days > 0 && (
                    <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      <TrendingUp className="h-3 w-3" />+
                      {stats.clicksLast7Days.toLocaleString()} this week
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-2">
              {stats.clicksLast30Days === 0 ? (
                <EmptyState
                  icon={MousePointerClick}
                  title="No clicks yet"
                  description="Share your links to start seeing data here."
                  className="h-[120px] py-0"
                />
              ) : (
                <ClicksLineChart data={stats.clicksPerDay} />
              )}
            </CardContent>
          </Card>

          {/* Link Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Link Health
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Status of all your links
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {[
                  {
                    label: "Active",
                    count: stats.activeLinks,
                    dot: "bg-emerald-500",
                    text: "text-emerald-700 dark:text-emerald-400",
                    bg: "bg-emerald-50 dark:bg-emerald-950/40",
                    bar: "bg-emerald-500",
                  },
                  {
                    label: "Inactive",
                    count: stats.inactiveLinks,
                    dot: "bg-muted-foreground/40",
                    text: "text-muted-foreground",
                    bg: "bg-muted/40",
                    bar: "bg-muted-foreground/30",
                  },
                  {
                    label: "Expiring soon",
                    count: stats.expiringSoon,
                    dot: "bg-amber-500",
                    text: "text-amber-700 dark:text-amber-400",
                    bg: "bg-amber-50 dark:bg-amber-950/40",
                    bar: "bg-amber-500",
                  },
                  {
                    label: "Expired",
                    count: stats.expiredLinks,
                    dot: "bg-destructive",
                    text: "text-destructive",
                    bg: "bg-destructive/5",
                    bar: "bg-destructive",
                  },
                ].map(({ label, count, dot, text, bg, bar }) => {
                  const pct =
                    stats.totalLinks > 0
                      ? Math.round((count / stats.totalLinks) * 100)
                      : 0;
                  return (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5",
                        bg,
                      )}
                    >
                      <span
                        className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot)}
                      />
                      <span className="flex-1 text-sm font-medium text-foreground">
                        {label}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-black/8">
                          <div
                            className={cn("h-full rounded-full", bar)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "w-6 text-right text-xs font-semibold tabular-nums",
                            text,
                          )}
                        >
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
        {/* end left column */}

        {/* Devices — 1/3 */}
        <Card>
          <CardHeader className="px-4">
            <CardTitle className="text-base font-semibold">Devices</CardTitle>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardHeader>
          <CardContent className="px-4">
            <DeviceDonutChart data={stats.clicksByDevice} />
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent links — 2/3 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Recent Links
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your 5 most recently created links
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Link href="/dashboard/links">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            {stats.recentLinks.length === 0 ? (
              <EmptyState
                icon={Link2}
                title="No links yet"
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/links/new">
                      Create your first link
                    </Link>
                  </Button>
                }
              />
            ) : (
              <div>
                {/* Table header */}
                <div className="mb-1 grid grid-cols-[90px_1fr_64px_64px] items-center gap-3 px-3 pb-2 border-b border-border">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Link
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Created
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Clicks
                  </span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border/60">
                  {stats.recentLinks.map((link) => {
                    const now = new Date();
                    const isExpired = link.expiresAt
                      ? link.expiresAt < now
                      : false;
                    const isExpiringSoon =
                      !isExpired && link.expiresAt
                        ? link.expiresAt.getTime() - now.getTime() <
                          7 * 24 * 60 * 60 * 1000
                        : false;

                    const status = isExpired
                      ? {
                          label: "Expired",
                          cls: "bg-destructive/10 text-destructive",
                          dot: "bg-destructive",
                        }
                      : isExpiringSoon
                        ? {
                            label: "Expiring",
                            cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
                            dot: "bg-amber-500",
                          }
                        : link.isActive
                          ? {
                              label: "Active",
                              cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
                              dot: "bg-emerald-500",
                            }
                          : {
                              label: "Inactive",
                              cls: "bg-muted text-muted-foreground",
                              dot: "bg-muted-foreground/40",
                            };

                    // Relative time
                    const diffMs =
                      now.getTime() - new Date(link.createdAt).getTime();
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const timeAgo =
                      diffDays === 0
                        ? "Today"
                        : diffDays === 1
                          ? "Yesterday"
                          : diffDays < 7
                            ? `${diffDays}d ago`
                            : diffDays < 30
                              ? `${Math.floor(diffDays / 7)}w ago`
                              : `${Math.floor(diffDays / 30)}mo ago`;

                    return (
                      <Link
                        key={link.id}
                        href={`/dashboard/links/${link.id}`}
                        className="group grid grid-cols-[90px_1fr_64px_64px] items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
                      >
                        {/* Status badge */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold w-fit",
                            status.cls,
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              status.dot,
                            )}
                          />
                          {status.label}
                        </span>

                        {/* Title + short URL */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {link.title || link.shortCode}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground font-mono">
                            {siteConfig.url}/{link.shortCode}
                          </p>
                        </div>

                        {/* Created */}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {timeAgo}
                        </span>

                        {/* Clicks */}
                        <div className="flex items-center justify-end gap-1">
                          <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-bold tabular-nums text-foreground">
                            {link._count.clicks.toLocaleString()}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Top Performers
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ranked by total clicks
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            {stats.topLinks.length === 0 ? (
              <EmptyState
                icon={MousePointerClick}
                title="No click data yet"
                description="Your top performers will appear here once you have clicks."
              />
            ) : (
              <div className="divide-y divide-border/60">
                {stats.topLinks.map((link, i) => {
                  const maxClicks = stats.topLinks[0]._count.clicks || 1;
                  const barPct = Math.round(
                    (link._count.clicks / maxClicks) * 100,
                  );
                  const sharePct =
                    stats.totalClicks > 0
                      ? Math.round(
                          (link._count.clicks / stats.totalClicks) * 100,
                        )
                      : 0;

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
                      medal:
                        "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
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
                  const rs = RANK[i] ?? RANK[4];

                  return (
                    <Link
                      key={link.id}
                      href={`/dashboard/links/${link.id}`}
                      className="group flex items-center gap-3 py-3 rounded-lg px-1 transition-colors hover:bg-muted/50"
                    >
                      {/* Rank medal */}
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ring-1",
                          rs.medal,
                          rs.ring,
                        )}
                      >
                        {i + 1}
                      </span>

                      {/* Name + bar */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5">
                          {link.title || link.shortCode}
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
                            {link._count.clicks.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            clicks
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Audience Breakdown: Browser + OS + Countries ── */}
      {(stats.clicksByBrowser.length > 0 ||
        stats.clicksByOs.length > 0 ||
        stats.clicksByCountry.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Browsers — ranked card */}
          {stats.clicksByBrowser.length > 0 &&
            (() => {
              const total = stats.clicksByBrowser.reduce((s, r) => s + r.count, 0) || 1;
              const browsers = padToSix(stats.clicksByBrowser, CANONICAL_BROWSERS);

              return (
                <Card className="flex flex-col">
                  <CardHeader className="pb-2 shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          Browsers
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Top browsers by clicks
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums text-foreground">
                          {total.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          total clicks
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 pt-2 px-4 pb-4 gap-3">
                    {/* Gradient area chart with tooltip */}
                    <div className="flex-1 min-h-0">
                      <BrowserAreaChart data={browsers} total={total} />
                    </div>

                    {/* 2 × 3 table */}
                    <div className="border-t border-border/60 shrink-0">
                      <div className="grid grid-cols-2 divide-x divide-border/60">
                        {[browsers.slice(0, 3), browsers.slice(3, 6)].map(
                          (col, ci) => (
                            <div
                              key={ci}
                              className={ci === 1 ? "pl-3" : "pr-3"}
                            >
                              <div className="grid grid-cols-[1fr_44px_28px] items-center gap-1 px-1 py-1 border-b border-border/60">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  Browser
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                                  Clicks
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                                  %
                                </span>
                              </div>
                              <div className="divide-y divide-border/40">
                                {col.map((row) => {
                                  const pct = Math.round(
                                    (row.count / total) * 100,
                                  );
                                  return (
                                    <div
                                      key={row.name}
                                      className="grid grid-cols-[1fr_44px_28px] items-center px-1 gap-1 py-1.5"
                                    >
                                      <span className="min-w-0 truncate text-[11px] font-medium text-foreground">
                                        {row.name}
                                      </span>
                                      <span className="text-[11px] font-bold tabular-nums text-foreground text-right">
                                        {row.count.toLocaleString()}
                                      </span>
                                      <span className="text-[11px] tabular-nums text-muted-foreground text-right">
                                        {pct}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

          {/* Operating Systems — SVG bar chart + 2×3 table */}
          {stats.clicksByOs.length > 0 &&
            (() => {
              const total = stats.clicksByOs.reduce((s, r) => s + r.count, 0) || 1;
              const osData = padToSix(stats.clicksByOs, CANONICAL_OS);
              const left = osData.slice(0, 3);
              const right = osData.slice(3, 6);

              return (
                <Card className="flex flex-col">
                  <CardHeader className="pb-2 shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          Operating Systems
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Top platforms by clicks
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums text-foreground">
                          {total.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          total clicks
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 pt-2 px-4 pb-4 gap-3">
                    {/* Bar chart with tooltip */}
                    <div className="flex-1 min-h-0">
                      <OsBarChart data={osData} total={total} />
                    </div>

                    {/* 2 × 3 table — pinned to bottom, same style as Countries card */}
                    <div className="border-t border-border/60 shrink-0">
                      <div className="grid grid-cols-2 divide-x divide-border/60">
                        {[left, right].map((col, ci) => (
                          <div key={ci} className={ci === 1 ? "pl-3" : "pr-3"}>
                            {/* Column header */}
                            <div className="grid grid-cols-[1fr_44px_28px] items-center gap-1 px-1 py-1 border-b border-border/60">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Platform
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                                Clicks
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                                %
                              </span>
                            </div>
                            {/* Rows */}
                            <div className="divide-y divide-border/40">
                              {col.map((row, ri) => {
                                const pct = Math.round(
                                  (row.count / total) * 100,
                                );
                                return (
                                  <div
                                    key={row.name}
                                    className="grid grid-cols-[1fr_44px_28px] items-center px-1 gap-1 py-1.5"
                                  >
                                    <span className="min-w-0 truncate text-[11px] font-medium text-foreground">
                                      {row.name}
                                    </span>
                                    <span className="text-[11px] font-bold tabular-nums text-foreground text-right">
                                      {row.count.toLocaleString()}
                                    </span>
                                    <span className="text-[11px] tabular-nums text-muted-foreground text-right">
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
                  </CardContent>
                </Card>
              );
            })()}

          {/* Top Countries — world map */}
          {stats.clicksByCountry.length > 0 &&
            (() => {
              const total = stats.clicksByCountry.reduce(
                (s, r) => s + r.count,
                0,
              );
              return (
                <Card className="flex flex-col overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          Top Countries
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Click distribution by location
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums text-foreground">
                          {total.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          total clicks
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pt-0 px-3 pb-3">
                    <div className="-mt-5">
                      <WorldMap data={stats.clicksByCountry} />
                    </div>
                    {/* Top 6 — 2 col × 3 row table */}
                    <div className="mt-2 border-t border-border/60">
                      <div className="grid grid-cols-2 divide-x divide-border/60">
                        {[
                          stats.clicksByCountry.slice(0, 3),
                          stats.clicksByCountry.slice(3, 6),
                        ].map((half, col) => (
                          <div
                            key={col}
                            className={col === 1 ? "pl-3" : "pr-3"}
                          >
                            {/* Column header */}
                            <div className="grid grid-cols-[1fr_44px_28px] items-center gap-1 px-1 py-1 border-b border-border/60">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Country
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                                Clicks
                              </span>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                                %
                              </span>
                            </div>
                            {/* Rows */}
                            <div className="divide-y divide-border/40">
                              {half.map((row) => {
                                const pct = Math.round(
                                  (row.count / (total || 1)) * 100,
                                );
                                return (
                                  <div
                                    key={row.name}
                                    className="grid grid-cols-[1fr_44px_28px] items-center px-1 gap-1 py-1.5"
                                  >
                                    <span className="min-w-0 truncate text-[11px] font-medium text-foreground">
                                      {row.name}
                                    </span>
                                    <span className="text-[11px] font-bold tabular-nums text-foreground text-right">
                                      {row.count.toLocaleString()}
                                    </span>
                                    <span className="text-[11px] tabular-nums text-muted-foreground text-right">
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
                  </CardContent>
                </Card>
              );
            })()}
        </div>
      )}

      {/* ── Top Campaigns ── */}
      {stats.topCampaigns.length > 0 &&
        (() => {
          const RANK = [
            {
              color: "#0d9488",
              bar: "bg-primary",
              pill: "bg-primary/10 text-primary",
              text: "text-primary",
            },
            {
              color: "#8b5cf6",
              bar: "bg-violet-500",
              pill: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
              text: "text-violet-500",
            },
            {
              color: "#10b981",
              bar: "bg-emerald-500",
              pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
              text: "text-emerald-500",
            },
            {
              color: "#f59e0b",
              bar: "bg-amber-500",
              pill: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
              text: "text-amber-500",
            },
            {
              color: "#0ea5e9",
              bar: "bg-sky-500",
              pill: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
              text: "text-sky-500",
            },
            {
              color: "#94a3b8",
              bar: "bg-muted-foreground/40",
              pill: "bg-muted text-muted-foreground",
              text: "text-muted-foreground",
            },
          ];
          const maxClicks = stats.topCampaigns[0].totalClicks || 1;

          return (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Top Campaigns
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ranked by total clicks
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/dashboard/campaigns">
                      View all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.topCampaigns.map((campaign, i) => {
                    const rs = RANK[i] ?? RANK[5];
                    const barPct = Math.round(
                      (campaign.totalClicks / maxClicks) * 100,
                    );
                    const sharePct =
                      stats.totalClicks > 0
                        ? Math.round(
                            (campaign.totalClicks / stats.totalClicks) * 100,
                          )
                        : 0;

                    return (
                      <Link
                        key={campaign.id}
                        href={`/dashboard/campaigns/${campaign.id}`}
                      >
                        <div
                          className="group flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 transition-all hover:bg-muted/50 hover:shadow-sm cursor-pointer h-full"
                          style={{
                            borderLeftWidth: 6,
                            borderLeftColor: rs.color,
                          }}
                        >
                          {/* Rank + name + links pill */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={cn(
                                  "shrink-0 text-xs font-black",
                                  rs.text,
                                )}
                              >
                                #{i + 1}
                              </span>
                              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {campaign.name}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {campaign.linkCount} link
                              {campaign.linkCount !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Click count + traffic badge */}
                          <div className="flex items-end justify-between gap-2">
                            <div>
                              <p className="text-2xl font-black tabular-nums text-foreground leading-none">
                                {campaign.totalClicks.toLocaleString()}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                total clicks
                              </p>
                            </div>
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                                rs.pill,
                              )}
                            >
                              {sharePct}% traffic
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-700",
                                rs.bar,
                              )}
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })()}
    </div>
  );
}
