import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Palette, X } from 'lucide-react';
import { EnhancedColorSelector } from './EnhancedColorSelector';
import { cn } from '@/lib/utils';

interface MobileColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', 
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#8B4513', '#FFA500', '#800080', '#FFC0CB',
  '#A52A2A', '#808080', '#90EE90', '#FFB6C1'
];

export const MobileColorPicker: React.FC<MobileColorPickerProps> = ({
  currentColor,
  onColorChange,
  isOpen,
  onClose
}) => {
  const [showFullPicker, setShowFullPicker] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <Card className="w-full bg-card rounded-t-lg rounded-b-none max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium">
                {showFullPicker ? 'Color Picker' : 'Quick Colors'}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 overflow-y-auto">
          {!showFullPicker ? (
            <div className="space-y-4">
              {/* Current color display */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: currentColor }}
                />
                <div>
                  <p className="text-sm font-medium">Current Color</p>
                  <p className="text-xs text-muted-foreground">{currentColor}</p>
                </div>
              </div>

              {/* Quick color grid */}
              <div className="grid grid-cols-4 gap-3">
                {QUICK_COLORS.map(color => (
                  <button
                    key={color}
                    className={cn(
                      "w-full aspect-square rounded-lg border-2 shadow-sm transition-all",
                      currentColor === color 
                        ? "border-primary scale-95 shadow-lg" 
                        : "border-white/20 hover:scale-105"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onColorChange(color);
                      onClose();
                    }}
                  />
                ))}
              </div>

              {/* More colors button */}
              <Button
                variant="outline"
                onClick={() => setShowFullPicker(true)}
                className="w-full"
              >
                <Palette className="w-4 h-4 mr-2" />
                More Colors
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setShowFullPicker(false)}
                className="w-full mb-2"
              >
                ← Back to Quick Colors
              </Button>
              
              <EnhancedColorSelector
                mode="brush"
                currentColor={currentColor}
                onColorChange={onColorChange}
                showHex={true}
              />
              
              <Button
                onClick={onClose}
                className="w-full"
              >
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};