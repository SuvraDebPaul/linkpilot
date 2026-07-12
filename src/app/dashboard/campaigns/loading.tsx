import { HeaderSkeleton, TileCardSkeleton } from "@/components/shared/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
