import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, EyeOff, Lock, Unlock, Copy, Trash2, 
  Plus, Layers, Move, ChevronDown, ChevronRight 
} from 'lucide-react';
import { useStudioStore } from '@/lib/studio/store';
import { cn } from '@/lib/utils';

interface LayerItemProps {
  node: any;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  node,
  isSelected,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDuplicate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [layerName, setLayerName] = useState(node.name || node.type);

  const handleNameSubmit = () => {
    // Update node name in store
    useStudioStore.getState().updateNode(node.id, { name: layerName });
    setIsEditing(false);
  };

  const getLayerIcon = () => {
    switch (node.type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'shape': return node.shape === 'rect' ? '⬜' : '⭕';
      case 'path': return '✏️';
      default: return '📄';
    }
  };

  return (
    <div 
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md transition-all duration-200 hover:bg-accent/50",
        isSelected && "bg-primary/10 border border-primary/30"
      )}
      onClick={onSelect}
    >
      {/* Layer Icon */}
      <div className="w-8 h-8 rounded bg-studio-surface border border-border flex items-center justify-center text-xs">
        {getLayerIcon()}
      </div>

      {/* Layer Name */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            value={layerName}
            onChange={(e) => setLayerName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNameSubmit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="w-full text-xs bg-transparent border border-primary rounded px-1 py-0.5"
            autoFocus
          />
        ) : (
          <div 
            className="text-xs font-medium truncate cursor-pointer"
            onDoubleClick={() => setIsEditing(true)}
          >
            {layerName}
          </div>
        )}
        <div className="text-[10px] text-muted-foreground">
          {node.type} • {Math.round(node.opacity * 100)}%
        </div>
      </div>

      {/* Layer Controls */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="w-6 h-6 p-0"
        >
          {node.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className="w-6 h-6 p-0"
        >
          {node.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="w-6 h-6 p-0"
        >
          <Copy className="w-3 h-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-6 h-6 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export const LayersPanelEnhanced: React.FC = () => {
  const { 
    doc, 
    selectNode, 
    updateNode, 
    removeNode, 
    duplicate, 
    addNode,
    bringToFront,
    sendToBack
  } = useStudioStore();

  const handleCreateLayer = () => {
    addNode({
      id: Date.now().toString(),
      type: 'shape',
      name: 'New Layer',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      shape: 'rect',
      fill: { type: 'solid', color: '#3B82F6' }
    });
  };

  const reversedNodes = [...doc.nodes].reverse(); // Show top layers first

  return (
    <div className="w-full h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Layers</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCreateLayer}
            className="w-7 h-7 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Layer count */}
        <div className="text-xs text-muted-foreground">
          {doc.nodes.length} layer{doc.nodes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {reversedNodes.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <div className="text-sm text-muted-foreground mb-3">No layers yet</div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateLayer}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Layer
              </Button>
            </div>
          ) : (
            reversedNodes.map((node, index) => (
              <LayerItem
                key={node.id}
                node={node}
                isSelected={doc.selectedIds.includes(node.id)}
                onSelect={() => selectNode(node.id)}
                onToggleVisibility={() => updateNode(node.id, { hidden: !node.hidden })}
                onToggleLock={() => updateNode(node.id, { locked: !node.locked })}
                onDuplicate={() => duplicate(node.id)}
                onDelete={() => removeNode(node.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Layer Order Controls */}
      {doc.selectedIds.length > 0 && (
        <>
          <Separator />
          <div className="p-2 space-y-1">
            <div className="text-xs font-medium text-muted-foreground mb-1">Layer Order</div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => bringToFront(doc.selectedIds[0])}
                className="flex-1 text-xs"
              >
                Bring to Front
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendToBack(doc.selectedIds[0])}
                className="flex-1 text-xs"
              >
                Send to Back
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};