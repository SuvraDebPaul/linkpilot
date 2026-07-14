"use client";

import dynamic from "next/dynamic";

// react-simple-maps pulls in d3-geo/topojson-client and a ~110kb topojson
// feature file — none of that is needed for the initial page render (the map
// sits below the fold on dashboard/analytics/link-detail pages), so it's
// split into its own chunk and fetched only once this component mounts,
// instead of shipping with the rest of the page's client bundle.
export const WorldMap = dynamic(
  () => import("@/components/charts/world-map").then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] w-full animate-pulse items-center justify-center rounded-lg bg-muted/40 text-xs text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);
