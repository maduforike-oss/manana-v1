import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Undo, Redo, Download, Settings } from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';

export const TopBar = () => {
  const { doc, undo, redo, canUndo, canRedo } = useStudioStore();

  return (
    <div className="h-12 bg-card border-b border-workspace-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Design Studio
        </h1>
        <div className="text-sm text-muted-foreground">
          {doc.title}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="text-xs"
        >
          <Undo className="w-4 h-4 mr-1" />
          Undo
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="text-xs"
        >
          <Redo className="w-4 h-4 mr-1" />
          Redo
        </Button>

        <div className="w-px h-6 bg-workspace-border mx-2" />

        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};