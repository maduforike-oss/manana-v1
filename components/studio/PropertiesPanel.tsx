"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useStudioStore } from '@/lib/studio/store';
import { TextNode, ShapeNode, ImageNode } from '@/lib/studio/types';
import { GOOGLE_FONTS, COLOR_SWATCHES } from '@/lib/studio/presets';
import { AlignLeft, AlignCenter, AlignRight, FlipHorizontal, FlipVertical } from 'lucide-react';

export const PropertiesPanel = () => {
  const { doc, updateNode, alignToArtboard, distributeSelection } = useStudioStore();
  
  const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Select an element to edit properties</p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedNode>) => {
    updateNode(selectedNode.id, updates);
  };

  const renderTextProperties = (node: TextNode) => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div>
          <Label>Text</Label>
          <Input
            value={node.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Font Family</Label>
          <Select value={node.fontFamily} onValueChange={(value) => handleUpdate({ fontFamily: value })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_FONTS.map(font => (
                <SelectItem key={font} value={font}>{font}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Font Size: {node.fontSize}px</Label>
          <Slider
            value={[node.fontSize]}
            onValueChange={([value]) => handleUpdate({ fontSize: value })}
            min={8}
            max={200}
            step={1}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Font Weight</Label>
          <Select value={node.fontWeight.toString()} onValueChange={(value) => handleUpdate({ fontWeight: parseInt(value) })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="300">Light</SelectItem>
              <SelectItem value="400">Regular</SelectItem>
              <SelectItem value="500">Medium</SelectItem>
              <SelectItem value="600">Semi Bold</SelectItem>
              <SelectItem value="700">Bold</SelectItem>
              <SelectItem value="800">Extra Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Text Align</Label>
          <div className="flex gap-1 mt-1">
            <Button
              variant={node.align === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUpdate({ align: 'left' })}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={node.align === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUpdate({ align: 'center' })}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={node.align === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUpdate({ align: 'right' })}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label>Color</Label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {COLOR_SWATCHES.map(color => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-border"
                style={{ backgroundColor: color }}
                onClick={() => handleUpdate({ fill: { type: 'solid', color } })}
              />
            ))}
          </div>
          <Input
            value={node.fill.color || '#000000'}
            onChange={(e) => handleUpdate({ fill: { type: 'solid', color: e.target.value } })}
            className="mt-2"
            placeholder="#000000"
          />
        </div>

        <Separator />
        
        <div>
          <Label>Letter Spacing: {node.letterSpacing}px</Label>
          <Slider
            value={[node.letterSpacing]}
            onValueChange={([value]) => handleUpdate({ letterSpacing: value })}
            min={-10}
            max={20}
            step={0.5}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Line Height: {node.lineHeight}</Label>
          <Slider
            value={[node.lineHeight]}
            onValueChange={([value]) => handleUpdate({ lineHeight: value })}
            min={0.8}
            max={3}
            step={0.1}
            className="mt-2"
          />
        </div>
      </div>
    </ScrollArea>
  );

  const renderShapeProperties = (node: ShapeNode) => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div>
          <Label>Fill Color</Label>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {COLOR_SWATCHES.map(color => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-border"
                style={{ backgroundColor: color }}
                onClick={() => handleUpdate({ fill: { type: 'solid', color } })}
              />
            ))}
          </div>
          <Input
            value={node.fill.color || '#3B82F6'}
            onChange={(e) => handleUpdate({ fill: { type: 'solid', color: e.target.value } })}
            className="mt-2"
            placeholder="#3B82F6"
          />
        </div>

        {node.stroke && (
          <>
            <div>
              <Label>Stroke Color</Label>
              <Input
                value={node.stroke.color}
                onChange={(e) => handleUpdate({ stroke: { ...node.stroke, color: e.target.value } })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Stroke Width: {node.stroke.width}px</Label>
              <Slider
                value={[node.stroke.width]}
                onValueChange={([value]) => handleUpdate({ stroke: { ...node.stroke, width: value } })}
                min={0}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>
          </>
        )}

        {node.shape === 'rect' && (
          <div>
            <Label>Corner Radius: {node.radius || 0}px</Label>
            <Slider
              value={[node.radius || 0]}
              onValueChange={([value]) => handleUpdate({ radius: value })}
              min={0}
              max={50}
              step={1}
              className="mt-2"
            />
          </div>
        )}

        {node.shape === 'star' && (
          <div>
            <Label>Points: {node.points || 5}</Label>
            <Slider
              value={[node.points || 5]}
              onValueChange={([value]) => handleUpdate({ points: value })}
              min={3}
              max={12}
              step={1}
              className="mt-2"
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );

  const renderCommonProperties = () => (
    <div className="p-4 space-y-4">
      <Separator />
      
      <div>
        <Label>Position & Size</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <Label className="text-xs">X</Label>
            <Input
              type="number"
              value={Math.round(selectedNode.x)}
              onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="text-xs">Y</Label>
            <Input
              type="number"
              value={Math.round(selectedNode.y)}
              onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="text-xs">W</Label>
            <Input
              type="number"
              value={Math.round(selectedNode.width)}
              onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label className="text-xs">H</Label>
            <Input
              type="number"
              value={Math.round(selectedNode.height)}
              onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 1 })}
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Rotation: {Math.round(selectedNode.rotation)}°</Label>
        <Slider
          value={[selectedNode.rotation]}
          onValueChange={([value]) => handleUpdate({ rotation: value })}
          min={-180}
          max={180}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label>Opacity: {Math.round(selectedNode.opacity * 100)}%</Label>
        <Slider
          value={[selectedNode.opacity]}
          onValueChange={([value]) => handleUpdate({ opacity: value })}
          min={0}
          max={1}
          step={0.01}
          className="mt-2"
        />
      </div>

      <Separator />

      <div>
        <Label>Align to Artboard</Label>
        <div className="grid grid-cols-3 gap-1 mt-2">
          <Button variant="outline" size="sm" onClick={() => alignToArtboard('left')}>
            Left
          </Button>
          <Button variant="outline" size="sm" onClick={() => alignToArtboard('center')}>
            Center
          </Button>
          <Button variant="outline" size="sm" onClick={() => alignToArtboard('right')}>
            Right
          </Button>
          <Button variant="outline" size="sm" onClick={() => alignToArtboard('top')}>
            Top
          </Button>
          <Button variant="outline" size="sm" onClick={() => alignToArtboard('middle')}>
            Middle
          </Button>
          <Button variant="outline" size="sm" onClick={() => alignToArtboard('bottom')}>
            Bottom
          </Button>
        </div>
      </div>

      {doc.selectedIds.length > 2 && (
        <div>
          <Label>Distribute</Label>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => distributeSelection('horizontal')}>
              Horizontal
            </Button>
            <Button variant="outline" size="sm" onClick={() => distributeSelection('vertical')}>
              Vertical
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {selectedNode.type === 'text' && renderTextProperties(selectedNode as TextNode)}
      {selectedNode.type === 'shape' && renderShapeProperties(selectedNode as ShapeNode)}
      {renderCommonProperties()}
    </div>
  );
};