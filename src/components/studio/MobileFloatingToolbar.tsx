import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MousePointer, 
  PaintBucket, 
  Type, 
  Square, 
  Circle, 
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Undo,
  Redo
} from 'lucide-react';
import { useStudioStore } from '@/lib/studio/store';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface MobileFloatingToolbarProps {
  className?: string;
}

export const MobileFloatingToolbar = ({ className }: MobileFloatingToolbarProps) => {
  const { activeTool, setActiveTool, undo, redo } = useStudioStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [toolPage, setToolPage] = useState(0);

  const primaryTools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'brush', icon: PaintBucket, label: 'Brush' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' }
  ];

  const secondaryTools = [
    { id: 'triangle', icon: Square, label: 'Triangle' },
    { id: 'pen', icon: PaintBucket, label: 'Pen' },
    { id: 'eraser', icon: PaintBucket, label: 'Eraser' }
  ];

  const toolsPerPage = 3;
  const currentTools = isExpanded 
    ? [...primaryTools, ...secondaryTools]
    : primaryTools;
  
  const totalPages = Math.ceil(currentTools.length / toolsPerPage);
  const visibleTools = currentTools.slice(
    toolPage * toolsPerPage, 
    (toolPage + 1) * toolsPerPage
  );

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId as any);
    setIsExpanded(false);
  };

  const nextPage = () => {
    setToolPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setToolPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
        "flex items-center gap-2 p-2 rounded-xl",
        "bg-card/95 backdrop-blur-md border border-border/50",
        "shadow-lg shadow-black/20",
        className
      )}>
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            className="h-10 w-10 p-0 touch:min-h-[44px] touch:min-w-[44px]"
          >
            <Undo className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            className="h-10 w-10 p-0 touch:min-h-[44px] touch:min-w-[44px]"
          >
            <Redo className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
        </div>

        <div className="w-px h-6 bg-border/50" />

        {/* Tool Navigation */}
        {totalPages > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={prevPage}
            className="h-10 w-10 p-0 touch:min-h-[44px] touch:min-w-[44px]"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous tools</span>
          </Button>
        )}

        {/* Visible Tools */}
        <div className="flex items-center gap-1">
          {visibleTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleToolSelect(tool.id)}
                  className="h-10 w-10 p-0 touch:min-h-[44px] touch:min-w-[44px]"
                >
                  <tool.icon className="h-4 w-4" />
                  <span className="sr-only">{tool.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Tool Navigation */}
        {totalPages > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={nextPage}
            className="h-10 w-10 p-0 touch:min-h-[44px] touch:min-w-[44px]"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next tools</span>
          </Button>
        )}

        <div className="w-px h-6 bg-border/50" />

        {/* More Options */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 touch:min-h-[44px] touch:min-w-[44px]"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[50vh]">
            <div className="flex flex-col gap-4 p-4">
              <h3 className="text-lg font-semibold">All Tools</h3>
              <div className="grid grid-cols-4 gap-3">
                {[...primaryTools, ...secondaryTools].map((tool) => (
                  <Button
                    key={tool.id}
                    variant={activeTool === tool.id ? 'default' : 'outline'}
                    className="flex flex-col gap-2 h-16 touch:min-h-[48px]"
                    onClick={() => handleToolSelect(tool.id)}
                  >
                    <tool.icon className="h-5 w-5" />
                    <span className="text-xs">{tool.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Page indicator */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 ml-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors",
                  index === toolPage 
                    ? "bg-primary" 
                    : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};