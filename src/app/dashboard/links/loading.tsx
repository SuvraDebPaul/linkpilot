import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton } from "@/components/shared/page-skeletons";

const STATUS_LABELS = ["All", "Active", "Inactive", "Expired", "Favorites"];

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />

      <div className="space-y-3">
        {/* Status pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_LABELS.map((label) => (
            <Skeleton key={label} className="h-7 w-20 rounded-md" />
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <div className="h-4 w-px shrink-0 bg-border" />
          <Skeleton className="h-9 w-24 shrink-0 rounded-md" />
          <Skeleton className="h-9 w-24 shrink-0 rounded-md" />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-3 w-10" />
                </th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">
                  <Skeleton className="h-3 w-10" />
                </th>
                <th className="px-4 py-3 text-left">
                  <Skeleton className="h-3 w-12" />
                </th>
                <th className="px-4 py-3 text-right">
                  <Skeleton className="ml-auto h-3 w-14" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <Skeleton className="h-3.5 w-10" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="ml-auto h-6 w-16" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
