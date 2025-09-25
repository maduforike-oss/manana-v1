import { DesignCard, DesignCardData } from './DesignCard';

export type { DesignCardData };
import { cn } from '@/lib/utils';

interface DesignGridProps {
  designs: DesignCardData[];
  onEdit?: (design: DesignCardData) => void;
  onDelete?: (design: DesignCardData) => void;
  onView?: (design: DesignCardData) => void;
  className?: string;
  emptyState?: React.ReactNode;
  loading?: boolean;
}

export const DesignGrid = ({
  designs,
  onEdit,
  onDelete,
  onView,
  className,
  emptyState,
  loading = false
}: DesignGridProps) => {
  if (loading) {
    return (
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-t-lg" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {emptyState || (
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
            <p className="text-muted-foreground">
              Start creating your first design to see it here.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {designs.map((design) => (
        <DesignCard
          key={design.id}
          design={design}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
};