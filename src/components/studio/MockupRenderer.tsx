import React, { useMemo } from 'react';
import { useStudioStore } from '../../lib/studio/store';
import { getGarmentById, getColorByGarmentAndId } from '@/lib/studio/garments';
import { cn } from '@/lib/utils';

interface MockupRendererProps {
  className?: string;
  showPreview?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MockupRenderer: React.FC<MockupRendererProps> = ({ 
  className, 
  showPreview = true,
  size = 'md' 
}) => {
  const { doc, mockup } = useStudioStore();
  
  // Get garment data from canvas metadata
  const garmentType = doc.canvas.garmentType || 't-shirt';
  const garmentColor = doc.canvas.garmentColor || 'white';
  
  const garment = getGarmentById(garmentType);
  const color = getColorByGarmentAndId(garmentType, garmentColor);
  
  // Calculate dynamic sizing based on size prop
  const sizeClasses = {
    sm: 'w-48 h-64',
    md: 'w-64 h-80',
    lg: 'w-80 h-96',
    xl: 'w-96 h-[30rem]'
  };

  // Generate color filter for garment based on selected color
  const colorFilter = useMemo(() => {
    if (!color || color.id === 'white') return 'none';
    
    const hex = color.hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Convert to HSL for better color manipulation
    const hsl = rgbToHsl(r, g, b);
    const hue = hsl[0] * 360;
    const saturation = hsl[1] * 100;
    const lightness = hsl[2] * 100;
    
    // Create sophisticated color overlay
    return `
      hue-rotate(${hue}deg) 
      saturate(${saturation}%) 
      brightness(${lightness}%) 
      contrast(${color.fabric === 'heather' ? '90%' : '100%'})
    `;
  }, [color]);

  // Render design elements on the mockup
  const renderDesignLayer = () => {
    if (!showPreview || doc.nodes.length === 0) return null;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative"
          style={{
            width: `${doc.canvas.width * 0.3}px`,
            height: `${doc.canvas.height * 0.3}px`,
            opacity: mockup.opacity
          }}
        >
          {doc.nodes.map((node) => (
            <div
              key={node.id}
              className="absolute"
              style={{
                left: `${(node.x / doc.canvas.width) * 100}%`,
                top: `${(node.y / doc.canvas.height) * 100}%`,
                width: `${(node.width / doc.canvas.width) * 100}%`,
                height: `${(node.height / doc.canvas.height) * 100}%`,
                transform: `rotate(${node.rotation || 0}deg)`,
              }}
            >
              {node.type === 'text' && (
                <div
                  style={{
                    fontSize: `${node.fontSize || 16}px`,
                    fontFamily: node.fontFamily || 'Inter',
                    fontWeight: node.fontWeight || 400,
                    color: typeof node.fill === 'string' ? node.fill : node.fill?.color || '#000000',
                    textAlign: node.align || 'left',
                  }}
                  className="whitespace-pre-wrap"
                >
                  {node.text}
                </div>
              )}
              
              {node.type === 'shape' && node.shape === 'rect' && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: typeof node.fill === 'string' ? node.fill : node.fill?.color || '#000000',
                    borderRadius: `${node.radius || 0}px`,
                    border: node.stroke ? `${node.stroke.width || 1}px solid ${node.stroke.color}` : 'none',
                  }}
                />
              )}
              
              {node.type === 'shape' && node.shape === 'circle' && (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: typeof node.fill === 'string' ? node.fill : node.fill?.color || '#000000',
                    borderRadius: '50%',
                    border: node.stroke ? `${node.stroke.width || 1}px solid ${node.stroke.color}` : 'none',
                  }}
                />
              )}
              
              {node.type === 'image' && node.src && (
                <img
                  src={node.src}
                  alt="Design element"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!garment) {
    return (
      <div className={cn("bg-muted rounded-lg flex items-center justify-center", sizeClasses[size], className)}>
        <span className="text-muted-foreground">No garment selected</span>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg overflow-hidden shadow-lg", sizeClasses[size], className)}>
      {/* Studio Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10" />
      
      {/* Garment Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={garment.images.front}
          alt={`${garment.name} in ${color?.name || 'default'}`}
          className="w-full h-full object-contain transition-all duration-300"
          style={{
            filter: colorFilter,
          }}
        />
        
        {/* Design Layer */}
        {renderDesignLayer()}
        
        {/* Professional Overlay Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/5 pointer-events-none" />
      </div>
      
      {/* Garment Info Overlay */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1 text-white text-xs">
          <div className="font-medium">{garment.name}</div>
          <div className="opacity-80">{color?.name || 'Default'}</div>
        </div>
      </div>
      
      {/* Premium Quality Indicator */}
      <div className="absolute top-2 right-2">
        <div className="bg-primary/90 backdrop-blur-sm rounded-full px-2 py-1 text-primary-foreground text-xs font-medium">
          HD
        </div>
      </div>
    </div>
  );
};

// Helper function to convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}