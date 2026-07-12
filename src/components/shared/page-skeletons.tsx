import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function HeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      {withAction && <Skeleton className="h-9 w-32 rounded-md" />}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-10" />
        </div>
        <Skeleton className="mt-4 h-7 w-16" />
        <Skeleton className="mt-2 h-3 w-24" />
      </CardContent>
    </Card>
  );
}

export function ChartCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-40 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function ListCardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-3.5 w-8 shrink-0" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TableRowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="border-b border-border bg-muted/40 px-4 py-3">
        <Skeleton className="h-3.5 w-full max-w-xs" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-3.5 w-10 shrink-0" />
            <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Icon-chip + title + description card, matching Campaigns-style grids. */
export function TileCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <Skeleton className="h-4 w-4" />
        </div>
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-2 h-3.5 w-full" />
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

/** Big image/thumbnail block + two text lines — matches QR-asset style grids. */
export function ImageCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-4">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </CardContent>
    </Card>
  );
}

export function FormCardSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-9 w-24 rounded-md" />
      </CardContent>
    </Card>
  );
}
