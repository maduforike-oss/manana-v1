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

  // Group tools for better visual organization
  const primaryTools = tools.slice(0, 2); // Select, Hand
  const drawingTools = tools.slice(2, 4); // Text, Image
  const shapeTools = tools.slice(4, 7); // Rect, Circle, Line
  const advancedTools = tools.slice(7); // Triangle, Star, Brush

  const renderToolGroup = (groupTools: typeof tools, withSeparator = false) => (
    <>
      {withSeparator && <div className="w-8 h-px bg-border/30 my-2" />}
      {groupTools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTool(tool.id)}
                className={`w-10 h-10 p-0 transition-all duration-300 rounded-lg group relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-lg ring-2 ring-primary/30 scale-105' 
                    : 'hover:bg-accent/60 hover:text-accent-foreground hover:shadow-md hover:scale-[1.02] text-foreground/80'
                }`}
              >
                <Icon className={`w-4 h-4 transition-all duration-200 ${
                  isActive ? 'drop-shadow-sm' : 'group-hover:scale-110'
                }`} />
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="flex items-center gap-2 bg-popover/95 backdrop-blur-sm border border-border/50 shadow-lg"
            >
              <span className="font-semibold text-foreground">{tool.label}</span>
              {tool.shortcut && (
                <kbd className="px-2 py-1 text-xs bg-primary/10 text-foreground/90 rounded border border-border/40 font-mono font-semibold">
                  {tool.shortcut}
                </kbd>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-16 h-full flex flex-col items-center py-6 bg-card border-r border-border shadow-sm">
        <div className="flex flex-col items-center gap-1.5">
          {renderToolGroup(primaryTools)}
          {renderToolGroup(drawingTools, true)}
          {renderToolGroup(shapeTools, true)}
          {renderToolGroup(advancedTools, true)}
        </div>
      </div>
    </TooltipProvider>
  );
};