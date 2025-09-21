import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Palette, Plus, History } from 'lucide-react';
import { cn } from '@/lib/utils';

// T-Shirt color options with hex values
export const TSHIRT_COLORS = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'navy', name: 'Navy', hex: '#1A237E' },
  { id: 'gray', name: 'Heather Gray', hex: '#B8B8B8' },
  { id: 'red', name: 'Red', hex: '#DC2626' },
  { id: 'blue', name: 'Blue', hex: '#2563EB' },
  { id: 'green', name: 'Forest Green', hex: '#16A34A' },
  { id: 'purple', name: 'Purple', hex: '#7C3AED' },
];

// Predefined brush colors
export const BRUSH_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A',
  '#808080', '#C0C0C0', '#800000', '#008000', '#000080', '#808000'
];

interface ColorSelectorProps {
  mode: 'garment' | 'brush';
  currentColor: string;
  onColorChange: (color: string) => void;
  colorHistory?: string[];
  onAddToHistory?: (color: string) => void;
  showHex?: boolean;
}

export const EnhancedColorSelector: React.FC<ColorSelectorProps> = ({
  mode,
  currentColor,
  onColorChange,
  colorHistory = [],
  onAddToHistory,
  showHex = true
}) => {
  const [customColor, setCustomColor] = useState(currentColor);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const colors = mode === 'garment' ? TSHIRT_COLORS : BRUSH_COLORS;

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onAddToHistory?.(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (value: string) => {
    setCustomColor(value);
    if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
      onColorChange(value);
      onAddToHistory?.(value);
    }
  };

  return (
    <div className="space-y-3">
      {mode === 'garment' && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-muted-foreground">Garment Color:</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {colors.map((color) => (
              <Button
                key={typeof color === 'string' ? color : color.id}
                variant="outline"
                size="sm"
                className={cn(
                  "relative w-10 h-10 p-0 border-2",
                  currentColor === (typeof color === 'string' ? color : color.id)
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-muted-foreground'
                )}
                onClick={() => handleColorSelect(typeof color === 'string' ? color : color.id)}
                style={{ 
                  backgroundColor: typeof color === 'string' ? color : color.hex 
                }}
                title={typeof color === 'string' ? color : color.name}
              >
                {currentColor === (typeof color === 'string' ? color : color.id) && (
                  <Check 
                    size={16} 
                    className={
                      (typeof color === 'string' ? color : color.hex) === '#FFFFFF' 
                        ? 'text-black' 
                        : 'text-white'
                    } 
                  />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {mode === 'brush' && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-muted-foreground">Brush Color:</span>
            <div 
              className="w-6 h-6 rounded-full border-2 border-border"
              style={{ backgroundColor: currentColor }}
            />
            {showHex && (
              <span className="text-xs font-mono text-muted-foreground">
                {currentColor.toUpperCase()}
              </span>
            )}
          </div>

          {/* Predefined colors */}
          <div className="flex gap-1 flex-wrap mb-3">
            {colors.map((color) => (
              <Button
                key={color}
                variant="outline"
                size="sm"
                className={cn(
                  "relative w-8 h-8 p-0 border-2",
                  currentColor === color
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-muted-foreground'
                )}
                onClick={() => handleColorSelect(color)}
                style={{ backgroundColor: color }}
                title={color}
              >
                {currentColor === color && (
                  <Check 
                    size={12} 
                    className={color === '#FFFFFF' ? 'text-black' : 'text-white'} 
                  />
                )}
              </Button>
            ))}
          </div>

          {/* Custom color picker */}
          <div className="flex gap-2">
            <Input
              type="color"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-12 h-8 p-1 border rounded cursor-pointer"
            />
            <Input
              type="text"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 h-8 text-xs font-mono"
              maxLength={7}
            />
            <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Palette className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Quick Colors</div>
                  <div className="grid grid-cols-6 gap-1">
                    {BRUSH_COLORS.map((color) => (
                      <Button
                        key={color}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 rounded-sm"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          handleColorSelect(color);
                          setIsPickerOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Color history */}
          {colorHistory.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Recent Colors</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {colorHistory.slice(-8).map((color, index) => (
                  <Button
                    key={`${color}-${index}`}
                    variant="outline"
                    size="sm"
                    className="w-6 h-6 p-0 border rounded-sm"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};