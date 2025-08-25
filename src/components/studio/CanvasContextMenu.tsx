import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useStudioStore } from '../../lib/studio/store';
import { 
  Copy, 
  Clipboard, 
  Files, 
  Trash2, 
  Move3D,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Group,
  Ungroup
} from 'lucide-react';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const CanvasContextMenu = ({ children, onContextMenu }: CanvasContextMenuProps) => {
  const { 
    doc, 
    duplicate, 
    removeNode, 
    updateNode, 
    bringToFront, 
    sendToBack
  } = useStudioStore();

  const selectedNodes = doc.nodes.filter(node => doc.selectedIds.includes(node.id));
  const hasSelection = selectedNodes.length > 0;
  const singleSelection = selectedNodes.length === 1;

  const handleDuplicate = () => {
    doc.selectedIds.forEach(id => duplicate(id));
  };

  const handleDelete = () => {
    doc.selectedIds.forEach(id => removeNode(id));
  };

  const handleFlipHorizontal = () => {
    selectedNodes.forEach(node => {
      updateNode(node.id, { 
        rotation: (node.rotation || 0) + 180
      });
    });
  };

  const handleFlipVertical = () => {
    selectedNodes.forEach(node => {
      updateNode(node.id, { 
        rotation: (node.rotation || 0) + 180
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

  return (
    <ContextMenu>
      <ContextMenuTrigger onContextMenu={onContextMenu}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-card/95 border-border/50 backdrop-blur-sm">
        {hasSelection && (
          <>
            <ContextMenuItem onClick={handleDuplicate} className="text-foreground hover:bg-accent/80">
              <Files className="w-4 h-4 mr-2" />
              Duplicate
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>

            <ContextMenuSeparator className="bg-border/30" />

            <ContextMenuItem onClick={() => doc.selectedIds.forEach(id => bringToFront(id))} className="text-foreground hover:bg-accent/80">
              <Move3D className="w-4 h-4 mr-2" />
              Bring to Front
            </ContextMenuItem>

            <ContextMenuItem onClick={() => doc.selectedIds.forEach(id => sendToBack(id))} className="text-foreground hover:bg-accent/80">
              <Move3D className="w-4 h-4 mr-2" />
              Send to Back
            </ContextMenuItem>

            {singleSelection && (
              <>
                <ContextMenuSeparator className="bg-border/30" />

                <ContextMenuItem onClick={handleRotate} className="text-foreground hover:bg-accent/80">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Rotate 90°
                </ContextMenuItem>

                <ContextMenuItem onClick={handleFlipHorizontal} className="text-foreground hover:bg-accent/80">
                  <FlipHorizontal className="w-4 h-4 mr-2" />
                  Flip Horizontal
                </ContextMenuItem>

                <ContextMenuItem onClick={handleFlipVertical} className="text-foreground hover:bg-accent/80">
                  <FlipVertical className="w-4 h-4 mr-2" />
                  Flip Vertical
                </ContextMenuItem>
              </>
            )}

            <ContextMenuSeparator className="bg-border/30" />

            <ContextMenuItem 
              onClick={handleDelete} 
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
              <ContextMenuShortcut>⌫</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}

        {!hasSelection && (
          <ContextMenuItem className="text-foreground/40" disabled>
            <Eye className="w-4 h-4 mr-2" />
            No selection
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};