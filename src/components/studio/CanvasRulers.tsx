import React from 'react';

interface CanvasRulersProps {
  zoom: number;
  panOffset: { x: number; y: number };
  showRulers: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export const CanvasRulers = ({ 
  zoom, 
  panOffset, 
  showRulers, 
  canvasWidth, 
  canvasHeight 
}: CanvasRulersProps) => {
  if (!showRulers) return null;

  const rulerSize = 20;
  const majorStep = 50;
  const minorStep = 10;

  const generateMarks = (length: number, isVertical: boolean) => {
    const marks = [];
    const adjustedLength = length / zoom;
    const offset = isVertical ? panOffset.y : panOffset.x;
    
    for (let i = 0; i <= adjustedLength; i += minorStep) {
      const position = (i * zoom) + offset;
      const isMajor = i % majorStep === 0;
      
      if (position >= 0 && position <= length) {
        marks.push(
          <div
            key={i}
            className="absolute bg-foreground/60"
            style={{
              [isVertical ? 'top' : 'left']: `${position}px`,
              [isVertical ? 'left' : 'top']: isMajor ? '8px' : '12px',
              [isVertical ? 'width' : 'height']: isMajor ? '12px' : '8px',
              [isVertical ? 'height' : 'width']: '1px',
            }}
          />
        );
        
        if (isMajor && i > 0) {
          marks.push(
            <div
              key={`label-${i}`}
              className="absolute text-xs text-foreground/70 font-mono"
              style={{
                [isVertical ? 'top' : 'left']: `${position - 8}px`,
                [isVertical ? 'left' : 'top']: '2px',
                fontSize: '10px',
                transform: isVertical ? 'rotate(-90deg)' : 'none',
                transformOrigin: 'center',
              }}
            >
              {i}
            </div>
          );
        }
      }
    }
    
    return marks;
  };

  return (
    <>
      {/* Horizontal Ruler */}
      <div 
        className="absolute top-0 left-5 bg-muted/90 border-b border-border pointer-events-none"
        style={{ 
          width: `calc(100% - ${rulerSize}px)`, 
          height: `${rulerSize}px`,
          zIndex: 5
        }}
      >
        {generateMarks(canvasWidth, false)}
      </div>

      {/* Vertical Ruler */}
      <div 
        className="absolute left-0 top-5 bg-muted/90 border-r border-border pointer-events-none"
        style={{ 
          height: `calc(100% - ${rulerSize}px)`, 
          width: `${rulerSize}px`,
          zIndex: 5
        }}
      >
        {generateMarks(canvasHeight, true)}
      </div>

      {/* Corner */}
      <div 
        className="absolute top-0 left-0 bg-muted border-r border-b border-border"
        style={{ 
          width: `${rulerSize}px`, 
          height: `${rulerSize}px`,
          zIndex: 6
        }}
      />
    </>
  );
};