"use client";

import React, { useEffect, useState } from 'react';
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
import { useStudioStore } from '../../lib/studio/store';
import { Tool } from '../../lib/studio/types';
import { getTools, ToolDefinition } from '../../lib/api/tools';

// Icon mapping for dynamic tools
const iconMap = {
  MousePointer2, Hand, Type, Image, Square, 
  Circle, Minus, Triangle, Star, PenTool, Eraser
} as const;

interface LeftToolsProps {
  collapsed?: boolean;
}

export const LeftTools = ({ collapsed = false }: LeftToolsProps) => {
  const { activeTool, setActiveTool } = useStudioStore();
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTools = async () => {
      try {
        const toolsData = await getTools();
        setTools(toolsData.tools);
      } catch (error) {
        console.error('Failed to load tools:', error);
        // Fallback to hardcoded tools if API fails
        setTools([
          { id: 'select', name: 'Select', icon: 'MousePointer2', shortcut: 'V', description: 'Select and move objects', capabilities: [] },
          { id: 'hand', name: 'Hand', icon: 'Hand', shortcut: 'H', description: 'Pan the canvas', capabilities: [] },
          { id: 'text', name: 'Text', icon: 'Type', shortcut: 'T', description: 'Add text', capabilities: [] },
          { id: 'image', name: 'Image', icon: 'Image', shortcut: 'I', description: 'Add images', capabilities: [] },
          { id: 'rect', name: 'Rectangle', icon: 'Square', shortcut: 'R', description: 'Draw rectangles', capabilities: [] },
          { id: 'circle', name: 'Circle', icon: 'Circle', shortcut: 'C', description: 'Draw circles', capabilities: [] },
          { id: 'line', name: 'Line', icon: 'Minus', shortcut: 'L', description: 'Draw lines', capabilities: [] },
          { id: 'triangle', name: 'Triangle', icon: 'Triangle', shortcut: '', description: 'Draw triangles', capabilities: [] },
          { id: 'star', name: 'Star', icon: 'Star', shortcut: 'S', description: 'Draw stars', capabilities: [] },
          { id: 'brush', name: 'Brush', icon: 'PenTool', shortcut: 'P', description: 'Freehand drawing', capabilities: [] },
          { id: 'eraser', name: 'Eraser', icon: 'Eraser', shortcut: 'E', description: 'Erase elements', capabilities: [] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  if (collapsed) return null;

  if (loading) {
    return (
      <div className="w-16 flex flex-col items-center py-4 gap-3">
        <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-studio-accent-cyan rounded-full mb-2" />
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="w-12 h-12 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-16 flex flex-col items-center py-4 gap-3 relative">
      {/* Tool Categories */}
      <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-studio-accent-cyan rounded-full mb-2" />
      
      <TooltipProvider delayDuration={300}>
        {tools.map((tool, index) => {
          const IconComponent = iconMap[tool.icon as keyof typeof iconMap];
          if (!IconComponent) return null;
          
          return (
            <div key={tool.id} className="relative group">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveTool(tool.id as Tool)}
                    className={`
                      w-12 h-12 relative z-10 transition-all duration-200
                      ${activeTool === tool.id 
                        ? 'studio-tool active animate-[pulse-neon_2s_ease-in-out_infinite]' 
                        : 'studio-tool hover:bg-primary/10'
                      }
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <IconComponent className={`w-5 h-5 ${activeTool === tool.id ? 'text-primary-foreground' : ''}`} />
                    
                    {/* Tool category indicator */}
                    {['select', 'text', 'rect', 'brush'].includes(tool.id) && (
                      <div className="absolute -right-1 -top-1 w-2 h-2 bg-gradient-to-r from-primary to-studio-accent-cyan rounded-full opacity-60" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="glass-panel neon-border animate-in slide-in-from-left-2 z-50">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{tool.name}</div>
                    {tool.shortcut && (
                      <div className="text-xs text-primary mt-1 font-mono">({tool.shortcut})</div>
                    )}
                    {tool.description && (
                      <div className="text-xs text-muted-foreground mt-1">{tool.description}</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {/* Active tool glow effect */}
              {activeTool === tool.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-studio-accent-cyan rounded-lg blur-sm opacity-30 animate-pulse" />
              )}
            </div>
          );
        })}
      </TooltipProvider>
      
      {/* Bottom accent */}
      <div className="w-8 h-0.5 bg-gradient-to-r from-studio-accent-cyan to-primary rounded-full mt-2" />
    </div>
  );
};