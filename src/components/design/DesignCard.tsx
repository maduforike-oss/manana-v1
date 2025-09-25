import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DesignCardData {
  id: string;
  title: string;
  thumbnail_url?: string;
  garment_type: string;
  created_at: string;
  updated_at: string;
}

interface DesignCardProps {
  design: DesignCardData;
  onEdit?: (design: DesignCardData) => void;
  onDelete?: (design: DesignCardData) => void;
  onView?: (design: DesignCardData) => void;
  className?: string;
}

export const DesignCard = ({
  design, 
  onEdit, 
  onDelete, 
  onView,
  className 
}: DesignCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <Card className={cn(
      "group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 glass-effect border-border/20 rounded-3xl overflow-hidden",
      className
    )}>
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="aspect-[4/3] bg-muted rounded-2xl m-4 overflow-hidden relative">
          {design.thumbnail_url && !imageError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted animate-pulse rounded-2xl" />
              )}
              <img
                src={design.thumbnail_url}
                alt={design.title}
                className={cn(
                  "w-full h-full object-cover transition-all duration-300 group-hover:scale-110 rounded-2xl",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted rounded-2xl">
              <div className="text-center text-muted-foreground">
                <Eye className="mx-auto mb-2 h-12 w-12 opacity-40" />
                <p className="text-sm font-medium">No Preview</p>
              </div>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          
          {/* Overlay actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            {onView && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(design);
                }}
                className="bg-white/95 backdrop-blur-sm text-black hover:bg-white shadow-lg rounded-full h-10 w-10 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(design);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-full px-6"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          
          {/* Garment type badge */}
          <div className="absolute top-3 right-3">
            <div className="px-3 py-1 bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium rounded-full border border-border/20">
              {design.garment_type.replace('-', ' ')}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          <h3 className="font-bold text-lg line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {design.title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated {formatDate(design.updated_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-6 px-6">
        <div className="flex gap-3 w-full">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(design);
              }}
              className="flex-1 rounded-full border-border/40 hover:border-primary/40 hover:bg-primary/5"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(design);
              }}
              className="text-destructive hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 rounded-full border-border/40"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};