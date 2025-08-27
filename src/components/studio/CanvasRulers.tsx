import React from 'react';

interface CanvasRulersProps {
  zoom: number;
  panOffset: { x: number; y: number };
  showRulers: boolean;
  canvasWidth: number;
  canvasHeight: number;
  units?: 'pixels' | 'inches' | 'cm';
}

export const CanvasRulers = ({ 
  zoom, 
  panOffset, 
  showRulers, 
  canvasWidth, 
  canvasHeight,
  units = 'pixels'
}: CanvasRulersProps) => {
  if (!showRulers) return null;

  const rulerSize = 24;
  
  // Unit conversion functions
  const convertToUnits = (pixels: number): string => {
    const dpi = 72; // Standard screen DPI
    switch (units) {
      case 'inches':
        return (pixels / dpi).toFixed(2);
      case 'cm':
        return (pixels / dpi * 2.54).toFixed(1);
      default:
        return Math.round(pixels).toString();
    }
  };

  const getUnitSymbol = (): string => {
    switch (units) {
      case 'inches': return '"';
      case 'cm': return 'cm';
      default: return 'px';
    }
  };

  // Dynamic step calculation based on zoom level
  const getStepSizes = () => {
    const baseStep = units === 'pixels' ? 50 : (units === 'inches' ? 72 : 28.35); // 1 inch or 1cm in pixels
    const scaledStep = baseStep * zoom;
    
    if (scaledStep < 20) {
      // Too small, use larger steps
      return {
        majorStep: baseStep * (units === 'pixels' ? 4 : 2),
        minorStep: baseStep * (units === 'pixels' ? 1 : 0.5),
      };
    } else if (scaledStep > 200) {
      // Too large, use smaller steps
      return {
        majorStep: baseStep * (units === 'pixels' ? 0.5 : 0.25),
        minorStep: baseStep * (units === 'pixels' ? 0.1 : 0.125),
      };
    }
    
    return {
      majorStep: baseStep,
      minorStep: baseStep * (units === 'pixels' ? 0.2 : 0.25),
    };
  };

  const { majorStep, minorStep } = getStepSizes();

  const generateMarks = (length: number, isVertical: boolean) => {
    const marks = [];
    const adjustedLength = length / zoom;
    const offset = isVertical ? panOffset.y : panOffset.x;
    
    for (let i = 0; i <= adjustedLength + majorStep; i += minorStep) {
      const position = (i * zoom) + offset;
      const isMajor = Math.abs(i % majorStep) < 0.1;
      
      if (position >= -10 && position <= length + 10) {
        marks.push(
          <div
            key={`mark-${i}`}
            className="absolute bg-foreground/70"
            style={{
              [isVertical ? 'top' : 'left']: `${position}px`,
              [isVertical ? 'left' : 'top']: isMajor ? '6px' : '14px',
              [isVertical ? 'width' : 'height']: isMajor ? '18px' : '10px',
              [isVertical ? 'height' : 'width']: '1px',
            }}
          />
        );
        
        if (isMajor && i > 0) {
          const value = convertToUnits(i);
          marks.push(
            <div
              key={`label-${i}`}
              className="absolute text-xs text-foreground/80 font-mono leading-none select-none"
              style={{
                [isVertical ? 'top' : 'left']: `${position - (isVertical ? 20 : 15)}px`,
                [isVertical ? 'left' : 'top']: isVertical ? '1px' : '1px',
                fontSize: '9px',
                transform: isVertical ? 'rotate(-90deg)' : 'none',
                transformOrigin: isVertical ? '8px 8px' : 'center',
                width: isVertical ? '16px' : 'auto',
                textAlign: 'center' as const,
              }}
            >
              {value}
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

      {/* Corner with unit indicator */}
      <div 
        className="absolute top-0 left-0 bg-muted border-r border-b border-border flex items-center justify-center"
        style={{ 
          width: `${rulerSize}px`, 
          height: `${rulerSize}px`,
          zIndex: 6
        }}
      >
        <span className="text-xs font-mono text-foreground/60 select-none">
          {getUnitSymbol()}
        </span>
      </div>
    </>
  );
};