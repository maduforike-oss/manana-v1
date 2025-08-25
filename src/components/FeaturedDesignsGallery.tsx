import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Eye } from 'lucide-react';

interface FeaturedDesign {
  id: string;
  name: string;
  thumbnail: string;
  garmentType: string;
  likes: number;
  views: number;
}

interface FeaturedDesignsGalleryProps {
  designs: FeaturedDesign[];
  maxDisplay?: number;
}

export const FeaturedDesignsGallery = ({ designs, maxDisplay = 3 }: FeaturedDesignsGalleryProps) => {
  const displayDesigns = designs.slice(0, maxDisplay);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Featured Designs</h3>
        {designs.length > maxDisplay && (
          <span className="text-xs text-muted-foreground">+{designs.length - maxDisplay} more</span>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {displayDesigns.map((design) => (
          <Card key={design.id} className="relative group overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 relative">
              {/* Placeholder design thumbnail */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold text-muted-foreground/30">
                  {design.name.charAt(0)}
                </div>
              </div>
              
              {/* Garment type badge */}
              <Badge className="absolute top-1 left-1 text-xs bg-background/80 text-foreground">
                {design.garmentType}
              </Badge>
              
              {/* Overlay with stats */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <div className="flex items-center gap-1 text-white text-xs">
                  <Heart className="w-3 h-3" />
                  {design.likes}
                </div>
                <div className="flex items-center gap-1 text-white text-xs">
                  <Eye className="w-3 h-3" />
                  {design.views}
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <p className="text-xs font-medium truncate">{design.name}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};