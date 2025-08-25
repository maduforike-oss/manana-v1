import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GarmentType, GarmentColor } from '@/lib/studio/garments';
import { GarmentColorPicker } from './GarmentColorPicker';
import { Palette, Shirt, Info } from 'lucide-react';

interface GarmentPreviewProps {
  garment: GarmentType;
  selectedColorId?: string;
  onColorChange?: (colorId: string) => void;
  onSelect?: () => void;
  className?: string;
}

export const GarmentPreview = ({
  garment,
  selectedColorId,
  onColorChange,
  onSelect,
  className,
}: GarmentPreviewProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const currentColor = garment.colors.find(c => c.id === selectedColorId) || garment.colors[0];

  return (
    <div className={cn("group relative", className)}>
      {/* Main Card */}
      <div 
        className={cn(
          "relative overflow-hidden rounded-xl border-2 transition-all duration-300 bg-card",
          "hover:shadow-lg hover:scale-[1.02] hover:border-primary/50",
          "cursor-pointer"
        )}
        onClick={onSelect}
      >
        {/* Image Container */}
        <div className="relative h-48 bg-gradient-to-br from-muted/30 to-muted/60 overflow-hidden">
          <img
            src={garment.images.front}
            alt={`${garment.name} in ${currentColor.name}`}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              !imageLoaded && "opacity-0",
              imageLoaded && "opacity-100 group-hover:scale-105"
            )}
            style={{
              filter: currentColor.hex !== '#FFFFFF' && currentColor.hex !== '#000000' 
                ? `sepia(1) saturate(2) hue-rotate(${getHueRotation(currentColor.hex)}deg) brightness(${getBrightness(currentColor.hex)})`
                : 'none'
            }}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Popular Badge */}
          {garment.popular && (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-lg">
              Popular
            </Badge>
          )}
          
          {/* Quick Actions */}
          <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 px-3 bg-white/90 hover:bg-white text-black shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {garment.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {garment.description}
              </p>
            </div>
          </div>

          {/* Category & Price */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {garment.category}
            </Badge>
            <span className="text-lg font-bold text-primary">
              ${garment.basePrice}
            </span>
          </div>

          {/* Color Picker */}
          {onColorChange && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <GarmentColorPicker
                colors={garment.colors}
                selectedColorId={selectedColorId}
                onColorSelect={onColorChange}
                size="sm"
              />
              <span className="text-xs text-muted-foreground">
                {garment.colors.length} colors
              </span>
            </div>
          )}

          {/* Specs Preview */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Shirt className="w-3 h-3" />
              {garment.specs.material.split(',')[0]}
            </span>
            <span>{garment.specs.weight}</span>
          </div>
        </div>
      </div>

      {/* Extended Details Overlay */}
      {showDetails && (
        <div 
          className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-xl border-2 border-primary p-4 z-10 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <h4 className="font-bold text-foreground">{garment.name} Details</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-foreground">Material:</span>
              <span className="text-muted-foreground ml-1">{garment.specs.material}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Weight:</span>
              <span className="text-muted-foreground ml-1">{garment.specs.weight}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Sizes:</span>
              <span className="text-muted-foreground ml-1">{garment.specs.sizes.join(', ')}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Print Methods:</span>
              <span className="text-muted-foreground ml-1">{garment.specs.printMethods.join(', ')}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Print Areas:</span>
              <span className="text-muted-foreground ml-1">{garment.printAreas.join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for color manipulation
function getHueRotation(hex: string): number {
  // Convert hex to HSL and return hue rotation needed
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 0;
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let hue = 0;
  if (diff !== 0) {
    switch (max) {
      case r:
        hue = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hue = ((b - r) / diff + 2) / 6;
        break;
      case b:
        hue = ((r - g) / diff + 4) / 6;
        break;
    }
  }
  
  return hue * 360;
}

function getBrightness(hex: string): number {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 1;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? 1 : 0.8;
}