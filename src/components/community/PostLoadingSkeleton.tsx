import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PostLoadingSkeleton: React.FC = () => {
  return (
    <Card className="border border-border/10 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm mb-4">
      {/* Post Header Skeleton */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>

      {/* Engagement Stats Skeleton */}
      <div className="px-4 py-2 border-t border-border/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="px-4 py-3 border-t border-border/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </Card>
  );
};

interface PostSkeletonGridProps {
  count?: number;
}

export const PostSkeletonGrid: React.FC<PostSkeletonGridProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }, (_, i) => (
        <PostLoadingSkeleton key={i} />
      ))}
    </div>
  );
};