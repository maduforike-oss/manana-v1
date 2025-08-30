import React, { useMemo } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { CanvasImageLoader } from './CanvasImageLoader';
import { TSHIRT_COLORS } from './ColorSelector';

interface Enhanced2DMockupProps {
  className?: string;
}

export const Enhanced2DMockup: React.FC<Enhanced2DMockupProps> = ({ className = '' }) => {
  const { doc } = useStudioStore();
  
  const currentColor = useMemo(() => {
    return TSHIRT_COLORS.find(color => color.id === doc.canvas.garmentColor) || TSHIRT_COLORS[0];
  }, [doc.canvas.garmentColor]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* T-Shirt Base - Now uses dynamic image loader */}
      <div className="relative w-[400px] h-[400px]">
        <CanvasImageLoader
          garmentId={doc.canvas.garmentType || 't-shirt'}
          orientation="front"
          className="w-full h-full object-contain"
          style={{
            filter: currentColor.id !== 'white' ? 'none' : 'brightness(1.05)'
          }}
        />
        
        {/* Design Area Overlay */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '200px',
            height: '200px',
            marginTop: '-20px', // Adjust for t-shirt design area
          }}
        >
          {/* This will be where Konva stage renders */}
          <div className="w-full h-full border-2 border-dashed border-gray-300 opacity-30 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export { TSHIRT_COLORS };