import React, { useEffect, useState } from 'react';
import { TopBar } from './TopBar';
import { UnifiedLeftTools } from './design-tools/UnifiedLeftTools';
import { RightProps } from './RightProps';
import { UnifiedCanvasStage } from './design-tools/UnifiedCanvasStage';
import { ColorSelector } from './ColorSelector';
import { EnhancedBottomControls } from './EnhancedBottomControls';
import { useSetActiveTool, useUndo, useRedo, useSetZoom, useSetPanOffset } from '../../lib/studio/storeSelectors';
import { useAppStore } from '../../store/useAppStore';
import { useViewportManager } from './EnhancedViewportManager';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Layers, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalPanelState } from '@/hooks/useGlobalPanelState';
import { useSupabaseDesignPersistence } from '@/hooks/useSupabaseDesignPersistence';
import { CoordinateManagerProvider } from './CoordinateManager';
import { ToolFeedbackSystem, QuickToolSwitcher } from './ToolFeedbackSystem';

export const StudioShell = () => {
  const setActiveTool = useSetActiveTool();
  const undo = useUndo();
  const redo = useRedo();
  const setZoom = useSetZoom();
  const setPanOffset = useSetPanOffset();
  const { currentDesign } = useAppStore();
  const { toggleGrid, toggleRulers, toggleSnap, toggleBoundingBox } = useViewportManager();
  const { 
    leftPanelCollapsed, 
    rightPanelCollapsed, 
    activeRightTab,
    toggleLeftPanel,
    toggleRightPanel,
    setActiveRightTab 
  } = useGlobalPanelState();
  const { autoSave } = useSupabaseDesignPersistence();

  // Enhanced keyboard shortcuts with performance optimization
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Non-tool shortcuts (tools are handled by UnifiedKeyboardHandler)
      switch (e.key.toLowerCase()) {
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

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 10000);
    return () => clearInterval(interval);
  }, [autoSave]);
  return (
    <CoordinateManagerProvider>
      <div className="h-screen flex flex-col bg-background text-foreground">
        <TopBar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Tools Panel */}
          <div className={cn(
            "transition-all duration-300 ease-in-out bg-card border-r border-workspace-border",
            leftPanelCollapsed ? "w-0 overflow-hidden" : "w-16"
          )}>
            <UnifiedLeftTools collapsed={leftPanelCollapsed} />
          </div>

          {/* Left Panel Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftPanel}
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
            <UnifiedCanvasStage />
            
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
            "transition-all duration-300 ease-in-out bg-card border-l border-workspace-border",
            rightPanelCollapsed ? "w-0 overflow-hidden" : "w-80"
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
            onClick={toggleRightPanel}
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
                  onClick={toggleLeftPanel}
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
                  onClick={toggleRightPanel}
                  className="shadow-lg animate-fade-in"
                >
                  <Layers className="w-4 h-4 mr-1" />
                  Properties
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Enhanced Tool Feedback */}
        <ToolFeedbackSystem />
        <QuickToolSwitcher />
      </div>
    </CoordinateManagerProvider>
  );
};