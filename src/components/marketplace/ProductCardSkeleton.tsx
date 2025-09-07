import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </Card>
  );
};