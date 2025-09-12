import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProductCardErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function ProductCardError({
  title = "Failed to load",
  message = "Something went wrong",
  onRetry,
  viewMode = 'grid',
  className
}: ProductCardErrorProps) {
  if (viewMode === 'list') {
    return (
      <Card className={cn("overflow-hidden border-destructive/20 bg-destructive/5", className)}>
        <CardContent className="p-0">
          <div className="flex h-28 sm:h-32 md:h-36 items-center justify-center">
            <div className="text-center space-y-2 p-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <div>
                <h3 className="font-medium text-destructive">{title}</h3>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
              {onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden border-destructive/20 bg-destructive/5", className)}>
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] sm:aspect-[4/5] flex items-center justify-center">
          <div className="text-center space-y-2 p-4">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
            <div>
              <h3 className="font-medium text-destructive">{title}</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}