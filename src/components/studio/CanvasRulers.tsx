import React from 'react';

export type Units = 'pixels' | 'inches' | 'cm';

interface CanvasRulersProps {
  zoom: number;
  panOffset: { x: number; y: number };
  canvasWidth: number;
  canvasHeight: number;
  showRulers?: boolean;
  units?: Units;
}

export const CanvasRulers = ({ 
  zoom, 
  panOffset, 
  canvasWidth, 
  canvasHeight,
  showRulers = true,
  units = 'pixels'
}: CanvasRulersProps) => {
  if (!showRulers) return null;

  const rulerSize = 20;
  const tickInterval = 50 * zoom;
  const minorTickInterval = 10 * zoom;

  const formatValue = (value: number) => {
    switch (units) {
      case 'inches':
        return (value / 96).toFixed(1) + '"'; // 96 DPI
      case 'cm':
        return (value / 37.8).toFixed(1) + 'cm'; // ~37.8 pixels per cm
      default:
        return value + 'px';
    }
  };

  const generateTicks = (length: number, offset: number) => {
    const ticks = [];
    const start = Math.floor(-offset / tickInterval) * tickInterval;
    const end = length + Math.abs(start);

    for (let i = start; i <= end; i += minorTickInterval) {
      const pos = i + offset;
      if (pos >= 0 && pos <= length) {
        const isMajor = i % tickInterval === 0;
        ticks.push({
          position: pos,
          value: Math.round(i / zoom),
          isMajor
        });
      }
    }
    return ticks;
  };

  const horizontalTicks = generateTicks(canvasWidth, panOffset.x);
  const verticalTicks = generateTicks(canvasHeight, panOffset.y);

  return (
    <>
      {/* Horizontal Ruler */}
      <div 
        className="absolute top-0 left-5 right-0 bg-card border-b border-border/50 text-xs overflow-hidden"
        style={{ height: rulerSize, zIndex: 10 }}
      >
        <div className="relative w-full h-full">
          {horizontalTicks.map((tick, index) => (
            <div
              key={index}
              className="absolute border-l border-muted-foreground/30"
              style={{
                left: tick.position,
                height: tick.isMajor ? '100%' : '50%',
                top: tick.isMajor ? 0 : '50%'
              }}
            >
              {tick.isMajor && (
                <span 
                  className="absolute top-1 text-[10px] text-muted-foreground ml-1"
                  style={{ transform: 'translateX(-50%)' }}
                >
                  {formatValue(tick.value)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vertical Ruler */}
      <div 
        className="absolute top-5 left-0 bottom-0 bg-card border-r border-border/50 text-xs overflow-hidden"
        style={{ width: rulerSize, zIndex: 10 }}
      >
        <div className="relative w-full h-full">
          {verticalTicks.map((tick, index) => (
            <div
              key={index}
              className="absolute border-t border-muted-foreground/30"
              style={{
                top: tick.position,
                width: tick.isMajor ? '100%' : '50%',
                left: tick.isMajor ? 0 : '50%'
              }}
            >
              {tick.isMajor && (
                <span 
                  className="absolute left-1 text-[10px] text-muted-foreground"
                  style={{ 
                    transform: 'translateY(-50%) rotate(-90deg)',
                    transformOrigin: 'left center'
                  }}
                >
                  {formatValue(tick.value)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Corner Square */}
      <div 
        className="absolute top-0 left-0 bg-card border-r border-b border-border/50"
        style={{ width: rulerSize, height: rulerSize, zIndex: 11 }}
      />
    </>
  );
};