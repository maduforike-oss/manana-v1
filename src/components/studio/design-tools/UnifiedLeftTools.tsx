import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shapes, Upload } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toolManager } from './ToolManager';
import { useStudioStore } from '@/lib/studio/store';
import { Tool } from '@/lib/studio/types';

interface UnifiedLeftToolsProps {
  collapsed?: boolean;
}

export const UnifiedLeftTools = ({ collapsed = false }: UnifiedLeftToolsProps) => {
  const { setActiveTool } = useStudioStore();
  const [currentToolId, setCurrentToolId] = useState<Tool>('select');

  // Get all primary tools (excluding shape variations)
  const primaryTools = toolManager.getAllTools().filter(tool => 
    !['rect', 'circle', 'triangle', 'star', 'line'].includes(tool.config.id)
  );

  // Get shape tools
  const shapeTools = toolManager.getAllTools().filter(tool => 
    ['rect', 'circle', 'triangle', 'star', 'line'].includes(tool.config.id)
  );

  // Handle tool activation
  const handleToolClick = (toolId: Tool) => {
    const success = toolManager.activateTool(toolId);
    if (success) {
      setActiveTool(toolId);
      setCurrentToolId(toolId);
    }
  };

  // Handle shape creation (directly create without switching tools)
  const handleShapeCreate = (toolId: Tool) => {
    const shapeTool = toolManager.getTool(toolId);
    if (shapeTool) {
      // Temporarily activate shape tool, create shape, then return to select
      toolManager.activateTool(toolId);
      // The shape will be created on next click, then tool switches back to select
    }
  };

  // Listen for tool changes from other sources (keyboard shortcuts, etc.)
  useEffect(() => {
    const updateCurrentTool = () => {
      setCurrentToolId(toolManager.getCurrentToolId());
    };

    // Check every 100ms for tool changes
    const interval = setInterval(updateCurrentTool, 100);
    return () => clearInterval(interval);
  }, []);

  if (collapsed) return null;

  return (
    <div className="w-20 flex flex-col items-center py-6 gap-4 relative border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Brand accent */}
      <div className="w-10 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mb-2" />
      
      <TooltipProvider delayDuration={300}>
        {/* Primary Tools */}
        <div className="flex flex-col gap-3">
          {primaryTools.map((tool, index) => {
            const Icon = tool.config.icon;
            const isActive = currentToolId === tool.config.id;
            
            return (
              <Tooltip key={tool.config.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToolClick(tool.config.id)}
                    className={`
                      w-14 h-14 relative transition-all duration-300 group
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105' 
                        : 'hover:bg-accent hover:scale-105'
                      }
                    `}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Icon className="w-6 h-6" />
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary-foreground rounded-full animate-pulse" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-card border border-border shadow-lg">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{tool.config.name}</div>
                    {tool.config.shortcut && (
                      <div className="text-xs text-primary mt-1 font-mono">({tool.config.shortcut})</div>
                    )}
                    {tool.config.description && (
                      <div className="text-xs text-muted-foreground mt-1">{tool.config.description}</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-8 h-px bg-border my-2" />

        {/* Shape Tools Dropdown */}
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-14 h-14 relative transition-all duration-300 group hover:bg-accent hover:scale-105"
                >
                  <Shapes className="w-6 h-6" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full opacity-60" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card border border-border shadow-lg">
              <div className="text-center">
                <div className="font-medium text-foreground">Shapes</div>
                <div className="text-xs text-primary mt-1 font-mono">(Click to add)</div>
              </div>
            </TooltipContent>
            <DropdownMenuContent side="right" className="w-48 bg-card border border-border shadow-xl">
              {shapeTools.map((tool) => {
                const Icon = tool.config.icon;
                return (
                  <DropdownMenuItem
                    key={tool.config.id}
                    onClick={() => handleShapeCreate(tool.config.id)}
                    className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <Icon className="w-5 h-5 text-foreground/80" />
                    <span className="font-medium text-foreground">{tool.config.name}</span>
                    {tool.config.shortcut && (
                      <span className="text-xs text-primary ml-auto">({tool.config.shortcut})</span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>

        {/* Upload Tool */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToolClick('image')}
              className="w-14 h-14 relative transition-all duration-300 group hover:bg-accent hover:scale-105"
            >
              <Upload className="w-6 h-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-card border border-border shadow-lg">
            <div className="text-center">
              <div className="font-medium text-foreground">Upload Image</div>
              <div className="text-xs text-primary mt-1 font-mono">(I)</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Bottom accent */}
      <div className="w-10 h-1 bg-gradient-to-r from-primary/60 to-primary rounded-full mt-auto" />
    </div>
  );
};