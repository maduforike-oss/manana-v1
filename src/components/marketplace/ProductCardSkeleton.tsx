import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export const ProductCardSkeleton = ({ viewMode = 'grid' }: ProductCardSkeletonProps) => {
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden">
        <div className="flex h-28 sm:h-32 md:h-36">
          <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0" />
          <div className="flex-1 p-3 sm:p-4 space-y-2">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
          <div className="flex flex-col gap-2 p-2">
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8" />
            <Skeleton className="h-7 w-7 sm:h-8 sm:w-8" />
            <Skeleton className="h-7 w-12 sm:h-8 sm:w-16" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-[3/4] sm:aspect-[4/5]">
        <Skeleton className="w-full h-full loading-shimmer" />
      </div>
      <div className="p-3 sm:p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-12" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-8 sm:h-9 w-full" />
      </div>
    </Card>
  );
};