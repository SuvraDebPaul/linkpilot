import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { HeaderSkeleton, ListCardSkeleton } from "@/components/shared/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />

      {/* Lifetime performance hero */}
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="space-y-2.5 border-t border-border pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-6 w-14" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Browsers / OS / Countries */}
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-32 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top referrers + Top links */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton rows={6} />
        <ListCardSkeleton rows={6} />
      </div>
    </div>
  );
}
