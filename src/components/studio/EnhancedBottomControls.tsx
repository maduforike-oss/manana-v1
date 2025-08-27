import React, { useState } from 'react';
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
  Box,
  Settings,
  Target,
  Square,
  Monitor,
  ChevronDown
} from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';
import { useViewportManager } from './EnhancedViewportManager';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '../ui/dropdown-menu';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

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
    setGridSize,
    gridType,
    setGridType,
    rulerUnits,
    setRulerUnits
  } = useViewportManager();

  // Enhanced zoom presets with common design sizes
  const zoomPresets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
  const currentZoomIndex = zoomPresets.findIndex(preset => Math.abs(preset - zoom) < 0.01);

  const handleZoomPreset = (preset: number) => {
    setZoom(preset);
    // Center the view when changing zoom
    const canvasElement = document.querySelector('.canvas-container');
    if (canvasElement) {
      const rect = canvasElement.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      setPanOffset({ 
        x: centerX - (doc.canvas.width * preset) / 2,
        y: centerY - (doc.canvas.height * preset) / 2
      });
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
  };

  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Smart fit controls
  const handleFitToArtboard = () => {
    const canvasElement = document.querySelector('.canvas-container');
    if (!canvasElement) return;
    
    const containerRect = canvasElement.getBoundingClientRect();
    const padding = 40; // 20px padding on each side
    
    const scaleX = (containerRect.width - padding) / doc.canvas.width;
    const scaleY = (containerRect.height - padding) / doc.canvas.height;
    const optimalZoom = Math.min(scaleX, scaleY, 2); // Cap at 200%
    
    setZoom(optimalZoom);
    setPanOffset({ 
      x: (containerRect.width - doc.canvas.width * optimalZoom) / 2,
      y: (containerRect.height - doc.canvas.height * optimalZoom) / 2
    });
  };

  const handleFitToSelection = () => {
    if (doc.selectedIds.length === 0) return;
    
    const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
    if (selectedNodes.length === 0) return;
    
    // Calculate bounding box of selection
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedNodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });
    
    const selectionWidth = maxX - minX;
    const selectionHeight = maxY - minY;
    
    const canvasElement = document.querySelector('.canvas-container');
    if (!canvasElement) return;
    
    const containerRect = canvasElement.getBoundingClientRect();
    const padding = 60;
    
    const scaleX = (containerRect.width - padding) / selectionWidth;
    const scaleY = (containerRect.height - padding) / selectionHeight;
    const optimalZoom = Math.min(scaleX, scaleY, 4);
    
    setZoom(optimalZoom);
    
    // Center the selection
    const selectionCenterX = minX + selectionWidth / 2;
    const selectionCenterY = minY + selectionHeight / 2;
    
    setPanOffset({ 
      x: containerRect.width / 2 - selectionCenterX * optimalZoom,
      y: containerRect.height / 2 - selectionCenterY * optimalZoom
    });
  };

  const handleFitToScreen = () => {
    const canvasElement = document.querySelector('.canvas-container');
    if (!canvasElement) return;
    
    const containerRect = canvasElement.getBoundingClientRect();
    const padding = 20;
    
    const scaleX = (containerRect.width - padding) / doc.canvas.width;
    const scaleY = (containerRect.height - padding) / doc.canvas.height;
    const optimalZoom = Math.min(scaleX, scaleY);
    
    setZoom(optimalZoom);
    setPanOffset({ 
      x: (containerRect.width - doc.canvas.width * optimalZoom) / 2,
      y: (containerRect.height - doc.canvas.height * optimalZoom) / 2
    });
  };

  const handleZoomToSelection = () => {
    if (doc.selectedIds.length > 0) {
      handleFitToSelection();
    } else {
      handleFitToArtboard();
    }
  };

  // Grid size options
  const gridSizes = [5, 10, 20, 25, 50, 100];
  const gridTypes = [
    { value: 'lines', label: 'Lines', icon: Grid3X3 },
    { value: 'dots', label: 'Dots', icon: Move3D }
  ];

  // Unit conversion for rulers
  const convertToUnits = (pixels: number) => {
    const dpi = 72; // Standard screen DPI for design
    if (rulerUnits === 'inches') {
      return (pixels / dpi).toFixed(2) + '"';
    } else if (rulerUnits === 'cm') {
      return (pixels / dpi * 2.54).toFixed(1) + 'cm';
    }
    return pixels + 'px';
  };

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
          {/* Zoom Controls Group */}
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
                <p>Zoom Out (-)</p>
              </TooltipContent>
            </Tooltip>

            {/* Zoom Presets Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 font-mono text-xs hover:bg-accent"
                >
                  {Math.round(zoom * 100)}%
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-32">
                <DropdownMenuLabel>Zoom Presets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {zoomPresets.map((preset) => (
                  <DropdownMenuItem
                    key={preset}
                    onClick={() => handleZoomPreset(preset)}
                    className={currentZoomIndex === zoomPresets.indexOf(preset) ? "bg-accent" : ""}
                  >
                    {Math.round(preset * 100)}%
                    {preset === 1 && <Badge variant="secondary" className="ml-auto text-xs">Actual</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
                <p>Zoom In (+)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Grid & Guides Group */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={showGrid ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuLabel>Grid Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleGrid}>
                  {showGrid ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Settings className="w-4 h-4 mr-2" />
                    Grid Type
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {gridTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.value}
                        onClick={() => setGridType(type.value as 'lines' | 'dots')}
                        className={gridType === type.value ? "bg-accent" : ""}
                      >
                        <type.icon className="w-4 h-4 mr-2" />
                        {type.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Grid Size
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {gridSizes.map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => setGridSize(size)}
                        className={gridSize === size ? "bg-accent" : ""}
                      >
                        {size}px
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={showRulers ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Ruler className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-40">
                <DropdownMenuLabel>Rulers</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleRulers}>
                  {showRulers ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showRulers ? 'Hide Rulers' : 'Show Rulers'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Settings className="w-4 h-4 mr-2" />
                    Units
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      onClick={() => setRulerUnits('pixels')}
                      className={rulerUnits === 'pixels' ? "bg-accent" : ""}
                    >
                      Pixels (px)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setRulerUnits('inches')}
                      className={rulerUnits === 'inches' ? "bg-accent" : ""}
                    >
                      Inches (")
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setRulerUnits('cm')}
                      className={rulerUnits === 'cm' ? "bg-accent" : ""}
                    >
                      Centimeters (cm)
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

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

          {/* Smart Fit Controls Group */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuLabel>Smart Fit</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleFitToScreen}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Fit to Screen
                  <Badge variant="outline" className="ml-auto text-xs">Ctrl+0</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFitToArtboard}>
                  <Square className="w-4 h-4 mr-2" />
                  Fit to Artboard
                  <Badge variant="outline" className="ml-auto text-xs">Ctrl+1</Badge>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleFitToSelection}
                  disabled={doc.selectedIds.length === 0}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Fit to Selection
                  <Badge variant="outline" className="ml-auto text-xs">Ctrl+2</Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleZoomToSelection}>
                  <Eye className="w-4 h-4 mr-2" />
                  {doc.selectedIds.length > 0 ? 'Zoom to Selection' : 'Zoom to All'}
                  <Badge variant="outline" className="ml-auto text-xs">Z</Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                <p>Reset View (Ctrl+0)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          {/* Canvas Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">
              Canvas: {convertToUnits(doc.canvas.width)} × {convertToUnits(doc.canvas.height)}
            </span>
            {doc.selectedIds.length > 0 && (
              <>
                <span>•</span>
                <span>{doc.selectedIds.length} selected</span>
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};