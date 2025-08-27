import React, { useMemo } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import whiteShirt from '@/assets/mockups/tshirt-white-front-clean.jpg';
import blackShirt from '@/assets/mockups/tshirt-black-front-clean.jpg';
import navyShirt from '@/assets/mockups/tshirt-navy-front-clean.jpg';
import grayShirt from '@/assets/mockups/tshirt-gray-front-clean.jpg';

interface Enhanced2DMockupProps {
  className?: string;
}

const TSHIRT_COLORS = [
  { id: 'white', name: 'White', hex: '#FFFFFF', image: whiteShirt },
  { id: 'black', name: 'Black', hex: '#000000', image: blackShirt },
  { id: 'navy', name: 'Navy', hex: '#1A237E', image: navyShirt },
  { id: 'gray', name: 'Heather Gray', hex: '#B8B8B8', image: grayShirt },
];

export const Enhanced2DMockup: React.FC<Enhanced2DMockupProps> = ({ className = '' }) => {
  const { doc } = useStudioStore();
  
  const currentColor = useMemo(() => {
    return TSHIRT_COLORS.find(color => color.id === doc.canvas.garmentColor) || TSHIRT_COLORS[0];
  }, [doc.canvas.garmentColor]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* T-Shirt Base */}
      <div className="relative w-[400px] h-[400px]">
        <img
          src={currentColor.image}
          alt={`${currentColor.name} T-Shirt`}
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