import React from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Maximize2, Eye, EyeOff } from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';

export const Canvas3DControls = () => {
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
    <div className="absolute bottom-4 right-4 flex gap-2 z-10">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleReset}
        className="bg-background/80 backdrop-blur-sm"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={handleFitToScreen}
        className="bg-background/80 backdrop-blur-sm"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
};