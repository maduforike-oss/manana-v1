"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Undo2, Redo2, Grid3x3, Ruler, Download, 
  HelpCircle, Eye, ZoomIn, ZoomOut, Maximize2, Camera
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStudioStore } from '../../lib/studio/store';
import { exportPNG, exportSVG, exportPDF } from '../../lib/studio/export';
import { useStaffStatus } from '@/hooks/useStaffStatus';
import { StudioTemplateUploader } from './StudioTemplateUploader';

export const TopBar = () => {
  const { 
    doc, 
    zoom, 
    setZoom, 
    undo, 
    redo, 
    history, 
    redoStack,
    snapEnabled,
    toggleSnap,
    toggleGrid,
    toggleRulers,
    setTitle,
    mockup,
    setMockup
  } = useStudioStore();
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTemplateUploader, setShowTemplateUploader] = useState(false);
  const { isStaff } = useStaffStatus();

  const handleExport = async (format: 'png' | 'png-transparent' | 'svg' | 'pdf' | 'print-150' | 'print-300') => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    switch (format) {
      case 'png':
        await exportPNG(canvas, doc, { format: 'png', transparent: false });
        break;
      case 'png-transparent':
        await exportPNG(canvas, doc, { format: 'png', transparent: true });
        break;
      case 'svg':
        exportSVG(doc);
        break;
      case 'print-150':
        await exportPNG(canvas, doc, { format: 'png', dpi: 150, includeBleed: true });
        break;
      case 'print-300':
        await exportPNG(canvas, doc, { format: 'png', dpi: 300, includeBleed: true });
        break;
      case 'pdf':
        exportPDF(doc);
        break;
    }
  };

  const zoomToFit = () => {
    // Calculate zoom to fit artboard in viewport
    const viewport = { width: 800, height: 600 }; // Approximate canvas area
    const scaleX = viewport.width / doc.canvas.width;
    const scaleY = viewport.height / doc.canvas.height;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9; // 90% to add padding
    setZoom(scale);
  };

  const zoomToFill = () => {
    const viewport = { width: 800, height: 600 };
    const scaleX = viewport.width / doc.canvas.width;
    const scaleY = viewport.height / doc.canvas.height;
    const scale = Math.max(scaleX, scaleY);
    setZoom(scale);
  };

  return (
    <div className="h-14 studio-panel border-b flex items-center justify-between px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-studio-accent-cyan/5 animate-[rotate-gradient_8s_ease-in-out_infinite] bg-[length:200%_200%]" />
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="text-lg font-bold text-foreground animate-[float_3s_ease-in-out_infinite]">
            Manana Studio
          </div>
        
          {isEditingTitle ? (
            <Input
              value={doc.title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              className="w-48 neon-border bg-studio-surface/50 backdrop-blur transition-all duration-200"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-primary/50"
            >
              {doc.title}
            </button>
          )}
        </div>

        {/* Center Section - Zoom Controls */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={zoomToFit}
            className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            Fit
          </Button>
          
          <Button 
            variant={zoom === 1 ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setZoom(1)}
            className={zoom === 1 ? "studio-tool active" : "hover:bg-primary/10 hover:text-primary transition-all duration-200"}
          >
            100%
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={zoomToFill}
            className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
          >
            Fill
          </Button>
        
          <div className="flex items-center gap-1 border-l border-studio-border pl-2 ml-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setZoom(zoom * 0.9)}
              className="studio-tool hover:scale-105"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-xs w-12 text-center font-mono text-foreground bg-card rounded px-1 py-0.5 border border-border">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setZoom(zoom * 1.1)}
              className="studio-tool hover:scale-105"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={history.length <= 1}
              className="studio-tool disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={redoStack.length === 0}
              className="studio-tool disabled:opacity-30"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSnap}
              className={snapEnabled ? "studio-tool active" : "studio-tool"}
            >
              Snap
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleGrid}
              className={doc.canvas.showGrid ? "studio-tool active" : "studio-tool"}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRulers}
              className={doc.canvas.showRulers ? "studio-tool active" : "studio-tool"}
            >
              <Ruler className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMockup({ opacity: mockup.opacity > 0 ? 0 : 0.8 })}
              className={mockup.opacity > 0 ? "studio-tool active" : "studio-tool"}
            >
              <Eye className="w-4 h-4 mr-1" />
              Mockup
            </Button>
          </div>

          {/* Admin Template Upload Button */}
          {isStaff && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplateUploader(true)}
              className="studio-tool mr-2"
              title="Upload garment template (Admin only)"
            >
              <Camera className="w-4 h-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                className="studio-tool bg-primary hover:bg-primary-glow text-primary-foreground shadow-neon"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel neon-border animate-in slide-in-from-top-2 z-50">
              <DropdownMenuItem 
                onClick={() => handleExport('png')}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                PNG
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('png-transparent')}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                PNG (Transparent)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('svg')}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                SVG
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('print-150')}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                Print PNG @150 DPI
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('print-300')}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
              >
                Print PNG @300 DPI
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('pdf')}
                className="hover:bg-primary/10 hover:text-primary transition-all duration-200 opacity-50"
              >
                PDF (Coming Soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts(true)}
            className="studio-tool ml-1"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Template Uploader Modal */}
      <StudioTemplateUploader
        open={showTemplateUploader}
        onOpenChange={setShowTemplateUploader}
      />
    </div>
  );
};