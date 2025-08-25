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
      <div className="p-4 space-y-4">
        <div>
          <Label>Preset</Label>
          <Select 
            value="Custom" 
            onValueChange={(preset) => {
              if (preset !== "Custom") {
                updateCanvas(CANVAS_PRESETS[preset]);
              }
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CANVAS_PRESETS).map(preset => (
                <SelectItem key={preset} value={preset}>{preset}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Width</Label>
            <Input
              type="number"
              value={doc.canvas.width}
              onChange={(e) => updateCanvas({ width: parseInt(e.target.value) || 1200 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Height</Label>
            <Input
              type="number"
              value={doc.canvas.height}
              onChange={(e) => updateCanvas({ height: parseInt(e.target.value) || 1200 })}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Background</Label>
          <Input
            value={doc.canvas.background}
            onChange={(e) => updateCanvas({ background: e.target.value })}
            className="mt-1"
            placeholder="transparent or #color"
          />
        </div>

        <div>
          <Label>DPI</Label>
          <Select 
            value={doc.canvas.dpi.toString()} 
            onValueChange={(value) => updateCanvas({ dpi: parseInt(value) as 150 | 300 })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="150">150 DPI</SelectItem>
              <SelectItem value="300">300 DPI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ScrollArea>
  );
};