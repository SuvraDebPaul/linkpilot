import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  HeaderSkeleton,
  StatCardSkeleton,
  ChartCardSkeleton,
  ListCardSkeleton,
  TileCardSkeleton,
} from "@/components/shared/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Click activity + Devices */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCardSkeleton className="lg:col-span-2" />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent links + Top performers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton rows={5} />
        <ListCardSkeleton rows={5} />
      </div>

      {/* Browsers / OS / Countries */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>

      {/* Top campaigns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
