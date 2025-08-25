import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MousePointer2, 
  Hand, 
  Type, 
  Image, 
  Square, 
  Circle, 
  Minus, 
  Triangle,
  Star,
  Brush
} from 'lucide-react';
import { useStudioStore } from '../../lib/studio/store';
import { Tool } from '../../lib/studio/types';

const tools = [
  { id: 'select' as Tool, icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand' as Tool, icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'text' as Tool, icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'image' as Tool, icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'rect' as Tool, icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle' as Tool, icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'line' as Tool, icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'triangle' as Tool, icon: Triangle, label: 'Triangle', shortcut: '' },
  { id: 'star' as Tool, icon: Star, label: 'Star', shortcut: 'S' },
  { id: 'brush' as Tool, icon: Brush, label: 'Brush', shortcut: 'P' },
];

interface LeftToolsProps {
  collapsed?: boolean;
}

export const LeftTools = ({ collapsed = false }: LeftToolsProps) => {
  const { activeTool, setActiveTool } = useStudioStore();

  if (collapsed) return null;

  return (
    <TooltipProvider>
      <div className="w-16 h-full flex flex-col items-center py-4 space-y-2 bg-card/50 border-r border-workspace-border">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTool(tool.id)}
                  className={`w-10 h-10 p-0 transition-all duration-200 border-workspace-border ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20' 
                      : 'hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>{tool.label}</span>
                {tool.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">
                    {tool.shortcut}
                  </kbd>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};