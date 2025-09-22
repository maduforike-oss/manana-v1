import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  PenTool, 
  Eraser, 
  Palette, 
  Circle,
  Settings 
} from 'lucide-react';
import { BrushSettings, BRUSH_PRESETS } from '../../lib/studio/brushEngine';

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
  const handleSizeChange = (value: number[]) => {
    onBrushSettingsChange({ size: value[0] });
  };

  const handleOpacityChange = (value: number[]) => {
    onBrushSettingsChange({ opacity: value[0] / 100 });
  };

  const handleHardnessChange = (value: number[]) => {
    onBrushSettingsChange({ hardness: value[0] / 100 });
  };

  const handleColorChange = (color: string) => {
    onBrushSettingsChange({ color });
  };

  const handlePresetChange = (presetKey: string) => {
    const preset = BRUSH_PRESETS[presetKey];
    if (preset) {
      onBrushSettingsChange(preset);
    }
  };

  const colorOptions = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  return (
    <Card className={`bg-card/95 backdrop-blur-sm border-border ${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* Tool Selection */}
        <div className="flex gap-2">
          <Button
            variant={activeTool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToolChange('brush')}
            className="flex-1"
          >
            <PenTool className="w-4 h-4 mr-2" />
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

        <Separator />

        {/* Brush Presets */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(BRUSH_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handlePresetChange(key)}
                className="text-xs capitalize"
              >
                {key}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Size Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Size</label>
            <span className="text-xs text-muted-foreground">{Math.round(brushSettings.size)}px</span>
          </div>
          <Slider
            value={[brushSettings.size]}
            onValueChange={handleSizeChange}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
          {/* Visual size indicator */}
          <div className="flex justify-center">
            <div 
              className="rounded-full border border-border bg-foreground"
              style={{
                width: Math.min(Math.max(brushSettings.size / 2, 4), 20),
                height: Math.min(Math.max(brushSettings.size / 2, 4), 20)
              }}
            />
          </div>
        </div>

        {/* Opacity Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Opacity</label>
            <span className="text-xs text-muted-foreground">{Math.round(brushSettings.opacity * 100)}%</span>
          </div>
          <Slider
            value={[brushSettings.opacity * 100]}
            onValueChange={handleOpacityChange}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Hardness Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Hardness</label>
            <span className="text-xs text-muted-foreground">{Math.round(brushSettings.hardness * 100)}%</span>
          </div>
          <Slider
            value={[brushSettings.hardness * 100]}
            onValueChange={handleHardnessChange}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Color Selection */}
        {activeTool === 'brush' && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <label className="text-sm font-medium text-foreground">Color</label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`
                      w-8 h-8 rounded border-2 transition-all
                      ${brushSettings.color === color 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Custom color input */}
              <input
                type="color"
                value={brushSettings.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 rounded border border-border bg-card"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};