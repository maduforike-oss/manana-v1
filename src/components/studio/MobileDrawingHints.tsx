import { useState, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { Zap, Hand, Palette } from 'lucide-react';

export const MobileDrawingHints = () => {
  const { activeTool } = useStudioStore();
  const [showHints, setShowHints] = useState(true);

  useEffect(() => {
    // Show hints for 5 seconds when tool changes to brush
    if (activeTool === 'brush') {
      setShowHints(true);
      const timer = setTimeout(() => setShowHints(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeTool]);

  if (!showHints || activeTool !== 'brush') return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg max-w-sm">
      <div className="text-sm space-y-2">
        <div className="flex items-center gap-2 text-foreground font-medium">
          <Palette className="w-4 h-4 text-primary" />
          Drawing Controls
        </div>
        
        <div className="space-y-1 text-xs text-foreground/80">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span>Apple Pencil/Stylus: Draw precise strokes</span>
          </div>
          <div className="flex items-center gap-2">
            <Hand className="w-3 h-3" />
            <span>Two fingers: Pan and zoom the canvas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/20 rounded border"></div>
            <span>Tap outside this hint to start drawing</span>
          </div>
        </div>
      </div>
    </div>
  );
};