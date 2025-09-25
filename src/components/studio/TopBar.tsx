import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Undo, Redo, Download, Settings, ArrowLeft, Box } from 'lucide-react';

import { useStudioStore } from '../../lib/studio/store';
import { useAppStore } from '../../store/useAppStore';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { exportPNG, exportSVG, exportPrintReady } from '@/lib/studio/export';
import { useToast } from '@/hooks/use-toast';
import { DesignSaveDialog } from './DesignSaveDialog';
import { AdvancedGridSystem } from './design-tools/AdvancedGridSystem';

export const TopBar = () => {
  const { doc, undo, redo, canUndo, canRedo, is3DMode, toggle3DMode, getCanvasElement } = useStudioStore();
  const { setCurrentDesign } = useAppStore();
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleExitStudio = () => {
    setCurrentDesign(null);
  };

  const handleExport = async () => {
    const canvas = getCanvasElement();
    if (!canvas) {
      toast({
        title: "Export Error",
        description: "Canvas not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportPrintReady(canvas, doc, {
        format: 'print-ready',
        dpi: 300,
        includeBleed: true,
        separateSurfaces: true,
        filename: doc.title || 'design'
      });
      
      toast({
        title: "Export Complete",
        description: "Your print-ready files have been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your design.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExitStudio}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Button>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-sm"></div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Design Studio
          </h1>
        </div>
        <div className="text-sm text-foreground/90 font-medium">
          {doc.title}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* History Actions Group */}
        <div className="flex items-center bg-card rounded-md p-1 gap-0.5 border border-border shadow-sm">
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
        <div className="flex items-center bg-card rounded-md p-1 gap-0.5 border border-border shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSaveDialogOpen(true)}
            className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-accent/80 hover:scale-[1.02] hover:shadow-sm"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-accent/80 hover:scale-[1.02] hover:shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </div>

        <div className="w-px h-6 bg-border/40 mx-2" />

        {/* 3D Mode Toggle */}
        <Button
          variant={is3DMode ? "default" : "ghost"}
          size="sm"
          onClick={toggle3DMode}
          className="h-8 px-3 text-xs font-medium transition-all duration-200 hover:bg-accent/80 hover:scale-[1.02]"
        >
          <Box className="w-3.5 h-3.5 mr-1.5" />
          3D
        </Button>

        <div className="w-px h-6 bg-border/40 mx-2" />

        {/* Advanced Grid System */}
        <AdvancedGridSystem />

        <div className="w-px h-6 bg-border/40 mx-2" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 transition-all duration-200 hover:bg-accent hover:scale-[1.05] hover:shadow-sm rounded-md"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <DesignSaveDialog 
        open={saveDialogOpen} 
        onOpenChange={setSaveDialogOpen}
        canvas={getCanvasElement()}
      />
    </div>
  );
};