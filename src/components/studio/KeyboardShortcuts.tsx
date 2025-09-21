import { useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { Tool } from '@/lib/studio/types';
import { toast } from 'sonner';

export const KeyboardShortcuts = () => {
  const { 
    activeTool, 
    setActiveTool, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    doc,
    removeNode,
    duplicate
  } = useStudioStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const { ctrlKey, metaKey, shiftKey, key } = e;
      const isModifier = ctrlKey || metaKey;

      // Undo/Redo
      if (isModifier && key.toLowerCase() === 'z') {
        e.preventDefault();
        if (shiftKey && canRedo) {
          redo();
          toast('Redo');
        } else if (canUndo) {
          undo();
          toast('Undo');
        }
        return;
      }

      // Copy/Duplicate
      if (isModifier && key.toLowerCase() === 'd') {
        e.preventDefault();
        const selectedNode = doc.nodes.find(n => doc.selectedIds.includes(n.id));
        if (selectedNode) {
          duplicate(selectedNode.id);
          toast('Element duplicated');
        }
        return;
      }

      // Delete
      if (key === 'Delete' || key === 'Backspace') {
        e.preventDefault();
        doc.selectedIds.forEach(id => {
          removeNode(id);
        });
        if (doc.selectedIds.length > 0) {
          toast('Element(s) deleted');
        }
        return;
      }

      // Tool shortcuts
      const toolShortcuts: Record<string, Tool> = {
        'v': 'select',
        'h': 'hand',
        't': 'text',
        'i': 'image',
        'r': 'rect',
        'c': 'circle',
        'l': 'line',
        's': 'star',
        'p': 'brush',
        'e': 'eraser'
      };

      const tool = toolShortcuts[key.toLowerCase()];
      if (tool && tool !== activeTool) {
        setActiveTool(tool);
        toast(`${tool} tool selected`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, setActiveTool, undo, redo, canUndo, canRedo, doc, removeNode, duplicate]);

  return null;
};