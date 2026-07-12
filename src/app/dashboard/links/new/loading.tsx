import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function FieldGroup({ fields = 2 }: { fields?: number }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-32" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <FieldGroup fields={1} />
          <FieldGroup fields={3} />
          <Card>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-9 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="mx-auto h-40 w-40 rounded-lg" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-28" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
