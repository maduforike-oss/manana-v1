"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Undo2, Redo2, Grid3x3, Ruler, Download, 
  HelpCircle, Eye, ZoomIn, ZoomOut, Maximize2 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStudioStore } from '@/lib/studio/store';
import { exportPNG, exportSVG, exportPDF } from '@/lib/studio/export';

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
    <div className="h-14 bg-card border-b flex items-center justify-between px-4 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
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
            className="w-48 transition-all duration-200"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-sm font-medium hover:text-primary transition-colors duration-200 px-2 py-1 rounded hover:bg-accent"
          >
            {doc.title}
          </button>
        )}
      </div>

      {/* Center Section - Zoom Controls */}
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={zoomToFit}
          className="hover:bg-background transition-all duration-200"
        >
          <Maximize2 className="w-4 h-4 mr-1" />
          Fit
        </Button>
        
        <Button 
          variant={zoom === 1 ? "secondary" : "ghost"} 
          size="sm" 
          onClick={() => setZoom(1)}
          className="hover:bg-background transition-all duration-200"
        >
          100%
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={zoomToFill}
          className="hover:bg-background transition-all duration-200"
        >
          Fill
        </Button>
        
        <div className="flex items-center gap-1 border-l pl-2 ml-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setZoom(zoom * 0.9)}
            className="hover:bg-background transition-all duration-200 hover:scale-105"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-xs w-12 text-center font-mono bg-background rounded px-1 py-0.5">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setZoom(zoom * 1.1)}
            className="hover:bg-background transition-all duration-200 hover:scale-105"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant={history.length > 1 ? "ghost" : "ghost"}
            size="sm"
            onClick={undo}
            disabled={history.length <= 1}
            className="hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant={redoStack.length > 0 ? "ghost" : "ghost"}
            size="sm"
            onClick={redo}
            disabled={redoStack.length === 0}
            className="hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 mr-2">
          <Button
            variant={snapEnabled ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleSnap}
            className="hover:scale-105 transition-all duration-200"
          >
            Snap
          </Button>

          <Button
            variant={doc.canvas.showGrid ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleGrid}
            className="hover:scale-105 transition-all duration-200"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>

          <Button
            variant={doc.canvas.showRulers ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleRulers}
            className="hover:scale-105 transition-all duration-200"
          >
            <Ruler className="w-4 h-4" />
          </Button>

          <Button
            variant={mockup.opacity > 0 ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setMockup({ opacity: mockup.opacity > 0 ? 0 : 0.8 })}
            className="hover:scale-105 transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-1" />
            Mockup
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="sm" 
              className="hover:scale-105 transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-in slide-in-from-top-2">
            <DropdownMenuItem 
              onClick={() => handleExport('png')}
              className="hover:bg-accent transition-colors duration-200"
            >
              PNG
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExport('png-transparent')}
              className="hover:bg-accent transition-colors duration-200"
            >
              PNG (Transparent)
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExport('svg')}
              className="hover:bg-accent transition-colors duration-200"
            >
              SVG
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExport('print-150')}
              className="hover:bg-accent transition-colors duration-200"
            >
              Print PNG @150 DPI
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExport('print-300')}
              className="hover:bg-accent transition-colors duration-200"
            >
              Print PNG @300 DPI
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleExport('pdf')}
              className="hover:bg-accent transition-colors duration-200 opacity-50"
            >
              PDF (Coming Soon)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShortcuts(true)}
          className="hover:scale-105 transition-all duration-200 ml-1"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};