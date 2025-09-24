import React from 'react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudioStore } from '@/lib/studio/store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const GridCenterButton = () => {
  const centerDesignOnGrid = useStudioStore((state) => state.centerDesignOnGrid);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={centerDesignOnGrid}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Center on Grid
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Center all design elements on the grid origin</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};