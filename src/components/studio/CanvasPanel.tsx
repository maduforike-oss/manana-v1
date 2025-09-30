"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudioStore } from '../../lib/studio/store';
import { CANVAS_PRESETS } from '../../lib/studio/presets';

export const CanvasPanel = () => {
  const { doc, updateCanvas } = useStudioStore();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Canvas Preset</Label>
          <Select 
            value="Custom" 
            onValueChange={(preset) => {
              if (preset !== "Custom") {
                updateCanvas(CANVAS_PRESETS[preset]);
              }
            }}
          >
            <SelectTrigger className="bg-background border-border/50 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50">
              {Object.keys(CANVAS_PRESETS).map(preset => (
                <SelectItem key={preset} value={preset} className="text-foreground hover:bg-accent/80">
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-semibold text-foreground">Dimensions</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-foreground/70">Width (px)</Label>
              <Input
                type="number"
                value={doc.canvas.width || 1200}
                onChange={(e) => updateCanvas({ width: parseInt(e.target.value) || 1200 })}
                className="bg-background border-border/50 text-foreground font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground/70">Height (px)</Label>
              <Input
                type="number"
                value={doc.canvas.height || 1200}
                onChange={(e) => updateCanvas({ height: parseInt(e.target.value) || 1200 })}
                className="bg-background border-border/50 text-foreground font-mono"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Background Color</Label>
          <Input
            value={doc.canvas.background || "transparent"}
            onChange={(e) => updateCanvas({ background: e.target.value })}
            className="bg-background border-border/50 text-foreground font-mono"
            placeholder="transparent or #ffffff"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Print Quality</Label>
          <Select 
            value={doc.canvas.dpi?.toString() || "300"} 
            onValueChange={(value) => updateCanvas({ dpi: parseInt(value) as 150 | 300 })}
          >
            <SelectTrigger className="bg-background border-border/50 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50">
              <SelectItem value="150" className="text-foreground hover:bg-accent/80">
                150 DPI (Web)
              </SelectItem>
              <SelectItem value="300" className="text-foreground hover:bg-accent/80">
                300 DPI (Print)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ScrollArea>
  );
};