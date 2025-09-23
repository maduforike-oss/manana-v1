import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Grid, 
  Ruler, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Settings,
  Eye,
  EyeOff,
  MousePointer,
  PaintBucket,
  Type,
  Square,
  Circle,
  Triangle
} from 'lucide-react';
import { useStudioStore } from '@/lib/studio/store';
import { useViewportState } from '@/hooks/useViewportState';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export interface ProfessionalToolbarProps {
  onSettingsClick?: () => void;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
}

export const ProfessionalToolbar = ({ 
  onSettingsClick, 
  onFullscreenToggle, 
  isFullscreen = false 
}: ProfessionalToolbarProps) => {
  const { 
    activeTool, 
    setActiveTool, 
    zoom, 
    setZoom, 
    setPanOffset 
  } = useStudioStore();
  
  const {
    showGrid,
    showRulers,
    showBoundingBox,
    toggleGrid,
    toggleRulers,
    toggleBoundingBox
  } = useViewportState();

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
  };

  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    setZoom(0.8);
    setPanOffset({ x: 0, y: 0 });
  };

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select (V)' },
    { id: 'brush', icon: PaintBucket, label: 'Brush (B)' },
    { id: 'text', icon: Type, label: 'Text (T)' },
    { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
    { id: 'circle', icon: Circle, label: 'Circle (C)' },
    { id: 'triangle', icon: Triangle, label: 'Triangle (P)' }
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center h-12 px-4 bg-card/95 backdrop-blur-sm border-b border-border/50">
        {/* Tools Section */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTool(tool.id as any)}
                  className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
                >
                  <tool.icon className="h-4 w-4" />
                  <span className="sr-only">{tool.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="mx-3 h-6" />

        {/* View Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? 'default' : 'ghost'}
                size="sm"
                onClick={toggleGrid}
                className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Toggle Grid (G)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle Grid (G)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showRulers ? 'default' : 'ghost'}
                size="sm"
                onClick={toggleRulers}
                className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
              >
                <Ruler className="h-4 w-4" />
                <span className="sr-only">Toggle Rulers (R)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle Rulers (R)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showBoundingBox ? 'default' : 'ghost'}
                size="sm"
                onClick={toggleBoundingBox}
                className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
              >
                {showBoundingBox ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="sr-only">Toggle Bounding Box</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Toggle Bounding Box</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="mx-3 h-6" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
              >
                <ZoomOut className="h-4 w-4" />
                <span className="sr-only">Zoom Out (-)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Zoom Out (-)</p>
            </TooltipContent>
          </Tooltip>

          <div className="px-2 text-sm font-medium min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
              >
                <ZoomIn className="h-4 w-4" />
                <span className="sr-only">Zoom In (+)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Zoom In (+)</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFitToScreen}
                className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="sr-only">Fit to Screen</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Fit to Screen</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetView}
                className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Reset View (Ctrl+0)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Reset View (Ctrl+0)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right Side Controls */}
        <div className="ml-auto flex items-center gap-1">
          {onSettingsClick && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSettingsClick}
                  className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onFullscreenToggle && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isFullscreen ? 'default' : 'ghost'}
                  size="sm"
                  onClick={onFullscreenToggle}
                  className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] touch:min-h-[44px] touch:min-w-[44px]"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="sr-only">Toggle Fullscreen (F11)</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle Fullscreen (F11)</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};