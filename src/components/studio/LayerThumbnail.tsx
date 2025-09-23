import React, { useMemo } from 'react';
import { Node, TextNode, ShapeNode, ImageNode, BrushStrokeNode } from '@/lib/studio/types';
import { Type, Square, Circle, Triangle, Star, Image as ImageIcon, Brush, Palette } from 'lucide-react';

interface LayerThumbnailProps {
  node: Node;
  size?: number;
  className?: string;
}

export const LayerThumbnail: React.FC<LayerThumbnailProps> = ({ 
  node, 
  size = 24, 
  className = '' 
}) => {
  const thumbnailContent = useMemo(() => {
    const iconSize = Math.max(12, size * 0.5);
    
    switch (node.type) {
      case 'text': {
        const textNode = node as TextNode;
        const fontSize = Math.max(8, size * 0.4);
        return (
          <div 
            className="w-full h-full flex items-center justify-center text-center overflow-hidden"
            style={{ 
              fontSize: `${fontSize}px`,
              fontFamily: textNode.fontFamily,
              color: textNode.fill.type === 'solid' ? textNode.fill.color : '#000',
              fontWeight: textNode.fontWeight
            }}
          >
            <span className="truncate px-1">
              {textNode.text.substring(0, 3) || 'T'}
            </span>
          </div>
        );
      }
      
      case 'shape': {
        const shapeNode = node as ShapeNode;
        const strokeColor = shapeNode.stroke?.color || '#000';
        const fillColor = shapeNode.fill.type === 'solid' ? shapeNode.fill.color : 'transparent';
        const strokeWidth = Math.max(1, (shapeNode.stroke?.width || 2) * (size / 100));
        
        const svgSize = size - 4;
        const center = svgSize / 2;
        const radius = Math.min(center - strokeWidth, center * 0.7);
        
        return (
          <svg 
            width={svgSize} 
            height={svgSize} 
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            className="absolute inset-0 m-auto"
          >
            {(() => {
              switch (shapeNode.shape) {
                case 'circle':
                  return (
                    <circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                  );
                case 'triangle':
                  const height = radius * Math.sqrt(3);
                  const y1 = center - height / 2;
                  const y2 = center + height / 2;
                  const x1 = center - radius;
                  const x2 = center + radius;
                  return (
                    <polygon
                      points={`${center},${y1} ${x1},${y2} ${x2},${y2}`}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                  );
                case 'star':
                  // Simplified star shape
                  const outerRadius = radius;
                  const innerRadius = radius * 0.4;
                  const points = [];
                  for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                    const outerX = center + outerRadius * Math.cos(angle);
                    const outerY = center + outerRadius * Math.sin(angle);
                    points.push(`${outerX},${outerY}`);
                    
                    const innerAngle = angle + Math.PI / 5;
                    const innerX = center + innerRadius * Math.cos(innerAngle);
                    const innerY = center + innerRadius * Math.sin(innerAngle);
                    points.push(`${innerX},${innerY}`);
                  }
                  return (
                    <polygon
                      points={points.join(' ')}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                  );
                default: // rectangle
                  const rectSize = radius * 1.4;
                  const rectX = center - rectSize / 2;
                  const rectY = center - rectSize / 2;
                  return (
                    <rect
                      x={rectX}
                      y={rectY}
                      width={rectSize}
                      height={rectSize}
                      rx={shapeNode.radius ? Math.min(shapeNode.radius, rectSize / 4) : 2}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                    />
                  );
              }
            })()}
          </svg>
        );
      }
      
      case 'image': {
        const imageNode = node as ImageNode;
        if (imageNode.src) {
          return (
            <img
              src={imageNode.src}
              alt="Layer thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon on error
                const target = e.target as HTMLElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground">
                      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          );
        }
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground">
            <ImageIcon size={iconSize} />
          </div>
        );
      }
      
      case 'brush-stroke': {
        const brushNode = node as BrushStrokeNode;
        const color = brushNode.strokeData.color;
        const isEraser = brushNode.strokeData.isEraser;
        
        return (
          <div className="w-full h-full flex items-center justify-center relative">
            {isEraser ? (
              <div className="w-full h-full bg-white border border-muted-foreground/30 relative">
                <div className="absolute inset-1 bg-transparent border-2 border-dashed border-muted-foreground/50 rounded" />
              </div>
            ) : (
              <svg width={size - 4} height={size - 4} viewBox="0 0 24 24" className="absolute inset-0 m-auto">
                <path
                  d="M3 12 L8 7 L12 11 L16 7 L21 12 L18 15 L14 11 L10 15 L6 11 L3 12"
                  fill={color}
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.8"
                />
              </svg>
            )}
          </div>
        );
      }
      
      case 'path':
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground">
            <Palette size={iconSize} />
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground">
            <Square size={iconSize} />
          </div>
        );
    }
  }, [node, size]);

  return (
    <div 
      className={`relative overflow-hidden bg-white ${className}`}
      style={{ 
        width: size, 
        height: size,
        minWidth: size,
        minHeight: size
      }}
    >
      {thumbnailContent}
    </div>
  );
};