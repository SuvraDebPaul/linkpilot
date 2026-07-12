import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton, FormCardSkeleton } from "@/components/shared/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton withAction={false} />
      <div className="grid gap-6 lg:grid-cols-2">
        <FormCardSkeleton fields={2} />
        <FormCardSkeleton fields={3} />
      </div>
      <Card>
        <CardContent className="space-y-3 p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
