import React from 'react';
import { Button } from '@/components/ui/button';
import { useStudioStore } from '../../lib/studio/store';
import { 
  Copy, 
  Trash2, 
  FlipHorizontal, 
  FlipVertical,
  RotateCw,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdvancedSelectionTools = () => {
  const { doc, removeNode, duplicate, updateNode, clearSelection } = useStudioStore();
  
  const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
  
  if (selectedNodes.length === 0) return null;

  const handleDelete = () => {
    doc.selectedIds.forEach(id => removeNode(id));
    clearSelection();
  };

  const handleDuplicate = () => {
    doc.selectedIds.forEach(id => duplicate(id));
  };

  const handleFlipHorizontal = () => {
    selectedNodes.forEach(node => {
      updateNode(node.id, { 
        rotation: node.rotation ? -node.rotation : 180 
      });
    });
  };

  const handleRotate = () => {
    selectedNodes.forEach(node => {
      updateNode(node.id, { 
        rotation: (node.rotation || 0) + 90 
      });
    });
  };

  const handleToggleLock = () => {
    selectedNodes.forEach(node => {
      updateNode(node.id, { locked: !node.locked });
    });
  };

  const handleToggleVisibility = () => {
    selectedNodes.forEach(node => {
      updateNode(node.id, { hidden: !node.hidden });
    });
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-lg border border-border rounded-xl p-2 shadow-xl animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDuplicate}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          <Copy className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFlipHorizontal}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          <FlipHorizontal className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRotate}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-4 bg-border mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleLock}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          {selectedNodes.some(n => n.locked) ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleVisibility}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          {selectedNodes.some(n => n.hidden) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
      
      <div className="text-xs text-center text-foreground/60 mt-1 px-2">
        {selectedNodes.length} element{selectedNodes.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
};