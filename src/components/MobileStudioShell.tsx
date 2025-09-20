import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, Palette, Settings, Save, Eye } from 'lucide-react';
import { useStudioStore } from '@/lib/studio/store';
import { useAppStore } from '@/store/useAppStore';
import { SimplifiedCanvasStage } from './studio/SimplifiedCanvasStage';
import { ColorSelector } from './studio/ColorSelector';
import { GarmentSelector } from './studio/GarmentSelector';
import { toast } from 'sonner';

export const MobileStudioShell = () => {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const { currentDesign, saveDesign } = useAppStore();
  const { doc, mockup, zoom, panOffset, setActiveTool, activeTool } = useStudioStore();

  // Quick save functionality
  const handleQuickSave = async () => {
    if (!currentDesign) return;
    
    try {
      const canvasData = {
        doc,
        zoom,
        panOffset,
        mockup,
      };

      await saveDesign({
        id: currentDesign.id,
        canvas: JSON.stringify(canvasData),
        updatedAt: new Date(),
      });
      
      toast.success('Design saved!');
    } catch (error) {
      toast.error('Failed to save design');
    }
  };

  // Prevent zoom on double tap
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventZoom = (e: TouchEvent) => {
      const t2 = e.timeStamp;
      const t1 = (e.currentTarget as any).dataset.lastTouch || t2;
      const dt = t2 - t1;
      const fingers = e.touches.length;
      (e.currentTarget as any).dataset.lastTouch = t2;

      if (!dt || dt > 500 || fingers > 1) return;
      e.preventDefault();
      (e.target as HTMLElement).click();
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sheet open={activeSheet === 'tools'} onOpenChange={(open) => setActiveSheet(open ? 'tools' : null)}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="p-4 space-y-4">
                <h3 className="font-semibold">Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'select', label: 'Select', icon: '↖️' },
                    { id: 'text', label: 'Text', icon: '📝' },
                    { id: 'rectangle', label: 'Rectangle', icon: '⬜' },
                    { id: 'circle', label: 'Circle', icon: '⭕' },
                    { id: 'line', label: 'Line', icon: '📏' },
                    { id: 'brush', label: 'Brush', icon: '🖌️' },
                  ].map(tool => (
                    <Button
                      key={tool.id}
                      variant={activeTool === tool.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setActiveTool(tool.id as any);
                        setActiveSheet(null);
                      }}
                      className="flex flex-col gap-1 h-16"
                    >
                      <span className="text-lg">{tool.icon}</span>
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <h1 className="font-semibold text-sm truncate">
            {currentDesign?.name || 'New Design'}
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <Sheet open={activeSheet === 'colors'} onOpenChange={(open) => setActiveSheet(open ? 'colors' : null)}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Palette className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Colors & Style</h3>
                <ColorSelector />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={activeSheet === 'garment'} onOpenChange={(open) => setActiveSheet(open ? 'garment' : null)}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Garment</h3>
                <GarmentSelector />
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="sm" onClick={handleQuickSave}>
            <Save className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <SimplifiedCanvasStage />
      </div>

      {/* Mobile Bottom Bar */}
      <div className="flex items-center justify-between p-3 border-t bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
            <span className="text-xs ml-1">Preview</span>
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Zoom: {Math.round(zoom * 100)}%
        </div>
        
        <div className="flex gap-1">
          <Button size="sm" onClick={handleQuickSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};