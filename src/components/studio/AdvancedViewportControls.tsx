import React from 'react';
import { Button } from '../ui/button';
import { 
  Box, 
  Grid3X3, 
  Ruler, 
  Eye, 
  EyeOff,
  Move3D,
  Crosshair,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface AdvancedViewportControlsProps {
  showBoundingBox: boolean;
  onBoundingBoxToggle: () => void;
  showGrid: boolean;
  onGridToggle: () => void;
  showRulers: boolean;
  onRulersToggle: () => void;
  snapToGrid: boolean;
  onSnapToggle: () => void;
}

export const AdvancedViewportControls: React.FC<AdvancedViewportControlsProps> = ({
  showBoundingBox,
  onBoundingBoxToggle,
  showGrid,
  onGridToggle,
  showRulers,
  onRulersToggle,
  snapToGrid,
  onSnapToggle
}) => {
  const { setZoom, setPanOffset } = useStudioStore();

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
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        {/* Viewport Helpers Row */}
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showBoundingBox ? "default" : "secondary"}
                size="sm"
                onClick={onBoundingBoxToggle}
                className="bg-background/80 backdrop-blur-sm"
              >
                <Box className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Bounding Box</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? "default" : "secondary"}
                size="sm"
                onClick={onGridToggle}
                className="bg-background/80 backdrop-blur-sm"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Snap Grid</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showRulers ? "default" : "secondary"}
                size="sm"
                onClick={onRulersToggle}
                className="bg-background/80 backdrop-blur-sm"
              >
                <Ruler className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Rulers</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={snapToGrid ? "default" : "secondary"}
                size="sm"
                onClick={onSnapToggle}
                className="bg-background/80 backdrop-blur-sm"
              >
                <Crosshair className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Snap to Grid</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Camera Controls Row */}
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReset}
                className="bg-background/80 backdrop-blur-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset Camera</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleFitToScreen}
                className="bg-background/80 backdrop-blur-sm"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fit to Screen</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};