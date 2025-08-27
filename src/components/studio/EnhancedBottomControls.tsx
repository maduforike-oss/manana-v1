import React from 'react';
import { Button } from '../ui/button';
import { 
  Grid3X3, 
  Ruler, 
  Eye, 
  EyeOff,
  Move3D,
  Crosshair,
  Maximize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Box
} from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';
import { useViewportManager } from './EnhancedViewportManager';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Separator } from '../ui/separator';

export const EnhancedBottomControls = () => {
  const { zoom, setZoom, setPanOffset, doc, snapEnabled } = useStudioStore();
  const {
    showBoundingBox,
    showGrid,
    showRulers,
    snapToGrid,
    toggleBoundingBox,
    toggleGrid,
    toggleRulers,
    toggleSnap,
    gridSize,
    setGridSize
  } = useViewportManager();

  // Enhanced zoom functions
  const zoomPresets = [0.25, 0.5, 1, 1.5, 2];
  const currentZoomIndex = zoomPresets.findIndex(preset => Math.abs(preset - zoom) < 0.01);

  const handleZoomPreset = (preset: number) => {
    setZoom(preset);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.1));
  };

  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    setZoom(0.8);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
          {/* View Controls Group */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>

            <div className="px-2 py-1 text-xs font-mono bg-muted rounded min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Grid & Guides Group */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleGrid}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Grid (G)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={snapToGrid && snapEnabled ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleSnap}
                  className="h-8 w-8 p-0"
                >
                  <Crosshair className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Snap to Grid (Shift+G)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showRulers ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleRulers}
                  className="h-8 w-8 p-0"
                >
                  <Ruler className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Rulers (R)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showBoundingBox ? "default" : "ghost"}
                  size="sm"
                  onClick={toggleBoundingBox}
                  className="h-8 w-8 p-0"
                >
                  <Box className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Bounding Box (B)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Camera Controls Group */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset View (0)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFitToScreen}
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fit to Screen (Ctrl+0)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Canvas Info & Quick Zoom */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {zoomPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleZoomPreset(preset)}
                  className={`px-2 py-1 rounded text-xs hover:bg-accent transition-colors ${
                    currentZoomIndex === zoomPresets.indexOf(preset) 
                      ? 'bg-accent text-foreground' 
                      : ''
                  }`}
                >
                  {Math.round(preset * 100)}%
                </button>
              ))}
            </div>
            <span className="font-mono">
              Canvas: {doc.canvas.width} × {doc.canvas.height}px
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};