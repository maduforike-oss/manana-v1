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
      "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
          {design.thumbnail_url && !imageError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              <img
                src={design.thumbnail_url}
                alt={design.title}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-200 group-hover:scale-105",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <div className="text-center text-muted-foreground">
                <Eye className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm font-medium">No Preview</p>
              </div>
            </div>
          )}
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            {onView && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(design);
                }}
                className="bg-white/90 text-black hover:bg-white"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(design);
                }}
                className="bg-white/90 text-black hover:bg-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-base line-clamp-2 mb-2">
            {design.title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span className="capitalize">{design.garment_type}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(design.updated_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-4">
        <div className="flex gap-2 w-full">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(design);
              }}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
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
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};