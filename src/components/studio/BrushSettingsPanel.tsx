import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStudioStore } from '@/lib/studio/store';
import { BRUSH_PRESETS } from '@/lib/studio/brushEngine';
import { 
  PenTool, 
  Brush, 
  Droplets, 
  Eraser,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BRUSH_ICONS = {
  pencil: PenTool,
  marker: Brush,
  spray: Droplets,
  eraser: Eraser
};

const COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

export const BrushSettingsPanel: React.FC<{ className?: string }> = ({ className }) => {
  const {
    activeColor,
    brushSize,
    brushOpacity,
    brushHardness,
    brushType,
    isEraser,
    setActiveColor,
    setBrushSize,
    setBrushOpacity,
    setBrushHardness,
    setBrushType,
    toggleEraser
  } = useStudioStore();

  return (
    <div className={cn("p-4 bg-background border border-border rounded-lg space-y-4", className)}>
      <div className="text-sm font-medium text-foreground">Brush Settings</div>
      
      {/* Brush Type Selection */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Brush Type</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(BRUSH_PRESETS).map(([type, preset]) => {
            const Icon = BRUSH_ICONS[type as keyof typeof BRUSH_ICONS] || PenTool;
            const isActive = brushType === type && !isEraser;
            
            return (
              <Button
                key={type}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  setBrushType(type);
                  if (isEraser) toggleEraser();
                }}
              >
                <Icon className="h-3 w-3" />
                <span className="capitalize text-xs">{type}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Eraser Toggle */}
        <Button
          variant={isEraser ? 'default' : 'outline'}
          size="sm"
          className="w-full justify-start gap-2"
          onClick={toggleEraser}
        >
          <Eraser className="h-3 w-3" />
          <span className="text-xs">Eraser</span>
        </Button>
      </div>

      <Separator />

      {/* Size Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">Size</div>
          <Badge variant="secondary" className="text-xs">{brushSize}px</Badge>
        </div>
        <Slider
          value={[brushSize]}
          onValueChange={([value]) => setBrushSize(value)}
          min={1}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Opacity Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">Opacity</div>
          <Badge variant="secondary" className="text-xs">{Math.round(brushOpacity * 100)}%</Badge>
        </div>
        <Slider
          value={[brushOpacity * 100]}
          onValueChange={([value]) => setBrushOpacity(value / 100)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Hardness Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">Hardness</div>
          <Badge variant="secondary" className="text-xs">{Math.round(brushHardness * 100)}%</Badge>
        </div>
        <Slider
          value={[brushHardness * 100]}
          onValueChange={([value]) => setBrushHardness(value / 100)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {!isEraser && (
        <>
          <Separator />
          
          {/* Color Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">Color</div>
              <div 
                className="w-6 h-6 rounded border-2 border-border"
                style={{ backgroundColor: activeColor }}
              />
            </div>
            
            {/* Color Presets */}
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-8 h-8 rounded border-2 transition-all",
                    activeColor === color 
                      ? "border-primary scale-110" 
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="flex gap-2">
              <input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background"
                placeholder="#000000"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};