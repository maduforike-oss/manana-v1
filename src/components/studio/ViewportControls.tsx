import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useStudioStore } from '../../lib/studio/store';
import { 
  Grid3x3, Ruler, Eye, Settings, ZoomIn, ZoomOut, Move, RotateCcw,
  Crosshair, AlignCenter, Maximize, Minimize2
} from 'lucide-react';

export const ViewportControls = () => {
  const { 
    doc, 
    zoom, 
    setZoom, 
    snapEnabled, 
    toggleSnap, 
    updateCanvas,
    setPanOffset
  } = useStudioStore();
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const zoomLevels = [25, 50, 75, 100, 150, 200, 300, 400, 500];
  
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(0.1, Math.min(10, newZoom / 100)));
  };
  
  const handleFitToScreen = () => {
    // Reset zoom and center canvas
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };
  
  const handleGridSizeChange = (newSize: number) => {
    updateCanvas({ gridSize: newSize });
  };
  
  const handleUnitChange = (newUnit: 'px' | 'mm') => {
    updateCanvas({ unit: newUnit });
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-sm">
        
        {/* Grid Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={doc.canvas.showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => updateCanvas({ showGrid: !doc.canvas.showGrid })}
                className="h-8 px-2"
              >
                <Grid3x3 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid (G)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={doc.canvas.showRulers ? "default" : "outline"}
                size="sm"
                onClick={() => updateCanvas({ showRulers: !doc.canvas.showRulers })}
                className="h-8 px-2"
              >
                <Ruler className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Rulers (R)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={snapEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleSnap}
                className="h-8 px-2"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Snap to Grid (Shift+G)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoomChange(zoom * 100 * 0.8)}
                className="h-8 px-2"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out (-)</TooltipContent>
          </Tooltip>

          <Select 
            value={`${Math.round(zoom * 100)}`} 
            onValueChange={(value) => {
              if (value === 'fit') {
                handleFitToScreen();
              } else {
                handleZoomChange(parseInt(value));
              }
            }}
          >
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit</SelectItem>
              {zoomLevels.map(level => (
                <SelectItem key={level} value={`${level}`}>
                  {level}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleZoomChange(zoom * 100 * 1.25)}
                className="h-8 px-2"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In (+)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFitToScreen}
                className="h-8 px-2"
              >
                <Maximize className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to Screen (0)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View Options */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={doc.canvas.showGuides ? "default" : "outline"}
                size="sm"
                onClick={() => updateCanvas({ showGuides: !doc.canvas.showGuides })}
                className="h-8 px-2"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Guides (;)</TooltipContent>
          </Tooltip>

          <Popover>
            <PopoverTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Settings</TooltipContent>
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Viewport Settings</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Grid</Label>
                    <Switch 
                      checked={doc.canvas.showGrid}
                      onCheckedChange={(checked) => updateCanvas({ showGrid: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Rulers</Label>
                    <Switch 
                      checked={doc.canvas.showRulers}
                      onCheckedChange={(checked) => updateCanvas({ showRulers: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Guides</Label>
                    <Switch 
                      checked={doc.canvas.showGuides}
                      onCheckedChange={(checked) => updateCanvas({ showGuides: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Snap to Grid</Label>
                    <Switch 
                      checked={snapEnabled}
                      onCheckedChange={toggleSnap}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Grid Size</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[doc.canvas.gridSize]}
                        onValueChange={([value]) => handleGridSizeChange(value)}
                        min={5}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={doc.canvas.gridSize}
                        onChange={(e) => handleGridSizeChange(parseInt(e.target.value) || 20)}
                        className="w-16 h-8 text-xs"
                        min={5}
                        max={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Units</Label>
                    <Select value={doc.canvas.unit} onValueChange={handleUnitChange}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">Pixels (px)</SelectItem>
                        <SelectItem value="mm">Millimeters (mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">DPI</Label>
                    <Select 
                      value={`${doc.canvas.dpi}`} 
                      onValueChange={(value) => updateCanvas({ dpi: parseInt(value) as 150 | 300 })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="150">150 DPI</SelectItem>
                        <SelectItem value="300">300 DPI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
};