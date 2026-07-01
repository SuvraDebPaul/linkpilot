"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClicksLineChart } from "@/components/charts/clicks-line-chart";
import { DeviceBarChart } from "@/components/charts/device-bar-chart";
import { ReferrerTable } from "@/components/charts/referrer-table";
import { cn } from "@/lib/utils";

type Analytics = {
  clicksPerDay:    { date: string; count: number }[];
  clicksByDevice:  { device: string; count: number }[];
  clicksByBrowser: { browser: string; count: number }[];
  topReferrers:    { referrer: string; count: number }[];
  topCountries:    { country: string; count: number }[];
  utmSources:      { label: string; count: number }[];
  utmMediums:      { label: string; count: number }[];
  utmCampaigns:    { label: string; count: number }[];
};

const PERIODS = [
  { label: "7d",  days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

type Props = {
  analytics: Record<number, Analytics>;
};

export function LinkAnalyticsSection({ analytics }: Props) {
  const [days, setDays] = useState(30);
  const data = analytics[days];
  if (!data) return null;

  const totalClicks = data.clicksPerDay.reduce((s, d) => s + d.count, 0);
  const totalReferrers = data.topReferrers.reduce((s, r) => s + r.count, 0);

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
            <span className="ml-2 text-lg font-bold text-foreground">{totalClicks.toLocaleString()}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClicksLineChart data={data.clicksPerDay} days={days} />
        </CardContent>
      </Card>

      {/* Device + Browser */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceBarChart data={data.clicksByDevice} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceBarChart
              data={data.clicksByBrowser.map((b) => ({ device: b.browser, count: b.count }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Referrers + Countries */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Top referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferrerTable data={data.topReferrers} total={totalReferrers} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Top countries</CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceBarChart
              data={data.topCountries.map((c) => ({ device: c.country, count: c.count }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* UTM breakdown — only show if there is any UTM data */}
      {(data.utmSources.length > 0 || data.utmMediums.length > 0 || data.utmCampaigns.length > 0) && (
        <>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">UTM Breakdown</h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceBarChart
                  data={data.utmSources.map((u) => ({ device: u.label, count: u.count }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Mediums</CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceBarChart
                  data={data.utmMediums.map((u) => ({ device: u.label, count: u.count }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <DeviceBarChart
                  data={data.utmCampaigns.map((u) => ({ device: u.label, count: u.count }))}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
