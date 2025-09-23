import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toolManager } from './ToolManager';
import { UnifiedBrushPanel } from './UnifiedBrushPanel';
import { BrushTool } from './BrushTool';
import { PenTool, Eraser, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingBrushControlsProps {
  className?: string;
}

export const FloatingBrushControls: React.FC<FloatingBrushControlsProps> = ({
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);

  // Show/hide based on active tool
  useEffect(() => {
    const checkToolVisibility = () => {
      const currentToolId = toolManager.getCurrentToolId();
      const shouldShow = currentToolId === 'brush' || currentToolId === 'eraser';
      setIsVisible(shouldShow);
      
      // Auto-expand when first activated
      if (shouldShow && !isExpanded) {
        setIsExpanded(true);
      }
    };

    // Check immediately and set up polling
    checkToolVisibility();
    const interval = setInterval(checkToolVisibility, 100);
    
    return () => clearInterval(interval);
  }, [isExpanded]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      const startX = e.clientX - position.x;
      const startY = e.clientY - position.y;

      const handleMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - startX,
          y: e.clientY - startY
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Quick tool switching
  const handleToolSwitch = (toolId: 'brush' | 'eraser') => {
    toolManager.activateTool(toolId);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-200",
        isDragging && "cursor-grabbing",
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        transform: isExpanded ? 'none' : 'scale(0.9)'
      }}
    >
      {isExpanded ? (
        // Full panel
        <div className="relative">
          <UnifiedBrushPanel
            isVisible={true}
            onClose={() => setIsExpanded(false)}
            className="shadow-xl"
          />
          
          {/* Drag handle */}
          <div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-card border border-border rounded-t-lg cursor-grab flex items-center justify-center"
            onMouseDown={handleMouseDown}
          >
            <div className="w-6 h-1 bg-border rounded" />
          </div>
        </div>
      ) : (
        // Collapsed floating controls
        <Card className="p-2 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="flex items-center gap-2">
            {/* Quick tool buttons */}
            <Button
              variant={toolManager.getCurrentToolId() === 'brush' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolSwitch('brush')}
              className="h-8 w-8 p-0"
            >
              <PenTool className="w-4 h-4" />
            </Button>
            
            <Button
              variant={toolManager.getCurrentToolId() === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToolSwitch('eraser')}
              className="h-8 w-8 p-0"
            >
              <Eraser className="w-4 h-4" />
            </Button>
            
            {/* Expand button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Drag handle for collapsed state */}
          <div
            className="absolute inset-0 cursor-grab"
            onMouseDown={handleMouseDown}
          />
        </Card>
      )}
    </div>
  );
};