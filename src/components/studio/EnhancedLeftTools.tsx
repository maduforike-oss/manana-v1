import { Button } from '@/components/ui/button';
import { 
  MousePointer2, Hand, Type, Image, Shapes, Upload,
  Square, Circle, Triangle, Star, Minus, PenTool, Eraser
} from 'lucide-react';
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
import { useStudioStore } from '../../lib/studio/store';
import { Tool } from '../../lib/studio/types';
import { TextNode, ShapeNode } from '../../lib/studio/types';

// Essential tools only - streamlined for professional use
const primaryTools = [
  { id: 'select', icon: MousePointer2, label: 'Select & Move', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Pan Canvas', shortcut: 'H' },
  { id: 'text', icon: Type, label: 'Add Text', shortcut: 'T' },
  { id: 'brush', icon: PenTool, label: 'Brush Tool', shortcut: 'B' },
  { id: 'eraser', icon: Eraser, label: 'Eraser Tool', shortcut: 'E' },
  { id: 'image', icon: Image, label: 'Add Image', shortcut: 'I' },
] as const;

const shapeTools = [
  { shape: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { shape: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { shape: 'triangle', icon: Triangle, label: 'Triangle', shortcut: undefined },
  { shape: 'star', icon: Star, label: 'Star', shortcut: undefined },
  { shape: 'line', icon: Minus, label: 'Line', shortcut: undefined },
] as const;

interface EnhancedLeftToolsProps {
  collapsed?: boolean;
}

export const EnhancedLeftTools = ({ collapsed = false }: EnhancedLeftToolsProps) => {
  const { activeTool, setActiveTool, addNode, doc } = useStudioStore();

  // Create text node
  const createTextNode = () => {
    const textNode: TextNode = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: 'Text Layer',
      x: doc.canvas.width / 2 - 100,
      y: doc.canvas.height / 2 - 25,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      text: 'Your Text Here',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: 0,
      align: 'center',
      fill: { type: 'solid', color: '#000000' }
    };
    addNode(textNode);
  };

  // Create shape node
  const createShape = (shape: string) => {
    const shapeNode: ShapeNode = {
      id: `${shape}-${Date.now()}`,
      type: 'shape',
      name: `${shape.charAt(0).toUpperCase() + shape.slice(1)} Shape`,
      x: doc.canvas.width / 2 - 50,
      y: doc.canvas.height / 2 - 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      shape: shape as any,
      fill: { type: 'solid', color: '#3B82F6' },
      stroke: { color: '#1E40AF', width: 2 },
      radius: shape === 'rect' ? 8 : undefined,
      points: shape === 'star' ? 5 : undefined,
    };
    addNode(shapeNode);
  };

  // Handle tool click
  const handleToolClick = (toolId: string) => {
    if (toolId === 'text') {
      setActiveTool('text');
    } else if (toolId === 'image') {
      // Trigger file input for image upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              // Create image node - simplified for now
              console.log('Image loaded:', event.target.result);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      setActiveTool('select');
    } else {
      setActiveTool(toolId as Tool);
    }
  };

  if (collapsed) return null;

  return (
    <div className="w-20 flex flex-col items-center py-6 gap-4 relative border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Brand accent */}
      <div className="w-10 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mb-2" />
      
      <TooltipProvider delayDuration={300}>
        {/* Primary Tools */}
        <div className="flex flex-col gap-3">
          {primaryTools.map(({ id, icon: Icon, label, shortcut }, index) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToolClick(id)}
                  className={`
                    w-14 h-14 relative transition-all duration-300 group
                    ${activeTool === id 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105' 
                      : 'hover:bg-accent hover:scale-105'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="w-6 h-6" />
                  
                  {/* Active indicator */}
                  {activeTool === id && (
                    <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary-foreground rounded-full animate-pulse" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border border-border shadow-lg">
                <div className="text-center">
                  <div className="font-medium text-foreground">{label}</div>
                  <div className="text-xs text-primary mt-1 font-mono">({shortcut})</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
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
              {shapeTools.map(({ shape, icon: Icon, label, shortcut }) => (
                <DropdownMenuItem
                  key={shape}
                  onClick={() => {
                    createShape(shape);
                    setActiveTool(shape as Tool);
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
                >
                  <Icon className="w-5 h-5 text-foreground/80" />
                  <span className="font-medium text-foreground">{label}</span>
                  {shortcut && <span className="text-xs text-primary ml-auto">({shortcut})</span>}
                </DropdownMenuItem>
              ))}
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
              <div className="text-xs text-primary mt-1 font-mono">(Cmd+U)</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Bottom accent */}
      <div className="w-10 h-1 bg-gradient-to-r from-primary/60 to-primary rounded-full mt-auto" />
    </div>
  );
};