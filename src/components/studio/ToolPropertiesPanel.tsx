import React from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { SimpleBrushSettings } from './SimpleBrushSettings';
import { TextToolEnhanced } from './TextToolEnhanced';
import { Button } from '@/components/ui/button';
import { Hand, MousePointer2, Type, Square, Circle, PenTool, Eraser, Upload } from 'lucide-react';

export const ToolPropertiesPanel: React.FC = () => {
  const { activeTool, doc } = useStudioStore();
  
  // Get selected text node if any
  const selectedTextNode = doc.nodes.find(node => 
    doc.selectedIds.includes(node.id) && node.type === 'text'
  );

  const [brushSettings, setBrushSettings] = React.useState({
    size: 5,
    opacity: 1,
    color: '#000000',
    hardness: 0.8,
    type: 'pencil' as 'pencil' | 'marker' | 'spray' | 'eraser'
  });

  const renderToolProperties = () => {
    switch (activeTool) {
      case 'brush':
        return (
          <SimpleBrushSettings
            settings={brushSettings}
            onChange={(updates) => setBrushSettings(prev => ({ ...prev, ...updates } as any))}
          />
        );
      
      case 'eraser':
        return (
          <SimpleBrushSettings
            settings={brushSettings}
            onChange={(updates) => setBrushSettings(prev => ({ ...prev, ...updates } as any))}
            isEraser={true}
          />
        );
      
      case 'text':
        return (
          <TextToolEnhanced
            isActive={activeTool === 'text'}
            selectedTextNode={selectedTextNode}
          />
        );
      
      case 'select':
        return (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <MousePointer2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Selection Tool</h3>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>• Click objects to select them</p>
              <p>• Drag to move selected objects</p>
              <p>• Hold Shift to select multiple objects</p>
              <p>• Use transform handles to resize</p>
            </div>
          </div>
        );
      
      case 'hand':
        return (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Hand className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Hand Tool</h3>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>• Drag to pan around the canvas</p>
              <p>• Use mouse wheel to zoom in/out</p>
              <p>• No editing while this tool is active</p>
            </div>
          </div>
        );
      
      case 'rect':
      case 'circle':
        return (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              {activeTool === 'rect' ? (
                <Square className="w-4 h-4 text-primary" />
              ) : (
                <Circle className="w-4 h-4 text-primary" />
              )}
              <h3 className="text-sm font-semibold">
                {activeTool === 'rect' ? 'Rectangle' : 'Circle'} Tool
              </h3>
            </div>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>• Click on the canvas to create shape</p>
              <p>• Shapes appear in the print area</p>
              <p>• Use selection tool to modify</p>
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Image Tool</h3>
            </div>
            <div className="text-xs text-muted-foreground space-y-2 mb-4">
              <p>• Upload images to add to your design</p>
              <p>• Supports PNG, JPG, and SVG formats</p>
              <p>• Images will be placed in the print area</p>
            </div>
            <Button size="sm" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="p-4 text-center">
            <div className="text-sm text-muted-foreground">
              Select a tool to see its properties
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-card">
      {renderToolProperties()}
    </div>
  );
};