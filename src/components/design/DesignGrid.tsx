import { Card } from '@/components/ui/card';
import { DesignCard, DesignCardData } from './DesignCard';
import { cn } from '@/lib/utils';

export type { DesignCardData };

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
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="glass-effect border-border/20 rounded-3xl overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted animate-pulse rounded-2xl m-4" />
            <div className="p-6 pt-2 space-y-3">
              <div className="h-5 bg-gradient-to-r from-muted to-muted/50 animate-pulse rounded-full" />
              <div className="h-4 bg-gradient-to-r from-muted/70 to-muted/30 animate-pulse rounded-full w-2/3" />
            </div>
            <div className="px-6 pb-6">
              <div className="h-8 bg-gradient-to-r from-muted/50 to-muted/20 animate-pulse rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="text-center py-20">
        {emptyState || (
          <Card className="glass-effect border-border/20 rounded-3xl p-16 max-w-md mx-auto">
            <div className="space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">No designs found</h3>
                <p className="text-muted-foreground">Create your first design to get started</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", className)}>
      {designs.map((design, index) => (
        <div 
          key={design.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <DesignCard
            design={design}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        </div>
      ))}
    </div>
  );
};