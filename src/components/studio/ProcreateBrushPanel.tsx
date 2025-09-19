import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Brush, 
  Palette, 
  Droplets,
  Eraser,
  Settings,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { BrushSettings, BRUSH_PRESETS, BlendMode } from '@/lib/studio/brushEngine';
import { cn } from '@/lib/utils';

interface ProcreateBrushPanelProps {
  currentBrush: BrushSettings;
  onBrushChange: (settings: Partial<BrushSettings>) => void;
  onPresetSelect: (preset: keyof typeof BRUSH_PRESETS) => void;
  collapsed?: boolean;
}

export const ProcreateBrushPanel = ({ 
  currentBrush, 
  onBrushChange, 
  onPresetSelect,
  collapsed = false 
}: ProcreateBrushPanelProps) => {
  const [activeSection, setActiveSection] = useState<'presets' | 'settings' | 'advanced'>('presets');

  const presetItems = Object.entries(BRUSH_PRESETS).map(([key, preset]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    icon: getBrushIcon(preset.type),
    preset
  }));

  const blendModes: BlendMode[] = [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light', 
    'hard-light', 'color-dodge', 'color-burn', 'darken', 
    'lighten', 'difference', 'exclusion'
  ];

  const handleSliderChange = useCallback((property: keyof BrushSettings) => 
    (value: number[]) => {
      onBrushChange({ [property]: value[0] });
    }, [onBrushChange]
  );

  if (collapsed) {
    return (
      <div className="w-16 bg-card border-r border-border p-2">
        <div className="flex flex-col gap-2">
          {presetItems.slice(0, 4).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => onPresetSelect(item.id as keyof typeof BRUSH_PRESETS)}
              className={cn(
                "w-12 h-12",
                currentBrush.type === item.preset.type && "bg-primary text-primary-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="w-80 bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brush className="w-5 h-5 text-primary" />
          Brush Engine
        </CardTitle>
        
        {/* Section Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {[
            { id: 'presets', label: 'Presets', icon: Palette },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'advanced', label: 'Advanced', icon: Layers }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeSection === id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection(id as any)}
              className="flex-1 h-8"
            >
              <Icon className="w-3 h-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Brush Presets */}
        {activeSection === 'presets' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {presetItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentBrush.type === item.preset.type ? 'default' : 'outline'}
                  onClick={() => onPresetSelect(item.id as keyof typeof BRUSH_PRESETS)}
                  className={cn(
                    "h-16 flex flex-col gap-1 relative",
                    currentBrush.type === item.preset.type && "ring-2 ring-primary"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.name}</span>
                  
                  {/* Brush preview */}
                  <div className="absolute bottom-1 right-1 w-3 h-3 bg-current rounded-full opacity-60" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Basic Settings */}
        {activeSection === 'settings' && (
          <div className="space-y-4">
            {/* Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Size</label>
                <Badge variant="secondary">{Math.round(currentBrush.size)}px</Badge>
              </div>
              <Slider
                value={[currentBrush.size]}
                onValueChange={handleSliderChange('size')}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Opacity</label>
                <Badge variant="secondary">{Math.round(currentBrush.opacity * 100)}%</Badge>
              </div>
              <Slider
                value={[currentBrush.opacity]}
                onValueChange={handleSliderChange('opacity')}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Flow */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Flow</label>
                <Badge variant="secondary">{Math.round(currentBrush.flow * 100)}%</Badge>
              </div>
              <Slider
                value={[currentBrush.flow]}
                onValueChange={handleSliderChange('flow')}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Hardness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Hardness</label>
                <Badge variant="secondary">{Math.round(currentBrush.hardness * 100)}%</Badge>
              </div>
              <Slider
                value={[currentBrush.hardness]}
                onValueChange={handleSliderChange('hardness')}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {activeSection === 'advanced' && (
          <div className="space-y-4">
            {/* Smoothing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Smoothing</label>
                <Badge variant="secondary">{Math.round(currentBrush.smoothing * 100)}%</Badge>
              </div>
              <Slider
                value={[currentBrush.smoothing]}
                onValueChange={handleSliderChange('smoothing')}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Spacing */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Spacing</label>
                <Badge variant="secondary">{Math.round(currentBrush.spacing * 100)}%</Badge>
              </div>
              <Slider
                value={[currentBrush.spacing]}
                onValueChange={handleSliderChange('spacing')}
                min={0.01}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Pressure Sensitivity */}
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Pressure Sensitivity
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Size Response</label>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(currentBrush.pressureSizeMultiplier * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={[currentBrush.pressureSizeMultiplier]}
                  onValueChange={handleSliderChange('pressureSizeMultiplier')}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground">Opacity Response</label>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(currentBrush.pressureOpacityMultiplier * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={[currentBrush.pressureOpacityMultiplier]}
                  onValueChange={handleSliderChange('pressureOpacityMultiplier')}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Blend Mode */}
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Blend Mode</label>
              <Select 
                value={currentBrush.blendMode} 
                onValueChange={(value) => onBrushChange({ blendMode: value as BlendMode })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blend mode" />
                </SelectTrigger>
                <SelectContent>
                  {blendModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Color Preview */}
        <Separator />
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div 
            className="w-8 h-8 rounded-full border-2 border-border"
            style={{ backgroundColor: currentBrush.color }}
          />
          <div className="flex-1">
            <div className="text-sm font-medium">Current Color</div>
            <div className="text-xs text-muted-foreground font-mono">
              {currentBrush.color.toUpperCase()}
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Palette className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
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