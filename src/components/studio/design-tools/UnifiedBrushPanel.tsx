import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Eraser, 
  Palette, 
  Settings,
  Layers,
  Droplets,
  Brush
} from 'lucide-react';
import { toolManager } from './ToolManager';
import { BrushTool, BrushSettings } from './BrushTool';
import { BRUSH_PRESETS } from '@/lib/studio/brushEngine';
import { cn } from '@/lib/utils';

interface UnifiedBrushPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
  className?: string;
  collapsed?: boolean;
}

export const UnifiedBrushPanel: React.FC<UnifiedBrushPanelProps> = ({
  isVisible = true,
  onClose,
  className = "",
  collapsed = false
}) => {
  const [activeSection, setActiveSection] = useState<'presets' | 'settings' | 'advanced'>('presets');
  const [currentBrushSettings, setCurrentBrushSettings] = useState<BrushSettings>({
    size: 10,
    opacity: 1,
    color: '#000000',
    hardness: 0.8,
    type: 'pencil',
    isEraser: false
  });

  // Get current brush/eraser tool
  const getCurrentBrushTool = (): BrushTool | null => {
    const currentTool = toolManager.getCurrentTool();
    return currentTool instanceof BrushTool ? currentTool : null;
  };

  // Update settings when tool changes
  useEffect(() => {
    const brushTool = getCurrentBrushTool();
    if (brushTool) {
      setCurrentBrushSettings(brushTool.getSettings() as BrushSettings);
    }
  }, [toolManager.getCurrentToolId()]);

  // Handle settings change
  const handleSettingsChange = useCallback((newSettings: Partial<BrushSettings>) => {
    const updatedSettings = { ...currentBrushSettings, ...newSettings };
    setCurrentBrushSettings(updatedSettings);

    // Update the active brush tool
    const brushTool = getCurrentBrushTool();
    if (brushTool) {
      brushTool.updateSettings(updatedSettings);
    }

    // Update both brush and eraser tools
    toolManager.updateToolSettings('brush', updatedSettings);
    toolManager.updateToolSettings('eraser', { ...updatedSettings, isEraser: true });
  }, [currentBrushSettings]);

  // Switch between brush and eraser
  const handleToolSwitch = (isEraser: boolean) => {
    const targetTool = isEraser ? 'eraser' : 'brush';
    toolManager.activateTool(targetTool);
    
    // Update settings for eraser mode
    handleSettingsChange({ isEraser });
  };

  // Apply preset
  const handlePresetSelect = (presetKey: keyof typeof BRUSH_PRESETS) => {
    const preset = BRUSH_PRESETS[presetKey];
    if (preset) {
      handleSettingsChange({
        ...preset,
        type: presetKey,
        color: currentBrushSettings.color, // Preserve current color
        isEraser: currentBrushSettings.isEraser // Preserve current mode
      });
    }
  };

  // Color options
  const colorOptions = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#8B4513', '#808080', '#FFC0CB', '#90EE90', '#FFB6C1'
  ];

  // Preset items with icons
  const presetItems = Object.entries(BRUSH_PRESETS).map(([key, preset]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    icon: getBrushIcon(key),
    preset
  }));

  if (!isVisible) return null;

  // Collapsed view
  if (collapsed) {
    return (
      <div className="w-16 bg-card border-r border-border p-2">
        <div className="flex flex-col gap-2">
          {/* Tool toggles */}
          <Button
            variant={!currentBrushSettings.isEraser ? 'default' : 'outline'}
            size="icon"
            onClick={() => handleToolSwitch(false)}
            className="w-12 h-12"
          >
            <PenTool className="w-5 h-5" />
          </Button>
          <Button
            variant={currentBrushSettings.isEraser ? 'default' : 'outline'}
            size="icon"
            onClick={() => handleToolSwitch(true)}
            className="w-12 h-12"
          >
            <Eraser className="w-5 h-5" />
          </Button>
          
          <Separator className="my-2" />
          
          {/* Quick presets */}
          {presetItems.slice(0, 3).map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => handlePresetSelect(item.id as keyof typeof BRUSH_PRESETS)}
              className={cn(
                "w-12 h-12",
                currentBrushSettings.type === item.id && "bg-primary text-primary-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Full panel view
  return (
    <Card className={cn("w-80 bg-card/95 backdrop-blur-sm border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {currentBrushSettings.isEraser ? (
              <Eraser className="w-5 h-5 text-primary" />
            ) : (
              <Brush className="w-5 h-5 text-primary" />
            )}
            {currentBrushSettings.isEraser ? 'Eraser' : 'Brush'} Tools
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </CardTitle>
        
        {/* Tool Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!currentBrushSettings.isEraser ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolSwitch(false)}
            className="flex-1"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Brush
          </Button>
          <Button
            variant={currentBrushSettings.isEraser ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToolSwitch(true)}
            className="flex-1"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Eraser
          </Button>
        </div>

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
                  variant={currentBrushSettings.type === item.id ? 'default' : 'outline'}
                  onClick={() => handlePresetSelect(item.id as keyof typeof BRUSH_PRESETS)}
                  className={cn(
                    "h-16 flex flex-col gap-1 relative",
                    currentBrushSettings.type === item.id && "ring-2 ring-primary"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.name}</span>
                  
                  {/* Brush preview dot */}
                  <div 
                    className="absolute bottom-1 right-1 rounded-full opacity-60"
                    style={{
                      backgroundColor: 'currentColor',
                      width: Math.max(3, Math.min(item.preset.size / 3, 8)),
                      height: Math.max(3, Math.min(item.preset.size / 3, 8))
                    }}
                  />
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
                <Badge variant="secondary">{Math.round(currentBrushSettings.size)}px</Badge>
              </div>
              <Slider
                value={[currentBrushSettings.size]}
                onValueChange={([value]) => handleSettingsChange({ size: value })}
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
                    width: Math.min(Math.max(currentBrushSettings.size / 2, 4), 20),
                    height: Math.min(Math.max(currentBrushSettings.size / 2, 4), 20)
                  }}
                />
              </div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Opacity</label>
                <Badge variant="secondary">{Math.round(currentBrushSettings.opacity * 100)}%</Badge>
              </div>
              <Slider
                value={[currentBrushSettings.opacity]}
                onValueChange={([value]) => handleSettingsChange({ opacity: value })}
                min={0.1}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Hardness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Hardness</label>
                <Badge variant="secondary">{Math.round(currentBrushSettings.hardness * 100)}%</Badge>
              </div>
              <Slider
                value={[currentBrushSettings.hardness]}
                onValueChange={([value]) => handleSettingsChange({ hardness: value })}
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
            <div className="text-sm text-muted-foreground">
              Advanced brush dynamics and pressure sensitivity settings coming soon.
            </div>
          </div>
        )}

        {/* Color Selection - Only for brush mode */}
        {!currentBrushSettings.isEraser && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <label className="text-sm font-medium">Color</label>
              </div>
              
              {/* Color grid */}
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSettingsChange({ color })}
                    className={cn(
                      "w-8 h-8 rounded border-2 transition-all",
                      currentBrushSettings.color === color 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border hover:border-primary/50'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Custom color input */}
              <input
                type="color"
                value={currentBrushSettings.color}
                onChange={(e) => handleSettingsChange({ color: e.target.value })}
                className="w-full h-10 rounded border border-border bg-card cursor-pointer"
              />
              
              {/* Current color display */}
              <div className="flex items-center gap-3 p-2 bg-muted rounded">
                <div 
                  className="w-6 h-6 rounded border border-border"
                  style={{ backgroundColor: currentBrushSettings.color }}
                />
                <span className="text-xs font-mono">{currentBrushSettings.color.toUpperCase()}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to get brush icons
function getBrushIcon(type: string) {
  switch (type) {
    case 'pencil': return PenTool;
    case 'marker': return Brush;
    case 'spray': return Droplets;
    case 'charcoal': return PenTool;
    default: return PenTool;
  }
}