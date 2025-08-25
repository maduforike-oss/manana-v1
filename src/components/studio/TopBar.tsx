import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Undo, Redo, Download, Settings } from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';

export const TopBar = () => {
  const { doc, undo, redo, canUndo, canRedo } = useStudioStore();

  return (
    <div className="h-14 bg-gradient-to-b from-card to-card/95 border-b border-border/50 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-sm"></div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent tracking-tight">
            Design Studio
          </h1>
        </div>
        <div className="text-sm text-muted-foreground/80 font-medium">
          {doc.title}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* History Actions Group */}
        <div className="flex items-center bg-background/60 rounded-md p-1 gap-0.5 border border-border/30 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-accent/80 hover:scale-[1.02] disabled:opacity-40"
          >
            <Undo className="w-3.5 h-3.5 mr-1.5" />
            Undo
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-accent/80 hover:scale-[1.02] disabled:opacity-40"
          >
            <Redo className="w-3.5 h-3.5 mr-1.5" />
            Redo
          </Button>
        </div>

        <div className="w-px h-6 bg-border/40 mx-2" />

        {/* File Actions Group */}
        <div className="flex items-center bg-background/60 rounded-md p-1 gap-0.5 border border-border/30 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-accent/80 hover:scale-[1.02] hover:shadow-sm"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-accent/80 hover:scale-[1.02] hover:shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </div>

        <div className="w-px h-6 bg-border/40 mx-2" />

        {/* Settings */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 transition-all duration-200 hover:bg-accent/80 hover:scale-[1.05] hover:shadow-sm rounded-md"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};