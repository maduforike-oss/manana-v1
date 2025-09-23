import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Node } from '@/lib/studio/types';
import { 
  Type, Square, Circle, Triangle, Star, Image as ImageIcon, Brush, Palette,
  Eye, EyeOff, Lock, Unlock, Trash2, GripVertical, Copy, Edit3, MoreHorizontal
} from 'lucide-react';
import { LayerThumbnail } from './LayerThumbnail';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';

interface LayerItemProps {
  node: Node;
  isSelected: boolean;
  isDragging?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onSelect: () => void;
  onUpdate: (updates: Partial<Node>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const LayerItem: React.FC<LayerItemProps> = ({
  node,
  isSelected,
  isDragging,
  dragHandleProps,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (editName.trim() && editName !== node.name) {
      onUpdate({ name: editName.trim() });
    }
    setIsRenaming(false);
    setEditName(node.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsRenaming(false);
      setEditName(node.name);
    }
  };

  const getLayerIcon = () => {
    const iconClass = "w-3.5 h-3.5";
    switch (node.type) {
      case 'text': 
        return <Type className={iconClass} />;
      case 'shape': 
        const shape = (node as any).shape || 'rect';
        switch (shape) {
          case 'circle': return <Circle className={iconClass} />;
          case 'triangle': return <Triangle className={iconClass} />;
          case 'star': return <Star className={iconClass} />;
          default: return <Square className={iconClass} />;
        }
      case 'image': 
        return <ImageIcon className={iconClass} />;
      case 'brush-stroke': 
        return <Brush className={iconClass} />;
      case 'path': 
        return <Palette className={iconClass} />;
      default: 
        return <Square className={iconClass} />;
    }
  };

  const getTypeColor = () => {
    switch (node.type) {
      case 'text': return 'hsl(var(--primary))';
      case 'shape': return 'hsl(var(--secondary))';
      case 'image': return 'hsl(var(--accent))';
      case 'brush-stroke': return 'hsl(var(--secondary-dark))';
      case 'path': return 'hsl(var(--primary-dark))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <TooltipProvider>
      <div
        className={`
          group relative rounded-lg border transition-all duration-200 cursor-pointer
          ${isSelected 
            ? 'border-primary/60 bg-primary/8 shadow-sm ring-1 ring-primary/20' 
            : 'border-border/40 hover:border-border/80 hover:bg-muted/40'
          }
          ${isDragging ? 'bg-primary/10 border-primary shadow-lg' : ''}
          ${node.locked ? 'opacity-70' : ''}
          ${node.hidden ? 'opacity-50' : ''}
        `}
        onClick={(e) => {
          if (!isRenaming) {
            onSelect();
          }
        }}
      >
        <div className="flex items-center gap-3 p-2.5">
          {/* Drag Handle */}
          <div 
            {...dragHandleProps}
            className={`
              flex-shrink-0 p-1 rounded cursor-grab active:cursor-grabbing
              ${isDragging ? 'cursor-grabbing' : ''}
              opacity-0 group-hover:opacity-100 transition-opacity
              hover:bg-muted/50
              ${node.locked ? 'cursor-not-allowed opacity-30' : ''}
            `}
          >
            <GripVertical className="w-3 h-3 text-muted-foreground" />
          </div>

          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <LayerThumbnail 
              node={node} 
              size={32}
              className="rounded border border-border/30"
            />
          </div>

          {/* Layer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="p-1 rounded"
                style={{ backgroundColor: `${getTypeColor()}15` }}
              >
                <div style={{ color: getTypeColor() }}>
                  {getLayerIcon()}
                </div>
              </div>
              
              {isRenaming ? (
                <Input
                  ref={inputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={handleKeyDown}
                  className="h-6 text-sm font-medium flex-1 min-w-0"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div 
                  className="flex-1 min-w-0 text-sm font-medium truncate cursor-text hover:text-primary transition-colors"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!node.locked) {
                      setIsRenaming(true);
                    }
                  }}
                >
                  {node.name}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                {node.type}
              </Badge>
              <span>
                {Math.round(node.x)}, {Math.round(node.y)}
              </span>
              <span className="opacity-60">•</span>
              <span>
                {Math.round(node.width)}×{Math.round(node.height)}
              </span>
              {node.rotation !== 0 && (
                <>
                  <span className="opacity-60">•</span>
                  <span>{Math.round(node.rotation)}°</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ hidden: !node.hidden });
                  }}
                  className="h-6 w-6 p-0 hover:bg-muted/60"
                >
                  {node.hidden ? (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {node.hidden ? 'Show Layer' : 'Hide Layer'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ locked: !node.locked });
                  }}
                  className="h-6 w-6 p-0 hover:bg-muted/60"
                >
                  {node.locked ? (
                    <Lock className="w-3 h-3 text-amber-500" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {node.locked ? 'Unlock Layer' : 'Lock Layer'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  className="h-6 w-6 p-0 hover:bg-muted/60"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate Layer</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!node.locked) {
                      setIsRenaming(true);
                    }
                  }}
                  className="h-6 w-6 p-0 hover:bg-muted/60"
                  disabled={node.locked}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rename Layer</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Layer</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Status Indicators */}
        {(node.hidden || node.locked) && (
          <div className="absolute -top-1 -right-1 flex gap-0.5">
            {node.hidden && (
              <div className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center">
                <EyeOff className="w-2 h-2 text-muted-foreground" />
              </div>
            )}
            {node.locked && (
              <div className="w-4 h-4 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                <Lock className="w-2 h-2 text-amber-600" />
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};