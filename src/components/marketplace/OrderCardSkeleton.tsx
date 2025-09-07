import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const OrderCardSkeleton = () => {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right space-y-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );
};