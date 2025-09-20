import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PenTool, Eraser, Circle, Square, Zap, Droplets } from 'lucide-react';

interface BrushSettingsProps {
  settings: {
    size: number;
    opacity: number;
    color: string;
    hardness: number;
    type: 'pencil' | 'marker' | 'spray' | 'eraser';
  };
  onChange: (settings: any) => void;
  isEraser?: boolean;
}

const BRUSH_TYPES = [
  { key: 'pencil', icon: PenTool, name: 'Pencil', description: 'Precise lines' },
  { key: 'marker', icon: Circle, name: 'Marker', description: 'Smooth strokes' },
  { key: 'spray', icon: Droplets, name: 'Spray', description: 'Textured effects' },
  { key: 'eraser', icon: Eraser, name: 'Eraser', description: 'Remove content' }
];

export const TouchOptimizedBrushSettings: React.FC<BrushSettingsProps> = ({
  settings,
  onChange,
  isEraser = false
}) => {
  const handleSettingChange = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="p-4 space-y-6 bg-surface-elevated rounded-lg border border-glass-border shadow-lg">
      {/* Brush Type Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Brush Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {BRUSH_TYPES.map((type) => {
            const IconComponent = type.icon;
            return (
              <Button
                key={type.key}
                variant={settings.type === type.key ? "default" : "outline"}
                size="sm"
                onClick={() => handleSettingChange('type', type.key)}
                className="h-16 flex-col gap-1 touch-manipulation"
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs">{type.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Size Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Size</label>
          <span className="text-sm text-muted-foreground">{settings.size}px</span>
        </div>
        <Slider
          value={[settings.size]}
          onValueChange={(value) => handleSettingChange('size', value[0])}
          min={1}
          max={100}
          step={1}
          className="touch-manipulation"
        />
        <div className="flex justify-center">
          <div 
            className="rounded-full border-2 border-primary/20"
            style={{
              width: Math.max(8, Math.min(settings.size, 40)),
              height: Math.max(8, Math.min(settings.size, 40)),
              backgroundColor: isEraser ? 'transparent' : settings.color,
              borderStyle: isEraser ? 'dashed' : 'solid'
            }}
          />
        </div>
      </div>

      {/* Opacity Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Opacity</label>
          <span className="text-sm text-muted-foreground">{Math.round(settings.opacity * 100)}%</span>
        </div>
        <Slider
          value={[settings.opacity]}
          onValueChange={(value) => handleSettingChange('opacity', value[0])}
          min={0.1}
          max={1}
          step={0.1}
          className="touch-manipulation"
        />
      </div>

      {/* Hardness Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Hardness</label>
          <span className="text-sm text-muted-foreground">{Math.round(settings.hardness * 100)}%</span>
        </div>
        <Slider
          value={[settings.hardness]}
          onValueChange={(value) => handleSettingChange('hardness', value[0])}
          min={0.1}
          max={1}
          step={0.1}
          className="touch-manipulation"
        />
      </div>

      {/* Color Picker (only for non-eraser tools) */}
      {!isEraser && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.color}
              onChange={(e) => handleSettingChange('color', e.target.value)}
              className="w-12 h-12 rounded-lg border border-glass-border cursor-pointer touch-manipulation"
            />
            <div className="flex-1 text-sm text-muted-foreground font-mono">
              {settings.color.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Apple Pencil Instructions */}
      <div className="text-xs text-muted-foreground bg-surface-subtle p-3 rounded-md">
        <strong>Apple Pencil Tips:</strong>
        <ul className="mt-1 space-y-1 list-disc list-inside">
          <li>Use pressure for dynamic brush size</li>
          <li>Tilt for broader strokes (marker mode)</li>
          <li>Two-finger tap to undo</li>
          <li>Three-finger tap for tool menu</li>
        </ul>
      </div>
    </div>
  );
};