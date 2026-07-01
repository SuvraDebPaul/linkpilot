"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClicksLineChart } from "@/components/charts/clicks-line-chart";
import { LinkDevicesCard } from "@/features/links/components/link-devices-card";
import { BrowserAreaChart } from "@/components/charts/browser-area-chart";
import { WorldMap } from "@/components/charts/world-map";
import { LinkReferrersCard } from "@/features/links/components/link-referrers-card";
import { LinkUtmBarList } from "@/features/links/components/link-utm-bar-list";
import { LinkUtmCampaignsCard } from "@/features/links/components/link-utm-campaigns-card";
import { cn } from "@/lib/utils";

type Analytics = {
  clicksPerDay: { date: string; count: number }[];
  clicksByDevice: { device: string; count: number }[];
  clicksByBrowser: { browser: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  utmSources: { label: string; count: number }[];
  utmMediums: { label: string; count: number }[];
  utmCampaigns: { label: string; count: number }[];
};

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

type Props = {
  analytics: Record<number, Analytics>;
};

// Split a ranked list into two columns of up to 3 rows each, mirroring the
// Browsers / Top Countries card layout on the main dashboard.
function twoColumns<T>(items: T[]): [T[], T[]] {
  return [items.slice(0, 3), items.slice(3, 6)];
}

export function LinkAnalyticsSection({ analytics }: Props) {
  const [days, setDays] = useState(30);
  const data = analytics[days];
  if (!data) return null;

  const totalClicks = data.clicksPerDay.reduce((s, d) => s + d.count, 0);
  const totalReferrers = data.topReferrers.reduce((s, r) => s + r.count, 0);

  const browsers = data.clicksByBrowser
    .slice(0, 6)
    .map((b) => ({ name: b.browser.replace(" Browser", ""), count: b.count }));
  const totalBrowserClicks = browsers.reduce((s, b) => s + b.count, 0);
  const [browsersLeft, browsersRight] = twoColumns(browsers);

  const countries = data.topCountries
    .slice(0, 6)
    .map((c) => ({ name: c.country, count: c.count }));
  const totalCountryClicks = countries.reduce((s, c) => s + c.count, 0);
  const [countriesLeft, countriesRight] = twoColumns(countries);

  const totalUtmSources   = data.utmSources.reduce((s, u) => s + u.count, 0);
  const totalUtmMediums   = data.utmMediums.reduce((s, u) => s + u.count, 0);
  const totalUtmCampaigns = data.utmCampaigns.reduce((s, u) => s + u.count, 0);

  return (
    <div className="space-y-4">
      {/* Period tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Analytics</h2>
        <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={cn(
                "rounded-md px-3 py-1 font-medium transition-colors",
                days === p.days
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clicks over time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Clicks over time
            <span className="ml-2 text-lg font-bold text-foreground">
              {totalClicks.toLocaleString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClicksLineChart data={data.clicksPerDay} days={days} />
        </CardContent>
      </Card>

      {/* Devices + Browsers */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Devices
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Last {days} days
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 pt-2">
            <LinkDevicesCard data={data.clicksByDevice} />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Browsers
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Top browsers by clicks
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {totalBrowserClicks.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  total clicks
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3 pt-2">
            <div className="flex-1 min-h-0">
              <BrowserAreaChart data={browsers} total={totalBrowserClicks} />
            </div>
            <div className="border-t border-border/60 shrink-0">
              <div className="grid grid-cols-2 divide-x divide-border/60">
                {[browsersLeft, browsersRight].map((col, ci) => (
                  <div key={ci} className={ci === 1 ? "pl-3" : "pr-3"}>
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
                        const pct =
                          totalBrowserClicks > 0
                            ? Math.round((row.count / totalBrowserClicks) * 100)
                            : 0;
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
      </div>

      {/* Referrers + Countries */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Top Referrers
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Ranked by clicks
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {totalReferrers.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  total clicks
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <LinkReferrersCard data={data.topReferrers} />
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Top Countries
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Click distribution by location
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums text-foreground">
                  {totalCountryClicks.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  total clicks
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-0 px-3 pb-3">
            <div className="-mt-5">
              <WorldMap data={countries} />
            </div>
            <div className="mt-2 border-t border-border/60">
              <div className="grid grid-cols-2 divide-x divide-border/60">
                {[countriesLeft, countriesRight].map((col, ci) => (
                  <div key={ci} className={ci === 1 ? "pl-3" : "pr-3"}>
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
                    <div className="divide-y divide-border/40">
                      {col.map((row) => {
                        const pct =
                          totalCountryClicks > 0
                            ? Math.round((row.count / totalCountryClicks) * 100)
                            : 0;
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
      </div>

      {/* UTM breakdown — only show if there is any UTM data */}
      {(data.utmSources.length > 0 ||
        data.utmMediums.length > 0 ||
        data.utmCampaigns.length > 0) && (
        <>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              UTM Breakdown
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Sources</CardTitle>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">By utm_source</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold tabular-nums text-foreground">{totalUtmSources.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">total clicks</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <LinkUtmBarList data={data.utmSources} kind="source" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Mediums</CardTitle>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">By utm_medium</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold tabular-nums text-foreground">{totalUtmMediums.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">total clicks</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <LinkUtmBarList data={data.utmMediums} kind="medium" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">Campaigns</CardTitle>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">By utm_campaign</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold tabular-nums text-foreground">{totalUtmCampaigns.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">total clicks</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <LinkUtmCampaignsCard data={data.utmCampaigns} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
