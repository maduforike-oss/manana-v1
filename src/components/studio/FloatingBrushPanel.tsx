import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minimize2, Maximize2, Move, X, PenTool, Eye, EyeOff, Palette } from 'lucide-react';
import { BrushControlsPanel } from './BrushControlsPanel';
import { EnhancedColorSelector } from './EnhancedColorSelector';
import { BrushSettings } from '../../lib/studio/brushEngine';
import { useStudioStore } from '@/lib/studio/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface FloatingBrushPanelProps {
  isVisible: boolean;
  onClose: () => void;
  brushSettings: BrushSettings;
  onBrushSettingsChange: (settings: Partial<BrushSettings>) => void;
  activeTool: string;
  onToolChange: (tool: 'brush' | 'eraser') => void;
  isPersistent?: boolean;
  onTogglePersistent?: () => void;
}

export const FloatingBrushPanel: React.FC<FloatingBrushPanelProps> = ({
  isVisible,
  onClose,
  brushSettings,
  onBrushSettingsChange,
  activeTool,
  onToolChange,
  isPersistent = false,
  onTogglePersistent
}) => {
  const isMobile = useIsMobile();
  const [isMinimized, setIsMinimized] = useState(false);
  const [colorHistory, setColorHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('brush-color-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage
    const saved = localStorage.getItem('floating-brush-panel-position');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback to default position
      }
    }
    return { x: 20, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Save position and color history to localStorage
  useEffect(() => {
    localStorage.setItem('floating-brush-panel-position', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('brush-color-history', JSON.stringify(colorHistory));
  }, [colorHistory]);

  const handleBrushColorChange = (color: string) => {
    onBrushSettingsChange({ color });
  };

  const addToColorHistory = (color: string) => {
    setColorHistory(prev => {
      const newHistory = [color, ...prev.filter(c => c !== color)].slice(0, 10);
      return newHistory;
    });
  };

  // Handle drag start with proper offset calculation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    
    const panelRect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - panelRect.left,
      y: e.clientY - panelRect.top
    });
    setIsDragging(true);
  };

  // Handle drag move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep panel within viewport bounds
      const maxX = window.innerWidth - 320; // Panel width
      const maxY = window.innerHeight - (isMinimized ? 60 : 500); // Panel height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMinimized]);

  // Snap to edges when near them
  useEffect(() => {
    const snapThreshold = 20;
    const newPosition = { ...position };
    
    // Snap to left edge
    if (position.x < snapThreshold) {
      newPosition.x = 0;
    }
    // Snap to right edge  
    else if (position.x > window.innerWidth - 320 - snapThreshold) {
      newPosition.x = window.innerWidth - 320;
    }
    
    // Snap to top edge
    if (position.y < snapThreshold) {
      newPosition.y = 0;
    }
    
    if (newPosition.x !== position.x || newPosition.y !== position.y) {
      setPosition(newPosition);
    }
  }, [position]);

  if (!isVisible) return null;

  // Mobile layout - use bottom sheet style
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto">
        <Card className="bg-card/95 backdrop-blur-md border-border border-t rounded-t-lg rounded-b-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium">Brush Controls</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-4 max-h-[40vh] overflow-y-auto">
              {/* Quick color swatches for mobile */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Color</span>
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: brushSettings.color }}
                  />
                </div>
                
                {/* Quick color grid */}
                <div className="grid grid-cols-8 gap-2">
                  {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'].map(color => (
                    <button
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 shadow-sm transition-transform",
                        brushSettings.color === color ? "border-primary scale-110" : "border-white/50"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => handleBrushColorChange(color)}
                    />
                  ))}
                </div>
                
                {/* Full color picker toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-full"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  More Colors
                </Button>
                
                {/* Basic brush controls for mobile */}
                <BrushControlsPanel
                  brushSettings={brushSettings}
                  onBrushSettingsChange={onBrushSettingsChange}
                  activeTool={activeTool}
                  onToolChange={onToolChange}
                  className="border-0 bg-transparent"
                />
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  // Desktop/tablet layout - floating draggable panel

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed z-50 pointer-events-auto transition-all duration-200",
        isDragging && "cursor-grabbing",
        position.x < 50 && "shadow-2xl", // Enhanced shadow when docked left
      )}
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? 'auto' : '320px'
      }}
    >
      <Card className="bg-card/95 backdrop-blur-md border-border shadow-lg">
        <CardHeader 
          className={cn(
            "pb-2 cursor-grab active:cursor-grabbing",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium">Brush Controls</h3>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Persistent toggle */}
              {onTogglePersistent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTogglePersistent}
                  className={cn(
                    "h-6 w-6 p-0",
                    isPersistent ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  )}
                  title={isPersistent ? "Hide when tool changes" : "Keep visible always"}
                >
                  {isPersistent ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
              )}
              
              {/* Minimize/Maximize button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 hover:bg-accent"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3 h-3" />
                ) : (
                  <Minimize2 className="w-3 h-3" />
                )}
              </Button>
              
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-4 space-y-4">
            {/* Brush Color Selector */}
            <EnhancedColorSelector
              mode="brush"
              currentColor={brushSettings.color}
              onColorChange={handleBrushColorChange}
              colorHistory={colorHistory}
              onAddToHistory={addToColorHistory}
              showHex={true}
            />
            
            {/* Brush Controls */}
            <BrushControlsPanel
              brushSettings={brushSettings}
              onBrushSettingsChange={onBrushSettingsChange}
              activeTool={activeTool}
              onToolChange={onToolChange}
              className="border-0 bg-transparent"
            />
          </CardContent>
        )}
        
        {isMinimized && (
          <CardContent className="p-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex gap-1">
                <Button
                  variant={activeTool === 'brush' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToolChange('brush')}
                  className="h-6 px-2 text-xs"
                >
                  Brush
                </Button>
                <Button
                  variant={activeTool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToolChange('eraser')}
                  className="h-6 px-2 text-xs"
                >
                  Eraser
                </Button>
              </div>
              <span>Size: {Math.round(brushSettings.size)}px</span>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Resize handle */}
      {!isMinimized && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100">
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-border" />
        </div>
      )}
    </div>
  );
};
