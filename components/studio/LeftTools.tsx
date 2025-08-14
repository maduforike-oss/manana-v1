"use client";

import { Button } from '@/components/ui/button';
import { 
  MousePointer2, Hand, Type, Image, Square, 
  Circle, Minus, Triangle, Star, PenTool, Eraser 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useStudioStore } from '@/lib/studio/store';
import { Tool } from '@/lib/studio/types';

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'image', icon: Image, label: 'Image', shortcut: 'I' },
  { id: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'triangle', icon: Triangle, label: 'Triangle', shortcut: '' },
  { id: 'star', icon: Star, label: 'Star', shortcut: 'S' },
  { id: 'brush', icon: PenTool, label: 'Brush', shortcut: 'P' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
] as const;

export const LeftTools = () => {
  const { activeTool, setActiveTool } = useStudioStore();

  return (
    <div className="w-16 bg-card border-r flex flex-col items-center py-4 gap-2">
      <TooltipProvider delayDuration={300}>
        {tools.map(({ id, icon: Icon, label, shortcut }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === id ? "default" : "ghost"}
                size="icon"
                onClick={() => setActiveTool(id as Tool)}
                className="w-12 h-12"
              >
                <Icon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="text-center">
                <div className="font-medium">{label}</div>
                {shortcut && (
                  <div className="text-xs text-muted-foreground">({shortcut})</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
};