import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, PenTool, Eraser, Move, X, Minimize2, Maximize2,
  Pipette, Settings, RotateCcw
} from 'lucide-react';
import { BrushSettings, BRUSH_PRESETS } from '@/lib/studio/brushEngine';
import { cn } from '@/lib/utils';

interface FloatingBrushPanelProps {
  isVisible: boolean;
  brushSettings: BrushSettings;
  onBrushSettingsChange: (settings: Partial<BrushSettings>) => void;
  onClose?: () => void;
  className?: string;
}

const ColorPalette = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB',
  '#A52A2A', '#808080', '#000080', '#FFFFE0'
];

export const FloatingBrushPanel: React.FC<FloatingBrushPanelProps> = ({
  isVisible,
  brushSettings,
  onBrushSettingsChange,
  onClose,
  className
}) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('pencil');
  const dragRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Dragging functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return;
    
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Brush preset selection
  const handlePresetChange = useCallback((presetKey: string) => {
    const preset = BRUSH_PRESETS[presetKey];
    if (preset) {
      setActivePreset(presetKey);
      onBrushSettingsChange(preset);
    }
  }, [onBrushSettingsChange]);

  // Color change handler
  const handleColorChange = useCallback((color: string) => {
    onBrushSettingsChange({ color });
  }, [onBrushSettingsChange]);

  if (!isVisible) return null;

  return (
    <Card
      ref={dragRef}
      className={cn(
        "fixed z-50 bg-card/95 backdrop-blur-lg border border-border/50 shadow-2xl",
        "transition-all duration-200 ease-out",
        isDragging && "cursor-grabbing shadow-3xl",
        isMinimized ? "w-12 h-12" : "w-80",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-primary" />
          {!isMinimized && <span className="text-sm font-medium">Brush Settings</span>}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-destructive/20"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-4">
          {/* Brush Presets */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Brush Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(BRUSH_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant={activePreset === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange(key)}
                  className={cn(
                    "h-10 text-xs capitalize transition-all",
                    activePreset === key && "shadow-md shadow-primary/30"
                  )}
                >
                  {key}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Color Palette */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Color
            </label>
            <div className="grid grid-cols-8 gap-1 mb-2">
              {ColorPalette.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={cn(
                    "w-6 h-6 rounded border-2 transition-all hover:scale-110",
                    brushSettings.color === color 
                      ? "border-primary shadow-md" 
                      : "border-border/50 hover:border-border"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            {/* Custom Color Picker */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={brushSettings.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <span className="text-xs text-muted-foreground font-mono">
                {brushSettings.color.toUpperCase()}
              </span>
            </div>
          </div>

          <Separator />

          {/* Brush Size */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center justify-between">
              Size
              <span className="text-primary font-mono">{brushSettings.size}px</span>
            </label>
            <Slider
              value={[brushSettings.size]}
              onValueChange={([value]) => onBrushSettingsChange({ size: value })}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Opacity */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center justify-between">
              Opacity
              <span className="text-primary font-mono">{Math.round(brushSettings.opacity * 100)}%</span>
            </label>
            <Slider
              value={[brushSettings.opacity]}
              onValueChange={([value]) => onBrushSettingsChange({ opacity: value })}
              min={0.1}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Hardness */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center justify-between">
              Hardness
              <span className="text-primary font-mono">{Math.round(brushSettings.hardness * 100)}%</span>
            </label>
            <Slider
              value={[brushSettings.hardness]}
              onValueChange={([value]) => onBrushSettingsChange({ hardness: value })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetChange('pencil')}
              className="flex-1 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Advanced
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};