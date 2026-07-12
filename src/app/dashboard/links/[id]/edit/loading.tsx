import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:items-start">
        {/* Sidebar card */}
        <Card className="lg:sticky lg:top-6">
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-3 w-24" />

            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-3.5 w-full" />
            </div>

            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>

            <div className="flex gap-2 border-t border-border pt-4">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs + form cards */}
        <div className="space-y-4">
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-md" />
            ))}
          </div>

          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-4 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
