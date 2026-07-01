import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { authOptions } from "@/lib/auth";
import { getUserPlan } from "@/lib/subscription";
import { getAnalytics } from "@/server/queries/analytics.queries";
import { ensureWorkspace } from "@/server/queries/workspace.queries";
import { getDemoAnalytics } from "@/lib/demo-stats";

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO === "true";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ClicksLineChart } from "@/components/charts/clicks-line-chart";
import { DeviceBarChart } from "@/components/charts/device-bar-chart";
import { ReferrerTable } from "@/components/charts/referrer-table";
import { PeriodTabs } from "@/features/analytics/components/period-tabs";
import { LockedCard } from "@/features/analytics/components/locked-card";

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

  if (IS_DEMO) {
    plan = "pro";
    const days = ALL_PERIODS.find((p) => p.label === period)?.days ?? 30;
    data = getDemoAnalytics(days);
  } else {
    const [fetchedPlan, workspaceId] = await Promise.all([
      getUserPlan(session.user.id),
      ensureWorkspace(session.user.id),
    ]);
    plan = fetchedPlan;
    const days = (plan === "starter" || plan === "pro")
      ? (ALL_PERIODS.find((p) => p.label === period)?.days ?? 30)
      : 7;
    data = await getAnalytics(workspaceId, days, plan);
  }

  const isStarter = plan === "starter" || plan === "pro";
  const isPro     = plan === "pro";

  const allowedPeriods = isPro ? ALL_PERIODS : isStarter ? ALL_PERIODS.slice(0, 2) : [];
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
                <Link href="/dashboard/settings/billing" className="underline hover:text-amber-700">
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

      {/* Summary stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total clicks</p>
            <p className="mt-1 text-3xl font-black text-foreground">{data.totalClicks.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">in the last {days} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Unique visitors</p>
            <p className="mt-1 text-3xl font-black text-foreground">{data.uniqueClicks.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">distinct IP addresses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Peak day</p>
            <p className="mt-1 text-3xl font-black text-foreground">
              {peakDay.count > 0 ? peakDay.count.toLocaleString() : "—"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {peakDay.count > 0
                ? new Date(peakDay.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : "no clicks yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clicks over time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Clicks over time</CardTitle>
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

      {/* Device + Browser */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceBarChart data={data.clicksByDevice} />
          </CardContent>
        </Card>

        {isStarter ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Browsers</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferrerTable
                data={data.clicksByBrowser.map((r) => ({ referrer: r.browser, count: r.count }))}
                total={data.totalClicks}
              />
            </CardContent>
          </Card>
        ) : (
          <LockedCard title="Browsers" requiredPlan="Starter" />
        )}
      </div>

      {/* Referrers */}
      {isStarter ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferrerTable data={data.topReferrers} total={data.totalClicks} />
          </CardContent>
        </Card>
      ) : (
        <LockedCard title="Top referrers" requiredPlan="Starter" />
      )}

      {/* Countries + Top links */}
      <div className="grid gap-6 lg:grid-cols-2">
        {isPro ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top countries</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topCountries.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No geo data yet.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {data.topCountries.map((row) => {
                    const pct =
                      data.totalClicks > 0
                        ? Math.round((row.count / data.totalClicks) * 100)
                        : 0;
                    return (
                      <div
                        key={row.country}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <span className="text-foreground">{row.country}</span>
                        <div className="flex items-center gap-3">
                          <div className="hidden w-24 sm:block">
                            <Progress value={pct} className="h-1.5" />
                          </div>
                          <span className="w-16 text-right text-xs text-muted-foreground">
                            {row.count.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <LockedCard title="Top countries" requiredPlan="Pro" />
        )}

        {isStarter ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top links</CardTitle>
            </CardHeader>
            <CardContent>
              {data.topLinks.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No click data yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.topLinks.map((link, i) => {
                    const max = data.topLinks[0].count || 1;
                    const pct = Math.round((link.count / max) * 100);
                    return (
                      <div key={link.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <Link
                            href={`/dashboard/links/${link.id}`}
                            className="truncate max-w-[60%] font-medium text-foreground hover:underline"
                          >
                            {i + 1}. {link.label}
                          </Link>
                          <span className="text-muted-foreground">
                            {link.count.toLocaleString()} clicks
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <LockedCard title="Top links" requiredPlan="Starter" />
        )}
      </div>
    </div>
  );
}
