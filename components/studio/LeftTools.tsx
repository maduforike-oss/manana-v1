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

interface LeftToolsProps {
  collapsed?: boolean;
}

export const LeftTools = ({ collapsed = false }: LeftToolsProps) => {
  const { activeTool, setActiveTool } = useStudioStore();

  if (collapsed) return null;

  return (
    <div className="w-16 flex flex-col items-center py-4 gap-3 relative">
      {/* Tool Categories */}
      <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-studio-accent-cyan rounded-full mb-2" />
      
      <TooltipProvider delayDuration={300}>
        {tools.map(({ id, icon: Icon, label, shortcut }, index) => (
          <div key={id} className="relative group">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveTool(id as Tool)}
                  className={`
                    w-12 h-12 relative z-10 transition-all duration-200
                    ${activeTool === id 
                      ? 'studio-tool active animate-[pulse-neon_2s_ease-in-out_infinite]' 
                      : 'studio-tool hover:bg-primary/10'
                    }
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Icon className={`w-5 h-5 ${activeTool === id ? 'text-primary-foreground' : ''}`} />
                  
                  {/* Tool category indicator */}
                  {['select', 'text', 'rect', 'brush'].includes(id) && (
                    <div className="absolute -right-1 -top-1 w-2 h-2 bg-gradient-to-r from-primary to-studio-accent-cyan rounded-full opacity-60" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass-panel neon-border animate-in slide-in-from-left-2 z-50">
                <div className="text-center">
                  <div className="font-medium text-foreground">{label}</div>
                  {shortcut && (
                    <div className="text-xs text-primary mt-1 font-mono">({shortcut})</div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
            
            {/* Active tool glow effect */}
            {activeTool === id && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-studio-accent-cyan rounded-lg blur-sm opacity-30 animate-pulse" />
            )}
          </div>
        ))}
      </TooltipProvider>
      
      {/* Bottom accent */}
      <div className="w-8 h-0.5 bg-gradient-to-r from-studio-accent-cyan to-primary rounded-full mt-2" />
    </div>
  );
};