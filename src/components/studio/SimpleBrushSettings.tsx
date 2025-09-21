import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { EnhancedColorSelector } from './EnhancedColorSelector';
import { BRUSH_PRESETS } from '@/lib/studio/brushEngine';
import { Brush, Eraser, Circle, Square } from 'lucide-react';

interface BrushSettingsProps {
  settings: {
    size: number;
    opacity: number;
    color: string;
    hardness: number;
    type: 'pencil' | 'marker' | 'spray' | 'eraser';
  };
  onChange: (updates: Partial<BrushSettingsProps['settings']>) => void;
  isEraser?: boolean;
}

export const SimpleBrushSettings: React.FC<BrushSettingsProps> = ({
  settings,
  onChange,
  isEraser = false
}) => {
  const handlePresetChange = (presetName: keyof typeof BRUSH_PRESETS) => {
    const preset = BRUSH_PRESETS[presetName];
    onChange({
      size: preset.size,
      opacity: preset.opacity,
      hardness: preset.hardness,
      type: presetName as any
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        {isEraser ? (
          <Eraser className="w-4 h-4 text-primary" />
        ) : (
          <Brush className="w-4 h-4 text-primary" />
        )}
        <h3 className="text-sm font-semibold">
          {isEraser ? 'Eraser' : 'Brush'} Settings
        </h3>
      </div>

      {/* Brush presets */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Presets</label>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(BRUSH_PRESETS).map(([name, preset]) => (
            <Button
              key={name}
              variant={settings.type === name ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetChange(name as keyof typeof BRUSH_PRESETS)}
              className="h-8 text-xs"
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-muted-foreground">Size</label>
          <span className="text-xs text-muted-foreground">{settings.size}px</span>
        </div>
        <Slider
          value={[settings.size]}
          onValueChange={([value]) => onChange({ size: value })}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-muted-foreground">Opacity</label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.opacity * 100)}%</span>
        </div>
        <Slider
          value={[settings.opacity]}
          onValueChange={([value]) => onChange({ opacity: value })}
          min={0.1}
          max={1}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Hardness */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-muted-foreground">Hardness</label>
          <span className="text-xs text-muted-foreground">{Math.round(settings.hardness * 100)}%</span>
        </div>
        <Slider
          value={[settings.hardness]}
          onValueChange={([value]) => onChange({ hardness: value })}
          min={0}
          max={1}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Color - only for brush, not eraser */}
      {!isEraser && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Color</label>
          <EnhancedColorSelector
            mode="brush"
            currentColor={settings.color}
            onColorChange={(color) => onChange({ color })}
            showHex={true}
          />
        </div>
      )}

      {/* Shape preview */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Preview</label>
        <div className="flex items-center justify-center h-16 bg-muted rounded-md">
          <div
            className="rounded-full border"
            style={{
              width: Math.max(4, Math.min(settings.size, 32)),
              height: Math.max(4, Math.min(settings.size, 32)),
              backgroundColor: isEraser ? 'transparent' : settings.color,
              borderColor: isEraser ? '#666' : settings.color,
              borderStyle: isEraser ? 'dashed' : 'solid',
              opacity: settings.opacity
            }}
          />
        </div>
      </div>
    </div>
  );
};