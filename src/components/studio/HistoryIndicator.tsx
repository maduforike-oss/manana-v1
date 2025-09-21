import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2, History } from 'lucide-react';
import { useStudioStore } from '@/lib/studio/store';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const HistoryIndicator = () => {
  const { undo, redo, canUndo, canRedo, history } = useStudioStore();

  const handleUndo = () => {
    undo();
    toast('Undo');
  };

  const handleRedo = () => {
    redo();
    toast('Redo');
  };

  return (
    <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Shift+Z)</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1 px-2 text-xs text-muted-foreground">
          <History className="h-3 w-3" />
          <span>{history.length}</span>
        </div>
      </TooltipProvider>
    </div>
  );
};