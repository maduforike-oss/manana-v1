import React from 'react';
import { Button } from '@/components/ui/button';
import { Brush } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TapToDrawPromptProps {
  onTap: () => void;
  className?: string;
}

export const TapToDrawPrompt: React.FC<TapToDrawPromptProps> = ({
  onTap,
  className
}) => {
  return (
    <div className={cn(
      "fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50",
      "animate-pulse",
      className
    )}>
      <Button
        onClick={onTap}
        variant="default"
        size="lg"
        className="rounded-full shadow-lg border-2 border-background/50 backdrop-blur-sm"
      >
        <Brush className="w-4 h-4 mr-2" />
        Tap to draw
      </Button>
    </div>
  );
};