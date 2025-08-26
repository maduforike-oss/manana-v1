import React from 'react';
import { Button } from '../ui/button';
import { RotateCcw, Maximize2, Eye, EyeOff, Camera, Sun, Lightbulb } from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';

interface Controls3DViewProps {
  lightingPreset: 'studio' | 'outdoor' | 'product' | 'dramatic';
  onLightingChange: (preset: 'studio' | 'outdoor' | 'product' | 'dramatic') => void;
  showWireframe: boolean;
  onWireframeToggle: () => void;
}

export const Controls3DView = ({
  lightingPreset,
  onLightingChange,
  showWireframe,
  onWireframeToggle
}: Controls3DViewProps) => {
  const { setZoom, setPanOffset } = useStudioStore();

  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    setZoom(0.8);
    setPanOffset({ x: 0, y: 0 });
  };

  const lightingOptions = [
    { key: 'studio', label: 'Studio', icon: Lightbulb },
    { key: 'outdoor', label: 'Outdoor', icon: Sun },
    { key: 'product', label: 'Product', icon: Camera },
    { key: 'dramatic', label: 'Dramatic', icon: Eye }
  ] as const;

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
      {/* Lighting Controls */}
      <div className="flex gap-1 bg-background/90 backdrop-blur-sm rounded-md p-1">
        {lightingOptions.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={lightingPreset === key ? "default" : "ghost"}
            size="sm"
            onClick={() => onLightingChange(key)}
            className="h-8 px-2"
            title={`${label} Lighting`}
          >
            <Icon className="h-3 w-3" />
          </Button>
        ))}
      </div>
      
      {/* View Controls */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onWireframeToggle}
          className="bg-background/80 backdrop-blur-sm"
          title={showWireframe ? "Hide Wireframe" : "Show Wireframe"}
        >
          {showWireframe ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          className="bg-background/80 backdrop-blur-sm"
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleFitToScreen}
          className="bg-background/80 backdrop-blur-sm"
          title="Fit to Screen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};