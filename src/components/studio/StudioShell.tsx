import React, { useEffect, useState } from 'react';
import { TopBar } from './TopBar';
import { EnhancedLeftTools } from './EnhancedLeftTools';
import { RightProps } from './RightProps';
import { Enhanced2DCanvasStage } from './Enhanced2DCanvasStage';
import { ColorSelector } from './ColorSelector';
import { EnhancedBottomControls } from './EnhancedBottomControls';
import { useStudioStore } from '../../lib/studio/store';
import { useAppStore } from '../../store/useAppStore';
import { useViewportManager } from './EnhancedViewportManager';
import { StudioLoadingTransition } from './StudioLoadingTransition';
import { useStudioSync } from '../../hooks/useStudioSync';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Layers, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StudioShell = () => {
  const { doc, zoom, clearSelection, initializeFromGarment, loadStudioFromAppDesign } = useStudioStore();
  const { currentDesign } = useAppStore();
  const { toggleGrid, toggleRulers, toggleSnap, toggleBoundingBox } = useViewportManager();
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('design'); // Auto-open design tab
  const [isLoading, setIsLoading] = useState(false);

  // Sync studio changes back to app store
  useStudioSync();

  // Enhanced initialization from current design with loading states
  useEffect(() => {
    const initializeStudio = async () => {
      if (currentDesign) {
        setIsLoading(true);
        
        try {
          // Auto-open design tab when loading from hub
          setActiveRightTab('design');
          
          // Sync studio state with app store design
          if (loadStudioFromAppDesign) {
            await loadStudioFromAppDesign(currentDesign);
          } else {
            // Fallback to basic initialization
            initializeFromGarment(currentDesign.garmentType, 'white');
          }
          
          // Small delay for smooth transition
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error('Failed to initialize studio:', error);
          // Fallback initialization
          initializeFromGarment(currentDesign.garmentType || 'tshirt-white', 'white');
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeStudio();
  }, [currentDesign, initializeFromGarment, loadStudioFromAppDesign, setActiveRightTab]);

  useEffect(() => {
    // Enhanced keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { activeTool, setActiveTool, undo, redo } = useStudioStore.getState();
      
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
            const { setZoom, setPanOffset } = useStudioStore.getState();
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
            e.preventDefault();
          }
          break;
        case '1':
          if (e.ctrlKey || e.metaKey) {
            // Fit to artboard
            const canvasElement = document.querySelector('.canvas-container');
            if (canvasElement) {
              const { setZoom, setPanOffset, doc } = useStudioStore.getState();
              const containerRect = canvasElement.getBoundingClientRect();
              const padding = 40;
              const scaleX = (containerRect.width - padding) / doc.canvas.width;
              const scaleY = (containerRect.height - padding) / doc.canvas.height;
              const optimalZoom = Math.min(scaleX, scaleY, 2);
              setZoom(optimalZoom);
              setPanOffset({ 
                x: (containerRect.width - doc.canvas.width * optimalZoom) / 2,
                y: (containerRect.height - doc.canvas.height * optimalZoom) / 2
              });
            }
            e.preventDefault();
          }
          break;
        case '2':
          if (e.ctrlKey || e.metaKey) {
            // Fit to selection
            const { doc, setZoom, setPanOffset } = useStudioStore.getState();
            if (doc.selectedIds.length > 0) {
              const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
              if (selectedNodes.length > 0) {
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                selectedNodes.forEach(node => {
                  minX = Math.min(minX, node.x);
                  minY = Math.min(minY, node.y);
                  maxX = Math.max(maxX, node.x + node.width);
                  maxY = Math.max(maxY, node.y + node.height);
                });
                
                const selectionWidth = maxX - minX;
                const selectionHeight = maxY - minY;
                const canvasElement = document.querySelector('.canvas-container');
                if (canvasElement) {
                  const containerRect = canvasElement.getBoundingClientRect();
                  const padding = 60;
                  const scaleX = (containerRect.width - padding) / selectionWidth;
                  const scaleY = (containerRect.height - padding) / selectionHeight;
                  const optimalZoom = Math.min(scaleX, scaleY, 4);
                  setZoom(optimalZoom);
                  
                  const selectionCenterX = minX + selectionWidth / 2;
                  const selectionCenterY = minY + selectionHeight / 2;
                  setPanOffset({ 
                    x: containerRect.width / 2 - selectionCenterX * optimalZoom,
                    y: containerRect.height / 2 - selectionCenterY * optimalZoom
                  });
                }
              }
            }
            e.preventDefault();
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            const { zoom, setZoom } = useStudioStore.getState();
            setZoom(Math.min(zoom * 1.2, 5));
            e.preventDefault();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            const { zoom, setZoom } = useStudioStore.getState();
            setZoom(Math.max(zoom / 1.2, 0.1));
            e.preventDefault();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleGrid, toggleRulers, toggleSnap, toggleBoundingBox]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <TopBar />
      
      {/* Enhanced loading transition */}
      <StudioLoadingTransition isLoading={isLoading} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Tools Panel */}
        <div className={cn(
          "transition-all duration-300 ease-in-out bg-card border-r border-workspace-border",
          leftPanelCollapsed ? "w-0 overflow-hidden" : "w-16"
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
          <Enhanced2DCanvasStage />
          
          {/* Color Selector - Fixed Position */}
          <div className="absolute top-4 right-4 z-50 pointer-events-auto">
            <ColorSelector />
          </div>
          
          {/* Enhanced Bottom Controls */}
          <EnhancedBottomControls />
          
          {/* Simplified Status Bar */}
          <div className="h-6 bg-card/95 border-t border-border/50 backdrop-blur-sm flex items-center justify-between px-4 text-xs shadow-sm">
            <div className="flex items-center gap-6">
              <span className="font-medium text-foreground">
                {doc.selectedIds.length > 0 
                  ? `${doc.selectedIds.length} ${doc.selectedIds.length === 1 ? 'item' : 'items'} selected` 
                  : 'Ready'
                }
              </span>
              {doc.selectedIds.length === 1 && (() => {
                const node = doc.nodes.find(n => n.id === doc.selectedIds[0]);
                if (node) {
                  return (
                    <span className="text-foreground/70 font-mono">
                      X: {Math.round(node.x)}, Y: {Math.round(node.y)} | 
                      W: {Math.round(node.width)}, H: {Math.round(node.height)}
                    </span>
                  );
                }
              })()}
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
  );
};