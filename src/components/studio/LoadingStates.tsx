import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Loading Skeleton for Layers Panel
export const LayerSkeleton = () => (
  <div className="p-3 space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
        <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
      </div>
    ))}
  </div>
);

// Loading Skeleton for Canvas
export const CanvasSkeleton = () => (
  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-32 h-32 bg-muted rounded-lg animate-pulse" />
      <div className="w-24 h-4 bg-muted rounded animate-pulse" />
    </div>
  </div>
);

// Loading Skeleton for Tool Panel
export const ToolPanelSkeleton = () => (
  <div className="p-4 space-y-4">
    <div className="w-full h-6 bg-muted rounded animate-pulse" />
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-full h-10 bg-muted rounded animate-pulse" />
      ))}
    </div>
  </div>
);

// Loading Skeleton for Properties Panel
export const PropertiesSkeleton = () => (
  <div className="p-4 space-y-4">
    <div className="w-full h-6 bg-muted rounded animate-pulse" />
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="w-16 h-3 bg-muted rounded animate-pulse" />
          <div className="w-full h-8 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

// Centered Loading Spinner
export interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = ({ 
  className, 
  size = 'md', 
  text 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-primary",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

// Full Page Loading
export const FullPageLoading = ({ text = "Loading..." }: { text?: string }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Content Loading State
export const ContentLoading = ({ text = "Loading content..." }: { text?: string }) => (
  <div className="w-full h-64 flex items-center justify-center">
    <LoadingSpinner size="md" text={text} />
  </div>
);