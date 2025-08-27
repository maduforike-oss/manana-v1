import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudioStore } from '../../lib/studio/store';
import { TextNode, ShapeNode, ImageNode } from '../../lib/studio/types';
import { GOOGLE_FONTS, COLOR_SWATCHES } from '../../lib/studio/presets';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline,
  Palette,
  Settings,
  Move3D,
  RotateCw
} from 'lucide-react';

export const EnhancedPropertiesPanel = () => {
  const { doc, updateNode, alignToArtboard, distributeSelection } = useStudioStore();
  const [activeTab, setActiveTab] = useState('style');
  
  const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  if (!selectedNode) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Settings className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-2">No Element Selected</h3>
        <p className="text-sm text-muted-foreground">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedNode>) => {
    updateNode(selectedNode.id, updates);
  };

  const renderTextProperties = (node: TextNode) => (
    <div className="space-y-6">
      {/* Text Content */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Content</Label>
        <Input
          value={node.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          placeholder="Enter your text..."
          className="bg-background"
        />
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-foreground">Typography</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Font Family</Label>
            <Select value={node.fontFamily} onValueChange={(value) => handleUpdate({ fontFamily: value })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOOGLE_FONTS.map(font => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs text-muted-foreground">Font Weight</Label>
            <Select value={node.fontWeight.toString()} onValueChange={(value) => handleUpdate({ fontWeight: parseInt(value) })}>
              <SelectTrigger className="h-9">
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
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Font Size: {node.fontSize}px</Label>
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
          <Label className="text-xs text-muted-foreground">Text Alignment</Label>
          <div className="flex gap-1 mt-2">
            {[
              { align: 'left', icon: AlignLeft },
              { align: 'center', icon: AlignCenter },
              { align: 'right', icon: AlignRight }
            ].map(({ align, icon: Icon }) => (
              <Button
                key={align}
                variant={node.align === align ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUpdate({ align: align as any })}
                className="flex-1"
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Typography */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-foreground">Advanced</Label>
        
        <div>
          <Label className="text-xs text-muted-foreground">Letter Spacing: {node.letterSpacing}px</Label>
          <Slider
            value={[node.letterSpacing]}
            onValueChange={([value]) => handleUpdate({ letterSpacing: value })}
            min={-5}
            max={10}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Line Height: {node.lineHeight.toFixed(1)}</Label>
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
    </div>
  );

  const renderShapeProperties = (node: ShapeNode) => (
    <div className="space-y-6">
      {/* Shape Type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Shape</Label>
        <Badge variant="secondary" className="w-fit">
          {node.shape.charAt(0).toUpperCase() + node.shape.slice(1)}
        </Badge>
      </div>

      {/* Fill & Stroke */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-foreground">Appearance</Label>
        
        <div>
          <Label className="text-xs text-muted-foreground">Fill Color</Label>
          <div className="grid grid-cols-6 gap-2 mt-2 mb-3">
            {COLOR_SWATCHES.map(color => (
              <button
                key={color}
                className="w-8 h-8 rounded-md border-2 border-border hover:border-primary transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => handleUpdate({ fill: { type: 'solid', color } })}
              />
            ))}
          </div>
          <Input
            value={node.fill.color || '#3B82F6'}
            onChange={(e) => handleUpdate({ fill: { type: 'solid', color: e.target.value } })}
            placeholder="#3B82F6"
          />
        </div>

        {node.stroke && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground">Stroke Color</Label>
              <Input
                value={node.stroke.color}
                onChange={(e) => handleUpdate({ stroke: { ...node.stroke, color: e.target.value } })}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Stroke Width: {node.stroke.width}px</Label>
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
      </div>

      {/* Shape-specific properties */}
      {node.shape === 'rect' && (
        <div>
          <Label className="text-xs text-muted-foreground">Corner Radius: {node.radius || 0}px</Label>
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
          <Label className="text-xs text-muted-foreground">Points: {node.points || 5}</Label>
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
  );

  const renderColorProperties = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-foreground">Color Palette</Label>
        
        <div className="grid grid-cols-4 gap-3">
          {COLOR_SWATCHES.map(color => (
            <button
              key={color}
              className="aspect-square rounded-lg border-2 border-border hover:border-primary transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: color }}
              onClick={() => {
                if (selectedNode.type === 'text') {
                  handleUpdate({ fill: { type: 'solid', color } });
                } else if (selectedNode.type === 'shape') {
                  handleUpdate({ fill: { type: 'solid', color } });
                }
              }}
            />
          ))}
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Custom Color</Label>
          <Input
            type="color"
            value={
              selectedNode.type === 'text' ? 
                (selectedNode as TextNode).fill.color : 
                selectedNode.type === 'shape' ? 
                  (selectedNode as ShapeNode).fill.color : 
                  '#000000'
            }
            onChange={(e) => {
              if (selectedNode.type === 'text' || selectedNode.type === 'shape') {
                handleUpdate({ fill: { type: 'solid', color: e.target.value } });
              }
            }}
            className="mt-2 h-12"
          />
        </div>
      </div>
    </div>
  );

  const renderTransformProperties = () => (
    <div className="space-y-6">
      {/* Position & Size */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-foreground">Position & Size</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">X Position</Label>
            <Input
              type="number"
              value={Math.round(selectedNode.x)}
              onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Y Position</Label>
            <Input
              type="number"
              value={Math.round(selectedNode.y)}
              onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Width</Label>
            <Input
              type="number"
              value={Math.round(selectedNode.width)}
              onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 1 })}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Height</Label>
            <Input
              type="number"
              value={Math.round(selectedNode.height)}
              onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 1 })}
            />
          </div>
        </div>
      </div>

      {/* Rotation & Opacity */}
      <div className="space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Rotation: {Math.round(selectedNode.rotation)}°</Label>
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
          <Label className="text-xs text-muted-foreground">Opacity: {Math.round(selectedNode.opacity * 100)}%</Label>
          <Slider
            value={[selectedNode.opacity]}
            onValueChange={([value]) => handleUpdate({ opacity: value })}
            min={0}
            max={1}
            step={0.01}
            className="mt-2"
          />
        </div>
      </div>

      {/* Alignment */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-foreground">Alignment</Label>
        
        <div className="grid grid-cols-3 gap-2">
          {[
            { align: 'left', label: 'Left' },
            { align: 'center', label: 'Center' },
            { align: 'right', label: 'Right' },
            { align: 'top', label: 'Top' },
            { align: 'middle', label: 'Middle' },
            { align: 'bottom', label: 'Bottom' }
          ].map(({ align, label }) => (
            <Button
              key={align}
              variant="outline"
              size="sm"
              onClick={() => alignToArtboard(align as any)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <Move3D className="w-4 h-4" />
            Element Properties
          </h3>
          <Badge variant="secondary">
            {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Element
          </Badge>
        </div>

        {/* Tabbed Properties */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
            <TabsTrigger value="color" className="text-xs">Color</TabsTrigger>
            <TabsTrigger value="transform" className="text-xs">Transform</TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-6">
            {selectedNode.type === 'text' && renderTextProperties(selectedNode as TextNode)}
            {selectedNode.type === 'shape' && renderShapeProperties(selectedNode as ShapeNode)}
          </TabsContent>

          <TabsContent value="color">
            {renderColorProperties()}
          </TabsContent>

          <TabsContent value="transform">
            {renderTransformProperties()}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};