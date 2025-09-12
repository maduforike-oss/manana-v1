import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNavigation({ items, className }: BreadcrumbNavigationProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)} aria-label="Breadcrumb">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 hover:bg-muted/50"
        onClick={() => window.history.pushState({}, '', '/')}
      >
        <Home className="h-3 w-3" />
        <span className="sr-only">Home</span>
      </Button>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
          {item.href || item.onClick ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 hover:bg-muted/50",
                item.isActive && "text-foreground font-medium"
              )}
              onClick={item.onClick || (() => window.history.pushState({}, '', item.href!))}
            >
              {item.label}
            </Button>
          ) : (
            <span className={cn(
              "px-2 py-1",
              item.isActive ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}