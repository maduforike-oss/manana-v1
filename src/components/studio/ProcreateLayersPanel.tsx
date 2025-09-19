import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  Plus, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Copy,
  Trash2,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Move
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Layer, BlendMode, LayerGroup } from '@/lib/studio/layerSystem';
import { cn } from '@/lib/utils';
// Drag and drop temporarily disabled

interface ProcreateLayersPanelProps {
  layers: Layer[];
  groups: LayerGroup[];
  activeLayerId: string | null;
  onLayerSelect: (id: string) => void;
  onLayerCreate: (name?: string) => void;
  onLayerDelete: (id: string) => void;
  onLayerDuplicate: (id: string) => void;
  onLayerToggleVisibility: (id: string) => void;
  onLayerToggleLock: (id: string) => void;
  onLayerUpdateProperty: (id: string, property: keyof Layer, value: any) => void;
  onLayerReorder: (fromIndex: number, toIndex: number) => void;
  collapsed?: boolean;
}

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPropertyUpdate: (property: keyof Layer, value: any) => void;
}

const LayerItem = ({ 
  layer, 
  isActive, 
  onSelect, 
  onToggleVisibility, 
  onToggleLock,
  onDuplicate,
  onDelete,
  onPropertyUpdate 
}: LayerItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(layer.name);

  // Drag and drop functionality temporarily simplified
  const style = {};

  const handleNameEdit = useCallback(() => {
    if (isEditing) {
      onPropertyUpdate('name', tempName);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [isEditing, tempName, onPropertyUpdate]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameEdit();
    } else if (e.key === 'Escape') {
      setTempName(layer.name);
      setIsEditing(false);
    }
  }, [handleNameEdit, layer.name]);

  const blendModes: BlendMode[] = [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light', 
    'hard-light', 'color-dodge', 'color-burn', 'darken', 
    'lighten', 'difference', 'exclusion'
  ];

  return (
    <div
      style={style}
      className={cn(
        "group relative bg-card border border-border rounded-lg p-3 transition-all duration-200",
        isActive && "ring-2 ring-primary bg-primary/10"
      )}
    >

      <div className="flex items-center gap-2 ml-3">
        {/* Thumbnail */}
        <div className="relative">
          <canvas
            ref={(canvas) => {
              if (canvas && layer.thumbnail) {
                const ctx = canvas.getContext('2d')!;
                ctx.clearRect(0, 0, 32, 32);
                ctx.drawImage(layer.thumbnail, 0, 0, 32, 32);
              }
            }}
            width={32}
            height={32}
            className="border border-border rounded bg-checkerboard"
          />
          {!layer.visible && (
            <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
              <EyeOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Layer Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameEdit}
              onKeyDown={handleNameKeyDown}
              className="h-6 text-sm"
              autoFocus
            />
          ) : (
            <div
              className="text-sm font-medium truncate cursor-pointer hover:text-primary"
              onClick={onSelect}
              onDoubleClick={() => setIsEditing(true)}
            >
              {layer.name}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {layer.blendMode}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(layer.opacity * 100)}%
            </span>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={onToggleVisibility}
          >
            {layer.visible ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3 text-muted-foreground" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={onToggleLock}
          >
            {layer.locked ? (
              <Lock className="w-3 h-3 text-destructive" />
            ) : (
              <Unlock className="w-3 h-3" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Layer Properties (shown when active) */}
      {isActive && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {/* Opacity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Opacity</label>
              <span className="text-xs text-muted-foreground">
                {Math.round(layer.opacity * 100)}%
              </span>
            </div>
            <Slider
              value={[layer.opacity]}
              onValueChange={(value) => onPropertyUpdate('opacity', value[0])}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Blend Mode */}
          <div className="space-y-1">
            <label className="text-xs font-medium">Blend Mode</label>
            <Select
              value={layer.blendMode}
              onValueChange={(value) => onPropertyUpdate('blendMode', value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {blendModes.map((mode) => (
                  <SelectItem key={mode} value={mode} className="text-xs">
                    {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export const ProcreateLayersPanel = ({ 
  layers, 
  groups,
  activeLayerId,
  onLayerSelect,
  onLayerCreate,
  onLayerDelete,
  onLayerDuplicate,
  onLayerToggleVisibility,
  onLayerToggleLock,
  onLayerUpdateProperty,
  onLayerReorder,
  collapsed = false 
}: ProcreateLayersPanelProps) => {
  if (collapsed) {
    return (
      <div className="w-16 bg-card border-l border-border p-2">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onLayerCreate()}
            className="w-12 h-12"
          >
            <Plus className="w-5 h-5" />
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            {layers.length}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-80 bg-card border-border h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Layers
            <Badge variant="secondary" className="text-xs">
              {layers.length}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLayerCreate()}
            className="h-8"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-3 space-y-2">
        {/* Render layers in reverse order (top to bottom) */}
        {[...layers].reverse().map((layer) => (
          <LayerItem
            key={layer.id}
            layer={layer}
            isActive={activeLayerId === layer.id}
            onSelect={() => onLayerSelect(layer.id)}
            onToggleVisibility={() => onLayerToggleVisibility(layer.id)}
            onToggleLock={() => onLayerToggleLock(layer.id)}
            onDuplicate={() => onLayerDuplicate(layer.id)}
            onDelete={() => onLayerDelete(layer.id)}
            onPropertyUpdate={(property, value) => 
              onLayerUpdateProperty(layer.id, property, value)
            }
          />
        ))}

        {layers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No layers yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLayerCreate('Layer 1')}
              className="mt-2"
            >
              Create First Layer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};