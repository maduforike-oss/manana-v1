import React, { useEffect, useState } from 'react';
import { TopBar } from './TopBar';
import { EnhancedLeftTools } from './EnhancedLeftTools';
import { RightProps } from './RightProps';
import { SimplifiedCanvasStage } from './SimplifiedCanvasStage';
import { ColorSelector } from './ColorSelector';
import { EnhancedBottomControls } from './EnhancedBottomControls';
import { useSetActiveTool, useUndo, useRedo, useSetZoom, useSetPanOffset } from '../../lib/studio/storeSelectors';
import { useAppStore } from '../../store/useAppStore';
import { useViewportManager } from './EnhancedViewportManager';
import { AsyncStudioInitializer } from './optimized/AsyncStudioInitializer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Layers, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StudioShell = () => {
  const setActiveTool = useSetActiveTool();
  const undo = useUndo();
  const redo = useRedo();
  const setZoom = useSetZoom();
  const setPanOffset = useSetPanOffset();
  const { currentDesign } = useAppStore();
  const { toggleGrid, toggleRulers, toggleSnap, toggleBoundingBox } = useViewportManager();
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('design'); // Auto-open design tab

  // Enhanced keyboard shortcuts with performance optimization
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'h':
          setActiveTool('hand');
          break;
        case 't':
          setActiveTool('text');
          break;
        case 'r':
          if (!e.shiftKey) setActiveTool('rect');
          break;
        case 'c':
          setActiveTool('circle');
          break;
        case 'g':
          if (e.shiftKey) {
            toggleSnap();
          } else {
            toggleGrid();
          }
          e.preventDefault();
          break;
        case 'r':
          if (e.shiftKey) {
            toggleRulers();
            e.preventDefault();
          }
          break;
        case 'b':
          toggleBoundingBox();
          e.preventDefault();
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            e.preventDefault();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
            e.preventDefault();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, toggleGrid, toggleRulers, toggleSnap, toggleBoundingBox, undo, redo, setZoom, setPanOffset]);
  return (
    <AsyncStudioInitializer onInitialized={() => setActiveRightTab('design')}>
      <div className="min-h-dvh h-dvh md:min-h-screen md:h-screen flex flex-col bg-background text-foreground touch-none select-none">
        <TopBar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Tools Panel */}
          <div className={cn(
            "transition-all duration-300 ease-in-out bg-surface-elevated border-r border-glass-border shadow-lg",
            leftPanelCollapsed ? "w-0 overflow-hidden" : "w-16 md:w-20"
          )}>
            <EnhancedLeftTools collapsed={leftPanelCollapsed} />
          </div>

          {/* Left Panel Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-6 rounded-r-md bg-card border border-l-0 hover:bg-accent transition-all duration-200",
              leftPanelCollapsed ? "translate-x-0" : "translate-x-16"
            )}
          >
            {leftPanelCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </Button>
          
          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            <SimplifiedCanvasStage />
            
            {/* Color Selector - Fixed Position */}
            <div className="absolute top-4 right-4 z-50 pointer-events-auto">
              <ColorSelector />
            </div>
            
            {/* Enhanced Bottom Controls */}
            <EnhancedBottomControls />
            
            {/* Simplified Status Bar */}
            <div className="h-6 bg-card/95 border-t border-border/50 backdrop-blur-sm flex items-center justify-between px-4 text-xs shadow-sm">
              <div className="flex items-center gap-6">
                <span className="font-medium text-foreground">Ready</span>
              </div>
            </div>
          </div>
          
          {/* Right Properties Panel */}
          <div className={cn(
            "transition-all duration-300 ease-in-out bg-surface-elevated border-l border-glass-border shadow-lg",
            rightPanelCollapsed ? "w-0 overflow-hidden" : "w-80 md:w-96"
          )}>
            <RightProps 
              collapsed={rightPanelCollapsed}
              activeTab={activeRightTab}
              onTabChange={setActiveRightTab}
            />
          </div>

          {/* Right Panel Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-6 rounded-l-md bg-card border border-r-0 hover:bg-accent transition-all duration-200",
              rightPanelCollapsed ? "translate-x-0" : "-translate-x-80"
            )}
          >
            {rightPanelCollapsed ? (
              <ChevronLeft className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>

          {/* Floating Panel Toggles (when collapsed) */}
          {(leftPanelCollapsed || rightPanelCollapsed) && (
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              {leftPanelCollapsed && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setLeftPanelCollapsed(false)}
                  className="shadow-lg animate-fade-in"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Tools
                </Button>
              )}
              {rightPanelCollapsed && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRightPanelCollapsed(false)}
                  className="shadow-lg animate-fade-in"
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Properties
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AsyncStudioInitializer>
  );
};