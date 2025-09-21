import { useEffect } from 'react';
import { useStudioStore } from '../../lib/studio/store';

export const DrawingKeyboardShortcuts = () => {
  const { setActiveTool, activeTool } = useStudioStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('select');
          }
          break;
        case 'h':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('hand');
          }
          break;
        case 't':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('text');
          }
          break;
        case 'b':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('brush');
          }
          break;
        case 'e':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('eraser');
          }
          break;
        case 'i':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('image');
          }
          break;
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('rect');
          }
          break;
        case 'c':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setActiveTool('circle');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  return null;
};