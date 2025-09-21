import { useEffect, useState } from 'react';

interface DynamicCursorProps {
  activeTool: string;
  brushSize: number;
  color: string;
}

export const DynamicCursor: React.FC<DynamicCursorProps> = ({
  activeTool,
  brushSize,
  color
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const showCursor = () => setIsVisible(true);
    const hideCursor = () => setIsVisible(false);

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseenter', showCursor);
    document.addEventListener('mouseleave', hideCursor);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseenter', showCursor);
      document.removeEventListener('mouseleave', hideCursor);
    };
  }, []);

  if (!isVisible || (activeTool !== 'brush' && activeTool !== 'eraser')) {
    return null;
  }

  const cursorSize = Math.max(8, Math.min(40, brushSize));

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: position.x - cursorSize / 2,
        top: position.y - cursorSize / 2,
        width: cursorSize,
        height: cursorSize,
      }}
    >
      {activeTool === 'brush' ? (
        <div
          className="w-full h-full rounded-full border-2 border-white shadow-lg"
          style={{
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full border-2 border-red-500 bg-transparent shadow-lg"
          style={{
            borderStyle: 'dashed',
          }}
        />
      )}
    </div>
  );
};