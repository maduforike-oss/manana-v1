import React, { useEffect, useState } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { Card } from '@/components/ui/card';
import { 
  MousePointer2, Hand, Type, PenTool, Eraser, 
  Square, Circle, Image, Shapes
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolInfo {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  shortcut: string;
  description: string;
  color: string;
}

const TOOL_INFO: Record<string, ToolInfo> = {
  select: {
    icon: MousePointer2,
    name: 'Select',
    shortcut: 'V',
    description: 'Select and move objects',
    color: 'text-blue-500'
  },
  hand: {
    icon: Hand,
    name: 'Pan',
    shortcut: 'H',
    description: 'Pan around the canvas',
    color: 'text-gray-500'
  },
  text: {
    icon: Type,
    name: 'Text',
    shortcut: 'T',
    description: 'Add text to design',
    color: 'text-green-500'
  },
  brush: {
    icon: PenTool,
    name: 'Brush',
    shortcut: 'B',
    description: 'Draw with brush strokes',
    color: 'text-purple-500'
  },
  eraser: {
    icon: Eraser,
    name: 'Eraser',
    shortcut: 'E',
    description: 'Erase parts of design',
    color: 'text-red-500'
  },
  rect: {
    icon: Square,
    name: 'Rectangle',
    shortcut: 'R',
    description: 'Draw rectangles',
    color: 'text-orange-500'
  },
  circle: {
    icon: Circle,
    name: 'Circle',
    shortcut: 'C',
    description: 'Draw circles',
    color: 'text-cyan-500'
  },
  image: {
    icon: Image,
    name: 'Image',
    shortcut: 'I',
    description: 'Add images to design',
    color: 'text-indigo-500'
  }
};

interface ToolFeedbackSystemProps {
  showFeedback?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export const ToolFeedbackSystem: React.FC<ToolFeedbackSystemProps> = ({
  showFeedback = true,
  position = 'bottom-left'
}) => {
  const { activeTool } = useStudioStore();
  const [showToolChange, setShowToolChange] = useState(false);
  const [previousTool, setPreviousTool] = useState(activeTool);

  // Show feedback when tool changes
  useEffect(() => {
    if (activeTool !== previousTool) {
      setShowToolChange(true);
      setPreviousTool(activeTool);
      
      const timer = setTimeout(() => {
        setShowToolChange(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTool, previousTool]);

  const currentTool = TOOL_INFO[activeTool];
  
  if (!showFeedback || !currentTool || !showToolChange) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  const Icon = currentTool.icon;

  return (
    <Card
      className={cn(
        "fixed z-50 p-4 bg-card/95 backdrop-blur-lg border border-border/50 shadow-xl",
        "animate-in slide-in-from-bottom-2 fade-in duration-200",
        "min-w-[200px]",
        positionClasses[position]
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg bg-primary/10 border border-primary/20",
          currentTool.color
        )}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {currentTool.name}
            </span>
            <span className="text-xs px-2 py-1 bg-muted rounded-md font-mono text-muted-foreground">
              {currentTool.shortcut}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentTool.description}
          </p>
        </div>
      </div>
      
      {/* Progress bar for auto-hide */}
      <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full animate-pulse"
          style={{
            width: '100%',
            animation: 'shrink 2s linear forwards'
          }}
        />
      </div>
      
      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </Card>
  );
};

// Quick tool switcher component for keyboard shortcuts
export const QuickToolSwitcher: React.FC = () => {
  const { activeTool, setActiveTool } = useStudioStore();
  const [showSwitcher, setShowSwitcher] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only show switcher when using tool shortcuts
      const toolKeys = ['v', 'h', 't', 'b', 'e', 'r', 'c', 'i'];
      if (toolKeys.includes(e.key.toLowerCase()) && !e.ctrlKey && !e.metaKey) {
        setShowSwitcher(true);
        clearTimeout(timeout);
        timeout = setTimeout(() => setShowSwitcher(false), 1500);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, []);

  if (!showSwitcher) return null;

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-2 bg-card/95 backdrop-blur-lg border border-border/50 shadow-xl">
      <div className="flex items-center gap-1">
        {Object.entries(TOOL_INFO).map(([tool, info]) => {
          const Icon = info.icon;
          const isActive = activeTool === tool;
          
          return (
            <button
              key={tool}
              onClick={() => setActiveTool(tool as any)}
              className={cn(
                "p-2 rounded-md transition-all duration-150",
                "hover:bg-accent hover:scale-105",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={`${info.name} (${info.shortcut})`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </Card>
  );
};