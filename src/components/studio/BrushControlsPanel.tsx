import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Brush, 
  Eraser,
  Settings,
  Droplets
} from 'lucide-react';
import { BrushSettings, BRUSH_PRESETS } from '../../lib/studio/brushEngine';
import { cn } from '@/lib/utils';

interface BrushControlsPanelProps {
  brushSettings: BrushSettings;
  onBrushSettingsChange: (settings: Partial<BrushSettings>) => void;
  activeTool: string;
  onToolChange: (tool: 'brush' | 'eraser') => void;
  className?: string;
}

export const BrushControlsPanel: React.FC<BrushControlsPanelProps> = ({
  brushSettings,
  onBrushSettingsChange,
  activeTool,
  onToolChange,
  className = ""
}) => {
  const handleSliderChange = (property: keyof BrushSettings) => 
    (value: number[]) => {
      onBrushSettingsChange({ [property]: value[0] });
    };

  const presetItems = Object.entries(BRUSH_PRESETS).map(([key, preset]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    icon: getBrushIcon(preset.type),
    preset
  }));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tool Selection */}
      <div className="flex gap-2">
        <Button
          variant={activeTool === 'brush' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange('brush')}
          className="flex-1"
        >
          <Brush className="w-4 h-4 mr-2" />
          Brush
        </Button>
        <Button
          variant={activeTool === 'eraser' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange('eraser')}
          className="flex-1"
        >
          <Eraser className="w-4 h-4 mr-2" />
          Eraser
        </Button>
      </div>

      {/* Brush Presets */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Presets</div>
        <div className="grid grid-cols-4 gap-1">
          {presetItems.slice(0, 4).map((item) => (
            <Button
              key={item.id}
              variant={brushSettings.type === item.preset.type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onBrushSettingsChange(item.preset)}
              className="h-12 flex flex-col gap-1"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-xs">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Size Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Size</label>
          <Badge variant="secondary">{Math.round(brushSettings.size)}px</Badge>
        </div>
        <Slider
          value={[brushSettings.size]}
          onValueChange={handleSliderChange('size')}
          min={1}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Opacity Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Opacity</label>
          <Badge variant="secondary">{Math.round(brushSettings.opacity * 100)}%</Badge>
        </div>
        <Slider
          value={[brushSettings.opacity]}
          onValueChange={handleSliderChange('opacity')}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Hardness Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Hardness</label>
          <Badge variant="secondary">{Math.round(brushSettings.hardness * 100)}%</Badge>
        </div>
        <Slider
          value={[brushSettings.hardness]}
          onValueChange={handleSliderChange('hardness')}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      {/* Flow Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Flow</label>
          <Badge variant="secondary">{Math.round(brushSettings.flow * 100)}%</Badge>
        </div>
        <Slider
          value={[brushSettings.flow]}
          onValueChange={handleSliderChange('flow')}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>
    </div>
  );
};

function getBrushIcon(type: string) {
  switch (type) {
    case 'pencil': return PenTool;
    case 'marker': return Brush;
    case 'spray': return Droplets;
    case 'eraser': return Eraser;
    default: return PenTool;
  }
}