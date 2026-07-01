"use client";

import { BarChart3, ListOrdered } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkAnalyticsSection } from "@/features/links/components/link-analytics-section";
import { RecentClicksTable } from "@/features/links/components/recent-clicks-table";

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

type Click = {
  id: string;
  device: string;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  country: string | null;
  createdAt: Date;
};

type Props = {
  analytics: Record<number, Analytics>;
  clicks: Click[];
};

export function LinkDetailTabs({ analytics, clicks }: Props) {
  return (
    <Tabs defaultValue="overview" className="gap-4">
      <TabsList className="w-fit">
        <TabsTrigger value="overview" className="gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="clicks" className="gap-1.5">
          <ListOrdered className="h-3.5 w-3.5" />
          Recent clicks
          <span className="ml-1 rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
            {clicks.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <LinkAnalyticsSection analytics={analytics} />
      </TabsContent>

      <TabsContent value="clicks">
        <div className="rounded-xl border border-border bg-card p-4">
          <RecentClicksTable clicks={clicks} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
