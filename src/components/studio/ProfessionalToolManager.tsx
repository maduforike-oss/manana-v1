import React from 'react';
import { Button } from '@/components/ui/button';
import { useStudioStore } from '@/lib/studio/store';
import { 
  MousePointer, 
  Brush, 
  Type, 
  Square, 
  Circle, 
  Triangle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrushSettingsPanel } from './BrushSettingsPanel';

// Professional tool manager with brush integration
export const ProfessionalToolManager = () => {
  const { activeTool, setActiveTool } = useStudioStore();

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'brush', icon: Brush, label: 'Brush' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rect', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1 p-2 bg-background border border-border rounded-lg">
        <div className="text-xs font-medium text-muted-foreground mb-1">Tools</div>
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              "justify-start gap-2 h-8",
              activeTool === tool.id && "bg-primary text-primary-foreground"
            )}
            onClick={() => setActiveTool(tool.id as any)}
          >
            <tool.icon className="h-4 w-4" />
            <span className="text-xs">{tool.label}</span>
          </Button>
        ))}
        
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Active: <span className="font-medium capitalize">{activeTool}</span>
          </div>
        </div>
      </div>
      
      {/* Show brush settings when brush tool is active */}
      {(activeTool === 'brush' || activeTool === 'eraser') && (
        <BrushSettingsPanel />
      )}
    </div>
  );
};