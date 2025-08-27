"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useStudioStore } from '../../lib/studio/store';
import { TextNode, ShapeNode } from '../../lib/studio/types';
import { GOOGLE_FONTS, COLOR_SWATCHES } from '../../lib/studio/presets';
import { AlignLeft, AlignCenter, AlignRight, ChevronDown, Type, Move, RotateCw, Eye } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const OptimizedPropertiesPanel = () => {
  const { doc, updateNode, alignToArtboard, distributeSelection } = useStudioStore();
  const [openSections, setOpenSections] = useState({
    typography: true,
    position: false,
    effects: false,
    alignment: false
  });
  
  const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  if (!selectedNode) {
    return (
      <Card className="border-0 bg-transparent">
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-muted rounded-lg flex items-center justify-center">
              <Type className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No Selection</p>
              <p className="text-sm text-muted-foreground">Select an element to edit properties</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleUpdate = (updates: Partial<typeof selectedNode>) => {
    updateNode(selectedNode.id, updates);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderTextProperties = (node: TextNode) => (
    <div className="space-y-4">
      {/* Typography Section */}
      <Collapsible open={openSections.typography} onOpenChange={() => toggleSection('typography')}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Typography
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.typography && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Text Content</Label>
              <Input
                value={node.text}
                onChange={(e) => handleUpdate({ text: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Font</Label>
                <Select value={node.fontFamily} onValueChange={(value) => handleUpdate({ fontFamily: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    {GOOGLE_FONTS.slice(0, 8).map(font => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-medium text-muted-foreground">Weight</Label>
                <Select value={node.fontWeight.toString()} onValueChange={(value) => handleUpdate({ fontWeight: parseInt(value) })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    <SelectItem value="400">Regular</SelectItem>
                    <SelectItem value="500">Medium</SelectItem>
                    <SelectItem value="600">Semi Bold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Size: {node.fontSize}px</Label>
              <Slider
                value={[node.fontSize]}
                onValueChange={([value]) => handleUpdate({ fontSize: value })}
                min={12}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Alignment</Label>
              <div className="flex gap-1 mt-2">
                <Button
                  variant={node.align === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdate({ align: 'left' })}
                  className="flex-1"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant={node.align === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdate({ align: 'center' })}
                  className="flex-1"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant={node.align === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdate({ align: 'right' })}
                  className="flex-1"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Color</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {COLOR_SWATCHES.slice(0, 12).map(color => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleUpdate({ fill: { type: 'solid', color } })}
                  />
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderShapeProperties = (node: ShapeNode) => (
    <div className="space-y-4">
      <Collapsible open={openSections.typography} onOpenChange={() => toggleSection('typography')}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded" />
              Appearance
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.typography && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Fill Color</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {COLOR_SWATCHES.slice(0, 12).map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-lg border-2 border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => handleUpdate({ fill: { type: 'solid', color } })}
                />
              ))}
            </div>
          </div>

          {node.stroke && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Stroke</Label>
                <Input
                  value={node.stroke.color}
                  onChange={(e) => handleUpdate({ stroke: { ...node.stroke, color: e.target.value } })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Width: {node.stroke.width}px</Label>
                <Slider
                  value={[node.stroke.width]}
                  onValueChange={([value]) => handleUpdate({ stroke: { ...node.stroke, width: value } })}
                  min={0}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderCommonProperties = () => (
    <div className="space-y-4">
      {/* Position & Size */}
      <Collapsible open={openSections.position} onOpenChange={() => toggleSection('position')}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4" />
              Position & Size
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.position && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">X</Label>
              <Input
                type="number"
                value={Math.round(selectedNode.x)}
                onChange={(e) => handleUpdate({ x: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Y</Label>
              <Input
                type="number"
                value={Math.round(selectedNode.y)}
                onChange={(e) => handleUpdate({ y: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Width</Label>
              <Input
                type="number"
                value={Math.round(selectedNode.width)}
                onChange={(e) => handleUpdate({ width: parseFloat(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Height</Label>
              <Input
                type="number"
                value={Math.round(selectedNode.height)}
                onChange={(e) => handleUpdate({ height: parseFloat(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Effects */}
      <Collapsible open={openSections.effects} onOpenChange={() => toggleSection('effects')}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Effects
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.effects && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Rotation: {Math.round(selectedNode.rotation)}°</Label>
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
            <Label className="text-xs font-medium text-muted-foreground">Opacity: {Math.round(selectedNode.opacity * 100)}%</Label>
            <Slider
              value={[selectedNode.opacity]}
              onValueChange={([value]) => handleUpdate({ opacity: value })}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Alignment */}
      <Collapsible open={openSections.alignment} onOpenChange={() => toggleSection('alignment')}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-0 h-auto font-medium text-sm hover:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              Alignment
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", openSections.alignment && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-2">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <Card className="border-0 bg-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full" />
          {selectedNode.type === 'text' ? 'Text Properties' : 'Shape Properties'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-0 px-6 pb-6">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            {selectedNode.type === 'text' && renderTextProperties(selectedNode as TextNode)}
            {selectedNode.type === 'shape' && renderShapeProperties(selectedNode as ShapeNode)}
            {renderCommonProperties()}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};