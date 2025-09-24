import React from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { Button } from '@/components/ui/button';
import { Grid, Ruler, Magnet } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const AdvancedGridSystem = () => {
  const { doc, zoom, panOffset, updateCanvas } = useStudioStore();
  const { canvas } = doc;

  const handleGridToggle = (enabled: boolean) => {
    updateCanvas({ showGrid: enabled });
  };

  const handleGridSizeChange = (size: number[]) => {
    updateCanvas({ gridSize: size[0] });
  };

  const handleRulersToggle = (enabled: boolean) => {
    updateCanvas({ showRulers: enabled });
  };

  const handleGuidesToggle = (enabled: boolean) => {
    updateCanvas({ showGuides: enabled });
  };

  const handleUnitChange = (unit: 'px' | 'mm') => {
    updateCanvas({ unit });
  };

  return (
    <div className="flex items-center gap-1">
      {/* Grid Controls */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={canvas.showGrid ? "default" : "outline"}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Grid className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="grid-toggle" className="text-sm font-medium">
                Show Grid
              </Label>
              <Switch
                id="grid-toggle"
                checked={canvas.showGrid}
                onCheckedChange={handleGridToggle}
              />
            </div>
            
            {canvas.showGrid && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Grid Size: {canvas.gridSize}{canvas.unit}
                  </Label>
                  <Slider
                    value={[canvas.gridSize]}
                    onValueChange={handleGridSizeChange}
                    min={5}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Unit</Label>
                  <Select value={canvas.unit} onValueChange={handleUnitChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">Pixels (px)</SelectItem>
                      <SelectItem value="mm">Millimeters (mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-toggle" className="text-sm font-medium">
                    Snap to Grid
                  </Label>
                  <Switch
                    id="snap-toggle"
                    checked={canvas.showGrid} // Using showGrid as snap for now
                    onCheckedChange={() => {}} // Will implement snap logic
                  />
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Rulers Toggle */}
      <Button
        variant={canvas.showRulers ? "default" : "outline"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleRulersToggle(!canvas.showRulers)}
      >
        <Ruler className="h-4 w-4" />
      </Button>

      {/* Smart Guides Toggle */}
      <Button
        variant={canvas.showGuides ? "default" : "outline"}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => handleGuidesToggle(!canvas.showGuides)}
      >
        <Magnet className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Enhanced Grid Component with subdivisions and magnetic snapping
interface EnhancedGridProps {
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  gridSize: number;
  unit: 'px' | 'mm';
  canvasWidth: number;
  canvasHeight: number;
}

export const EnhancedGrid = ({ 
  zoom, 
  panOffset, 
  showGrid, 
  gridSize, 
  unit,
  canvasWidth,
  canvasHeight 
}: EnhancedGridProps) => {
  if (!showGrid) return null;

  const adjustedGridSize = gridSize * zoom;
  const offsetX = panOffset.x % adjustedGridSize;
  const offsetY = panOffset.y % adjustedGridSize;

  // Calculate subdivisions (show minor grid lines at 1/4 intervals)
  const subGridSize = adjustedGridSize / 4;
  const subOffsetX = panOffset.x % subGridSize;
  const subOffsetY = panOffset.y % subGridSize;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Minor grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(hsl(var(--border) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${subGridSize}px ${subGridSize}px`,
          backgroundPosition: `${subOffsetX}px ${subOffsetY}px`,
          opacity: Math.min(0.3, zoom * 0.2)
        }}
      />
      
      {/* Major grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: `${adjustedGridSize}px ${adjustedGridSize}px`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          opacity: Math.min(0.6, zoom * 0.4)
        }}
      />
    </div>
  );
};

// Note: Rulers implementation removed to prevent conflicts with PrecisionRulers.
// All ruler functionality is now handled by PrecisionRulers component.