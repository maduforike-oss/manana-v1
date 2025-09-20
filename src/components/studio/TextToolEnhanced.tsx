import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import { useStudioStore } from '@/lib/studio/store';
import { cn } from '@/lib/utils';

interface TextToolEnhancedProps {
  isActive: boolean;
  selectedTextNode?: any;
}

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
  'Verdana', 'Courier New', 'Impact', 'Comic Sans MS'
];

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 900, label: 'Black' }
];

export const TextToolEnhanced: React.FC<TextToolEnhancedProps> = ({
  isActive,
  selectedTextNode
}) => {
  const { updateNode, addNode } = useStudioStore();
  const [textSettings, setTextSettings] = useState({
    text: 'Sample Text',
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 400,
    color: '#000000',
    align: 'left' as 'left' | 'center' | 'right',
    lineHeight: 1.2,
    letterSpacing: 0
  });

  // Update settings when a text node is selected
  useEffect(() => {
    if (selectedTextNode) {
      setTextSettings({
        text: selectedTextNode.text || 'Sample Text',
        fontFamily: selectedTextNode.fontFamily || 'Arial',
        fontSize: selectedTextNode.fontSize || 24,
        fontWeight: selectedTextNode.fontWeight || 400,
        color: selectedTextNode.fill?.color || '#000000',
        align: selectedTextNode.align || 'left',
        lineHeight: selectedTextNode.lineHeight || 1.2,
        letterSpacing: selectedTextNode.letterSpacing || 0
      });
    }
  }, [selectedTextNode]);

  const handleSettingChange = (key: string, value: any) => {
    setTextSettings(prev => ({ ...prev, [key]: value }));
    
    // If a text node is selected, update it immediately
    if (selectedTextNode) {
      const updateData: any = {};
      
      if (key === 'text') updateData.text = value;
      if (key === 'fontFamily') updateData.fontFamily = value;
      if (key === 'fontSize') updateData.fontSize = value;
      if (key === 'fontWeight') updateData.fontWeight = value;
      if (key === 'color') updateData.fill = { type: 'solid', color: value };
      if (key === 'align') updateData.align = value;
      if (key === 'lineHeight') updateData.lineHeight = value;
      if (key === 'letterSpacing') updateData.letterSpacing = value;
      
      updateNode(selectedTextNode.id, updateData);
    }
  };

  const handleCreateText = () => {
    addNode({
      id: Date.now().toString(),
      type: 'text',
      name: 'Text',
      x: 100,
      y: 100,
      width: 200,
      height: textSettings.fontSize * textSettings.lineHeight,
      rotation: 0,
      opacity: 1,
      text: textSettings.text,
      fontFamily: textSettings.fontFamily,
      fontSize: textSettings.fontSize,
      fontWeight: textSettings.fontWeight,
      lineHeight: textSettings.lineHeight,
      letterSpacing: textSettings.letterSpacing,
      align: textSettings.align,
      fill: { type: 'solid', color: textSettings.color }
    });
  };

  if (!isActive && !selectedTextNode) return null;

  return (
    <div className="p-4 bg-card border border-border rounded-lg shadow-lg min-w-80">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Text Properties</h3>
        </div>

        {/* Text Content */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Text Content
          </label>
          <Input
            value={textSettings.text}
            onChange={(e) => handleSettingChange('text', e.target.value)}
            placeholder="Enter your text..."
            className="text-sm"
          />
        </div>

        {/* Font Family */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Font Family
          </label>
          <Select 
            value={textSettings.fontFamily} 
            onValueChange={(value) => handleSettingChange('fontFamily', value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map(font => (
                <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Size & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground/80 mb-2 block">
              Size: {textSettings.fontSize}px
            </label>
            <Slider
              value={[textSettings.fontSize]}
              onValueChange={([size]) => handleSettingChange('fontSize', size)}
              min={8}
              max={120}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-foreground/80 mb-2 block">
              Weight
            </label>
            <Select 
              value={textSettings.fontWeight.toString()} 
              onValueChange={(value) => handleSettingChange('fontWeight', parseInt(value))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHTS.map(weight => (
                  <SelectItem key={weight.value} value={weight.value.toString()}>
                    {weight.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Text Alignment */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Alignment
          </label>
          <div className="flex gap-1">
            {[
              { value: 'left', icon: AlignLeft },
              { value: 'center', icon: AlignCenter },
              { value: 'right', icon: AlignRight }
            ].map(({ value, icon: Icon }) => (
              <Button
                key={value}
                variant={textSettings.align === value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSettingChange('align', value)}
                className="flex-1"
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Line Height & Letter Spacing */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-foreground/80 mb-2 block">
              Line Height: {textSettings.lineHeight.toFixed(1)}
            </label>
            <Slider
              value={[textSettings.lineHeight]}
              onValueChange={([height]) => handleSettingChange('lineHeight', height)}
              min={0.8}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-foreground/80 mb-2 block">
              Letter Spacing: {textSettings.letterSpacing}px
            </label>
            <Slider
              value={[textSettings.letterSpacing]}
              onValueChange={([spacing]) => handleSettingChange('letterSpacing', spacing)}
              min={-5}
              max={20}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Color
          </label>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border-2 border-border cursor-pointer"
              style={{ backgroundColor: textSettings.color }}
            />
            <input
              type="color"
              value={textSettings.color}
              onChange={(e) => handleSettingChange('color', e.target.value)}
              className="w-full h-8 rounded border border-border cursor-pointer"
            />
          </div>
        </div>

        {/* Text Preview */}
        <div>
          <label className="text-xs font-medium text-foreground/80 mb-2 block">
            Preview
          </label>
          <div 
            className="p-3 bg-studio-surface rounded border border-border text-center min-h-16 flex items-center justify-center"
            style={{
              fontFamily: textSettings.fontFamily,
              fontSize: Math.min(textSettings.fontSize, 20),
              fontWeight: textSettings.fontWeight,
              color: textSettings.color,
              lineHeight: textSettings.lineHeight,
              letterSpacing: `${textSettings.letterSpacing}px`,
              textAlign: textSettings.align
            }}
          >
            {textSettings.text}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        {!selectedTextNode && (
          <Button 
            onClick={handleCreateText}
            className="w-full"
            disabled={!textSettings.text.trim()}
          >
            <Type className="w-4 h-4 mr-2" />
            Add Text
          </Button>
        )}
      </div>
    </div>
  );
};