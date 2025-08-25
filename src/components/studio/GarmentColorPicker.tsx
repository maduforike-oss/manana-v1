import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { GarmentColor } from '@/lib/studio/garments';

interface GarmentColorPickerProps {
  colors: GarmentColor[];
  selectedColorId?: string;
  onColorSelect: (colorId: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showNames?: boolean;
}

export const GarmentColorPicker = ({
  colors,
  selectedColorId,
  onColorSelect,
  size = 'md',
  showNames = false,
}: GarmentColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedColor = colors.find(c => c.id === selectedColorId) || colors[0];
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const popularColors = colors.filter(c => c.popular);
  const otherColors = colors.filter(c => !c.popular);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-auto p-2 gap-2 hover:border-primary/50 transition-colors"
        >
          <div
            className={cn(
              sizeClasses[size],
              "rounded-full border-2 border-white shadow-sm",
              selectedColor?.hex === '#FFFFFF' && "border-muted"
            )}
            style={{ backgroundColor: selectedColor?.hex }}
          />
          {showNames && (
            <span className="text-sm font-medium">{selectedColor?.name}</span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* Popular Colors */}
          {popularColors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">Popular Colors</h4>
              <div className="grid grid-cols-6 gap-2">
                {popularColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      onColorSelect(color.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "relative group w-10 h-10 rounded-lg border-2 hover:scale-110 transition-all duration-200",
                      selectedColorId === color.id 
                        ? "border-primary shadow-md ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50",
                      color.hex === '#FFFFFF' && selectedColorId !== color.id && "border-muted"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColorId === color.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                    )}
                    {color.fabric && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-1 -right-1 scale-75 text-xs"
                      >
                        H
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Other Colors */}
          {otherColors.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-foreground">
                {popularColors.length > 0 ? 'More Colors' : 'Available Colors'}
              </h4>
              <div className="grid grid-cols-6 gap-2">
                {otherColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      onColorSelect(color.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "relative group w-10 h-10 rounded-lg border-2 hover:scale-110 transition-all duration-200",
                      selectedColorId === color.id 
                        ? "border-primary shadow-md ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50",
                      color.hex === '#FFFFFF' && selectedColorId !== color.id && "border-muted"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColorId === color.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                    )}
                    {color.fabric && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-1 -right-1 scale-75 text-xs"
                      >
                        H
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Info */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: selectedColor?.hex }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{selectedColor?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedColor?.hex}</p>
                {selectedColor?.fabric && (
                  <p className="text-xs text-muted-foreground">Heather fabric</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};