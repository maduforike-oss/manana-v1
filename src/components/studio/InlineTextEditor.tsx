import React, { useState, useRef, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { TextNode } from '@/lib/studio/types';

interface InlineTextEditorProps {
  node: TextNode;
  onComplete: () => void;
  zoom: number;
  panOffset: { x: number; y: number };
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  node,
  onComplete,
  zoom,
  panOffset
}) => {
  const [text, setText] = useState(node.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { updateNode, saveSnapshot } = useStudioStore();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleComplete = () => {
    updateNode(node.id, { text });
    saveSnapshot();
    onComplete();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleComplete();
    } else if (e.key === 'Escape') {
      onComplete();
    }
  };

  const style = {
    position: 'absolute' as const,
    left: node.x * zoom + panOffset.x,
    top: node.y * zoom + panOffset.y,
    width: node.width * zoom,
    fontSize: node.fontSize * zoom,
    fontFamily: node.fontFamily,
    fontWeight: node.fontWeight,
    color: node.fill.color || '#000000',
    textAlign: node.align as 'left' | 'center' | 'right',
    background: 'rgba(255, 255, 255, 0.9)',
    border: '2px solid hsl(var(--primary))',
    borderRadius: '4px',
    padding: '4px',
    resize: 'none' as const,
    outline: 'none',
    zIndex: 1000,
  };

  return (
    <textarea
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleComplete}
      onKeyDown={handleKeyDown}
      style={style}
      rows={1}
    />
  );
};