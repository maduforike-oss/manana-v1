import React from 'react';

interface PrecisionRulersProps {
  zoom: number;
  panOffset: { x: number; y: number };
  showRulers: boolean;
  unit: 'px' | 'mm' | 'cm' | 'in';
  canvasWidth: number;
  canvasHeight: number;
  mousePosition?: { x: number; y: number };
}

export const PrecisionRulers: React.FC<PrecisionRulersProps> = ({
  zoom,
  panOffset,
  showRulers,
  unit,
  canvasWidth,
  canvasHeight,
  mousePosition
}) => {
  if (!showRulers) return null;

  const RULER_SIZE = 24;
  const unitConverters = {
    px: 1,
    mm: 3.7795275591, // 1mm = 3.78px at 96 DPI
    cm: 37.795275591, // 1cm = 37.8px at 96 DPI
    in: 96 // 1in = 96px at 96 DPI
  };

  const pixelsPerUnit = unitConverters[unit];
  const stepSize = Math.max(1, Math.min(100, Math.floor(50 / (zoom * pixelsPerUnit)))) * pixelsPerUnit;
  
  const generateTicks = (length: number, isHorizontal: boolean) => {
    const ticks = [];
    const startOffset = isHorizontal ? panOffset.x : panOffset.y;
    const firstTick = Math.floor(-startOffset / (stepSize * zoom)) * stepSize;
    const maxTicks = 100; // Prevent excessive tick generation
    const tickCount = Math.min(maxTicks, Math.ceil((length + Math.abs(startOffset)) / (stepSize * zoom)) + 2);

    for (let i = 0; i < tickCount; i++) {
      const value = firstTick + (i * stepSize);
      const position = (value * zoom) + startOffset;
      
      // Stricter bounds checking to prevent overflow
      if (position >= -stepSize * zoom && position <= length + stepSize * zoom && 
          position >= -1000 && position <= length + 1000) {
        const label = (value / pixelsPerUnit).toFixed(value % pixelsPerUnit === 0 ? 0 : 1);
        ticks.push({
          position,
          value,
          label: `${label}${unit}`,
          isMajor: value % (stepSize * 2) === 0
        });
      }
    }
    
    return ticks;
  };

  const horizontalTicks = generateTicks(canvasWidth, true);
  const verticalTicks = generateTicks(canvasHeight, false);

  return (
    <>
      {/* Corner */}
      <div 
        className="absolute top-0 left-0 bg-background border-r border-b border-border z-20"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      />
      
      {/* Horizontal Ruler */}
      <div 
        className="absolute top-0 bg-background border-b border-border z-10 overflow-hidden"
        style={{ 
          left: RULER_SIZE, 
          right: 0, 
          height: RULER_SIZE 
        }}
      >
        <div className="relative h-full">
          {horizontalTicks.map((tick, index) => (
            <div
              key={index}
              className="absolute flex flex-col items-center"
              style={{ left: tick.position }}
            >
              <div 
                className="bg-foreground"
                style={{ 
                  width: '1px', 
                  height: tick.isMajor ? '12px' : '6px',
                  marginTop: tick.isMajor ? '0px' : '6px'
                }}
              />
              {tick.isMajor && (
                <span 
                  className="text-xs text-foreground absolute"
                  style={{ top: '12px', fontSize: '10px' }}
                >
                  {tick.label}
                </span>
              )}
            </div>
          ))}
          
          {/* Mouse position indicator */}
          {mousePosition && (
            <div
              className="absolute top-0 w-px h-full bg-accent animate-in fade-in duration-100"
              style={{ left: (mousePosition.x * zoom) + panOffset.x }}
            />
          )}
        </div>
      </div>

      {/* Vertical Ruler */}
      <div 
        className="absolute left-0 bg-background border-r border-border z-10 overflow-hidden"
        style={{ 
          top: RULER_SIZE, 
          bottom: 0, 
          width: RULER_SIZE 
        }}
      >
        <div className="relative w-full h-full">
          {verticalTicks.map((tick, index) => (
            <div
              key={index}
              className="absolute flex items-center"
              style={{ top: tick.position }}
            >
              <div 
                className="bg-foreground"
                style={{ 
                  height: '1px', 
                  width: tick.isMajor ? '12px' : '6px',
                  marginLeft: tick.isMajor ? '0px' : '6px'
                }}
              />
              {tick.isMajor && (
                <span 
                  className="text-xs text-foreground absolute transform -rotate-90 origin-center"
                  style={{ 
                    left: '12px', 
                    fontSize: '10px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tick.label}
                </span>
              )}
            </div>
          ))}
          
          {/* Mouse position indicator */}
          {mousePosition && (
            <div
              className="absolute left-0 w-full h-px bg-accent animate-in fade-in duration-100"
              style={{ top: (mousePosition.y * zoom) + panOffset.y }}
            />
          )}
        </div>
      </div>
    </>
  );
};