"use client";

import { useEffect, useState } from 'react';
import { TopBar } from './TopBar';
import { LeftTools } from './LeftTools';
import { RightProps } from './RightProps';
import { CanvasStage } from './CanvasStage';
import { useStudioStore } from '@/lib/studio/store';
import { ShortcutsDialog } from './ShortcutsDialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Layers, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StudioShell = () => {
  const { saveSnapshot, doc } = useStudioStore();
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('properties');

  useEffect(() => {
    // Load autosaved design on mount
    const autosaved = localStorage.getItem('studio-autosave');
    if (autosaved) {
      try {
        const doc = JSON.parse(autosaved);
        useStudioStore.setState({ doc });
      } catch (error) {
        console.error('Failed to load autosaved design:', error);
      }
    }
    
    // Save initial snapshot
    saveSnapshot();

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const { activeTool, setActiveTool, undo, redo, doc, removeNode, duplicate } = useStudioStore.getState();
      
      // Don't handle shortcuts if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'd':
            e.preventDefault();
            doc.selectedIds.forEach(id => duplicate(id));
            break;
          case 'a':
            e.preventDefault();
            useStudioStore.getState().selectMany(doc.nodes.map(n => n.id));
            break;
        }
      } else {
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
          case 'i':
            setActiveTool('image');
            break;
          case 'r':
            setActiveTool('rect');
            break;
          case 'c':
            setActiveTool('circle');
            break;
          case 'l':
            setActiveTool('line');
            break;
          case 's':
            setActiveTool('star');
            break;
          case 'p':
            setActiveTool('brush');
            break;
          case 'delete':
          case 'backspace':
            doc.selectedIds.forEach(id => removeNode(id));
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveSnapshot]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar />
      
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Tools Panel */}
        <div className={cn(
          "transition-all duration-300 ease-in-out border-r bg-card",
          leftPanelCollapsed ? "w-0 overflow-hidden" : "w-16"
        )}>
          <LeftTools collapsed={leftPanelCollapsed} />
        </div>

        {/* Left Panel Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-6 rounded-r-md bg-card border border-l-0 shadow-sm hover:bg-accent transition-all duration-200",
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
        <div className="flex-1 flex flex-col min-w-0">
          <CanvasStage />
          
          {/* Enhanced Status Bar */}
          <div className="h-10 bg-card border-t flex items-center justify-between px-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                {doc.selectedIds.length > 0 
                  ? `${doc.selectedIds.length} selected` 
                  : 'Ready'
                }
              </span>
              {doc.selectedIds.length === 1 && (() => {
                const node = doc.nodes.find(n => n.id === doc.selectedIds[0]);
                if (node) {
                  return (
                    <span className="text-muted-foreground">
                      {Math.round(node.x)}, {Math.round(node.y)} | 
                      {Math.round(node.width)} × {Math.round(node.height)}
                    </span>
                  );
                }
              })()}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Canvas: {doc.canvas.width} × {doc.canvas.height}px
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Properties Panel */}
        <div className={cn(
          "transition-all duration-300 ease-in-out border-l bg-card",
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
            "absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-6 rounded-l-md bg-card border border-r-0 shadow-sm hover:bg-accent transition-all duration-200",
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
                className="shadow-lg"
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
                className="shadow-lg"
              >
                <Layers className="w-4 h-4 mr-1" />
                Properties
              </Button>
            )}
          </div>
        )}
      </div>
      
      <ShortcutsDialog />
    </div>
  );
};