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
    <div className="h-14 bg-card border-b flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold">Manana Studio</div>
        
        {isEditingTitle ? (
          <Input
            value={doc.title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsEditingTitle(false);
            }}
            className="w-48"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-sm font-medium hover:text-primary"
          >
            {doc.title}
          </button>
        )}
      </div>

      {/* Center Section - Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={zoomToFit}>
          <Maximize2 className="w-4 h-4 mr-1" />
          Fit
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => setZoom(1)}>
          100%
        </Button>
        
        <Button variant="outline" size="sm" onClick={zoomToFill}>
          Fill
        </Button>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoom(zoom * 0.9)}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-xs w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setZoom(zoom * 1.1)}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button
          variant={history.length > 1 ? "outline" : "outline"}
          size="sm"
          onClick={undo}
          disabled={history.length <= 1}
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant={redoStack.length > 0 ? "outline" : "outline"}
          size="sm"
          onClick={redo}
          disabled={redoStack.length === 0}
        >
          <Redo2 className="w-4 h-4" />
        </Button>

        <Button
          variant={snapEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleSnap}
        >
          Snap
        </Button>

        <Button
          variant={doc.canvas.showGrid ? "default" : "outline"}
          size="sm"
          onClick={toggleGrid}
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>

        <Button
          variant={doc.canvas.showRulers ? "default" : "outline"}
          size="sm"
          onClick={toggleRulers}
        >
          <Ruler className="w-4 h-4" />
        </Button>

        <Button
          variant={mockup.opacity > 0 ? "default" : "outline"}
          size="sm"
          onClick={() => setMockup({ opacity: mockup.opacity > 0 ? 0 : 0.8 })}
        >
          <Eye className="w-4 h-4" />
          Mockup
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('png')}>
              PNG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('png-transparent')}>
              PNG (Transparent)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('svg')}>
              SVG
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('print-150')}>
              Print PNG @150 DPI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('print-300')}>
              Print PNG @300 DPI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              PDF (Coming Soon)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowShortcuts(true)}
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};