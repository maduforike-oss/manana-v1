import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ColorSelector } from './ColorSelector';
import { BRUSH_PRESETS } from '@/lib/studio/brushEngine';
import { Brush, Eraser, Circle, Square } from 'lucide-react';

interface BrushSettingsProps {
  settings: {
    size: number;
    opacity: number;
    color: string;
    hardness: number;
    type: keyof typeof BRUSH_PRESETS;
  };
  onChange: (settings: Partial<BrushSettingsProps['settings']>) => void;
  isEraser?: boolean;
}

const BRUSH_TYPES = [
  { key: 'pencil' as const, icon: Circle, name: 'Pencil' },
  { key: 'marker' as const, icon: Square, name: 'Marker' },
  { key: 'spray' as const, icon: Brush, name: 'Spray' },
  { key: 'eraser' as const, icon: Eraser, name: 'Eraser' }
];

export const BrushSettings: React.FC<BrushSettingsProps> = ({
  settings,
  onChange,
  isEraser = false
}) => {
  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-lg min-w-64">
      <div className="space-y-4">
        {/* Brush Type */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Brush Type
          </label>
          <div className="flex gap-1">
            {BRUSH_TYPES.map(({ key, icon: Icon, name }) => (
              <Button
                key={key}
                variant={settings.type === key ? "default" : "ghost"}
                size="sm"
                onClick={() => onChange({ type: key })}
                className="flex-1 p-2"
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Size: {settings.size}px
          </label>
          <Slider
            value={[settings.size]}
            onValueChange={([size]) => onChange({ size })}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Brush Opacity */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Opacity: {Math.round(settings.opacity * 100)}%
          </label>
          <Slider
            value={[settings.opacity * 100]}
            onValueChange={([opacity]) => onChange({ opacity: opacity / 100 })}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Brush Hardness */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Hardness: {Math.round(settings.hardness * 100)}%
          </label>
          <Slider
            value={[settings.hardness * 100]}
            onValueChange={([hardness]) => onChange({ hardness: hardness / 100 })}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Color Picker (only for non-eraser tools) */}
        {!isEraser && (
          <div>
            <label className="text-xs font-medium text-foreground/80 mb-2 block">
              Color
            </label>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border-2 border-border cursor-pointer"
                style={{ backgroundColor: settings.color }}
                onClick={() => {
                  // Color picker would open here
                }}
              />
              <input
                type="color"
                value={settings.color}
                onChange={(e) => onChange({ color: e.target.value })}
                className="opacity-0 w-0 h-0"
              />
            </div>
          </div>
        )}

        {/* Brush Preview */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Preview
          </label>
          <div className="h-12 bg-studio-surface rounded border border-border flex items-center justify-center">
            <div
              className="rounded-full border border-border/50"
              style={{
                width: Math.min(settings.size, 40),
                height: Math.min(settings.size, 40),
                backgroundColor: isEraser ? 'transparent' : settings.color,
                opacity: settings.opacity,
                borderStyle: isEraser ? 'dashed' : 'solid'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};