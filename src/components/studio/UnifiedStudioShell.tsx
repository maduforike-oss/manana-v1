import React, { useEffect, useState, useCallback } from 'react';
import { TopBar } from './TopBar';
import { UnifiedLeftTools } from './design-tools/UnifiedLeftTools';
import { RightProps } from './RightProps';
import { UnifiedCanvasStage } from './design-tools/UnifiedCanvasStage';
import { ColorSelector } from './ColorSelector';
import { EnhancedBottomControls } from './EnhancedBottomControls';
import { StudioHub } from './StudioHub';
import { useSetActiveTool, useUndo, useRedo, useSetZoom, useSetPanOffset } from '../../lib/studio/storeSelectors';
import { useAppStore } from '../../store/useAppStore';
import { useStudioStore } from '../../lib/studio/store';
import { useViewportManager } from './EnhancedViewportManager';
import { AsyncStudioInitializer } from './optimized/AsyncStudioInitializer';
import { useStudioSync } from '../../hooks/useStudioSync';
import { PurchasedDesignLoader } from './PurchasedDesignLoader';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { PricingCalculator } from './PricingCalculator';
import { PrintMethodValidator } from './PrintMethodValidator';
import { CanvasGrid } from './CanvasGrid';
import { CanvasRulers } from './CanvasRulers';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Layers, Settings, Grid, Ruler, Eye, Lock, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const UnifiedStudioShell = () => {
  // All hooks must be called at the top level, before any conditional returns
  const { currentDesign, saveDesign } = useAppStore();
  const setActiveTool = useSetActiveTool();
  const undo = useUndo();
  const redo = useRedo();
  const setZoom = useSetZoom();
  const setPanOffset = useSetPanOffset();
  const { 
    doc, 
    zoom, 
    panOffset, 
    loadStudioFromAppDesign, 
    toggleGrid, 
    toggleRulers, 
    updateCanvas 
  } = useStudioStore();
  const { toggleGrid: vmToggleGrid, toggleRulers: vmToggleRulers, toggleSnap, toggleBoundingBox } = useViewportManager();
  
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('design');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Sync studio state with app store
  useStudioSync();

  const loadPurchasedDesign = useCallback(async () => {
    if (!currentDesign) return;
    
    try {
      await loadStudioFromAppDesign(currentDesign);
      
      // Enable advanced features for purchased designs
      updateCanvas({
        showGrid: true,
        showRulers: true,
        showGuides: true,
        safeAreaPct: 10,
      });
      
      toast("Design loaded with full editing capabilities");
    } catch (error) {
      console.error('Failed to load purchased design:', error);
      toast("Failed to load design. Creating new one.");
    } finally {
      setIsLoading(false);
    }
  }, [currentDesign, loadStudioFromAppDesign, updateCanvas]);

  // Load purchased design when currentDesign changes
  useEffect(() => {
    if (currentDesign?.isPurchased && !isLoading) {
      setIsLoading(true);
      loadPurchasedDesign();
    }
  }, [currentDesign?.id, currentDesign?.isPurchased, isLoading, loadPurchasedDesign]);

  // Enhanced auto-save with status indication
  const handleAutoSave = useCallback(async () => {
    if (!currentDesign) return;
    
    setAutoSaveStatus('saving');
    try {
      const canvasData = {
        doc,
        zoom,
        panOffset,
        timestamp: Date.now(),
      };

      await saveDesign({
        id: currentDesign.id,
        canvas: JSON.stringify(canvasData),
        updatedAt: new Date(),
      });
      
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [doc, zoom, panOffset, currentDesign, saveDesign]);

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(handleAutoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [handleAutoSave]);

  // Enhanced keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Non-tool shortcuts (tools are handled by UnifiedKeyboardHandler)
    switch (e.key.toLowerCase()) {
      case 'r':
        if (e.shiftKey) {
          vmToggleRulers();
          e.preventDefault();
        }
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
      case '=':
      case '+':
        if (e.ctrlKey || e.metaKey) {
          setZoom(Math.min(zoom * 1.2, 5));
          e.preventDefault();
        }
        break;
      case '-':
        if (e.ctrlKey || e.metaKey) {
          setZoom(Math.max(zoom / 1.2, 0.1));
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
      case 'g':
        if (e.ctrlKey || e.metaKey) {
          vmToggleGrid();
          e.preventDefault();
        }
        break;
      case 's':
        if (e.ctrlKey || e.metaKey) {
          handleAutoSave();
          e.preventDefault();
        }
        break;
      case 'tab':
        e.preventDefault();
        setLeftPanelCollapsed(!leftPanelCollapsed);
        break;
      case 'p':
        if (!e.ctrlKey && !e.metaKey) {
          setActiveRightTab('pricing');
        }
        break;
    }
  }, [
    setActiveTool, vmToggleRulers, vmToggleGrid, undo, redo, zoom, 
    setZoom, setPanOffset, handleAutoSave, leftPanelCollapsed, setLeftPanelCollapsed
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // If no design is selected, show the studio hub
  if (!currentDesign) {
    return <StudioHub />;
  }


  if (isLoading) {
    return <PurchasedDesignLoader />;
  }

  return (
    <AsyncStudioInitializer onInitialized={() => setActiveRightTab('design')}>
      <div className="h-screen flex flex-col bg-background text-foreground relative">
        {/* Enhanced Top Bar with additional controls */}
        <div className="relative">
          <TopBar />
          
          {/* Advanced Controls Bar */}
          <div className="h-12 bg-card/95 border-b border-border/50 backdrop-blur-sm flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={vmToggleGrid}
                className={cn("h-8", doc.canvas.showGrid && "bg-accent")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={vmToggleRulers}
                className={cn("h-8", doc.canvas.showRulers && "bg-accent")}
              >
                <Ruler className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBoundingBox}
                className="h-8"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <AutoSaveIndicator status={autoSaveStatus} />
              <PrintMethodValidator />
              <PricingCalculator />
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Tools Panel */}
          <div className={cn(
            "transition-all duration-300 ease-in-out bg-card border-r border-border",
            leftPanelCollapsed ? "w-0 overflow-hidden" : "w-16"
          )}>
            <UnifiedLeftTools collapsed={leftPanelCollapsed} />
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
          
          {/* Main Canvas Area with Enhanced Features */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Main Functional Canvas */}
            <UnifiedCanvasStage />
            
            {/* Floating Help Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast("Studio Help", {
                  description: "V=Select, H=Pan, T=Text, R=Rectangle, C=Circle, B=Brush. Scroll to zoom, drag to pan.",
                  duration: 5000
                });
              }}
              className="absolute bottom-20 right-4 z-50 bg-card/95 backdrop-blur-sm border-border/50"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </Button>
            
            {/* Floating Controls */}
            <div className="absolute top-4 right-4 z-50 pointer-events-auto">
              <ColorSelector />
            </div>
            
            {/* Enhanced Bottom Controls with Print Analysis */}
            <EnhancedBottomControls />
            
            {/* Enhanced Status Bar */}
            <div className="h-8 bg-card/95 border-t border-border/50 backdrop-blur-sm flex items-center justify-between px-4 text-xs">
              <div className="flex items-center gap-6">
                <span className="font-medium text-foreground">
                  {currentDesign?.isPurchased ? 'Purchased Design' : 'Ready'}
                </span>
                {currentDesign && (
                  <span className="text-muted-foreground">{currentDesign.name}</span>
                )}
                <span className="text-muted-foreground">
                  Zoom: {Math.round(zoom * 100)}%
                </span>
                <span className="text-muted-foreground">
                  Nodes: {doc.nodes.length}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {doc.selectedIds.length > 0 && (
                  <span className="text-muted-foreground">
                    Selected: {doc.selectedIds.length}
                  </span>
                )}
                <span className="text-muted-foreground">
                  {doc.canvas.width} × {doc.canvas.height}px
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Right Properties Panel */}
          <div className={cn(
            "transition-all duration-300 ease-in-out bg-card border-l border-border",
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
            <div className="absolute top-4 left-4 z-20 flex gap-2">
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