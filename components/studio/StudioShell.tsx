"use client";

import { useEffect } from 'react';
import { TopBar } from './TopBar';
import { LeftTools } from './LeftTools';
import { RightProps } from './RightProps';
import { CanvasStage } from './CanvasStage';
import { useStudioStore } from '@/lib/studio/store';
import { ShortcutsDialog } from './ShortcutsDialog';

export const StudioShell = () => {
  const { saveSnapshot } = useStudioStore();

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
      
      <div className="flex-1 flex overflow-hidden">
        <LeftTools />
        
        <div className="flex-1 flex flex-col">
          <CanvasStage />
          
          {/* Status Bar */}
          <div className="h-8 bg-muted border-t flex items-center px-4 text-xs text-muted-foreground">
            <span>Ready</span>
          </div>
        </div>
        
        <RightProps />
      </div>
      
      <ShortcutsDialog />
    </div>
  );
};