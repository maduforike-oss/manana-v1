import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useStudioStore } from '@/lib/studio/store';
import { TSHIRT_COLORS } from './Enhanced2DMockup';

export const ColorSelector = () => {
  const { doc, updateCanvas } = useStudioStore();

  const handleColorChange = (colorId: string) => {
    updateCanvas({ garmentColor: colorId });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground">Color:</span>
      <div className="flex gap-1">
        {TSHIRT_COLORS.map((color) => (
          <Button
            key={color.id}
            variant="outline"
            size="sm"
            className={`relative w-10 h-10 p-0 border-2 ${
              doc.canvas.garmentColor === color.id 
                ? 'border-primary' 
                : 'border-border hover:border-muted-foreground'
            }`}
            onClick={() => handleColorChange(color.id)}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {doc.canvas.garmentColor === color.id && (
              <Check 
                size={16} 
                className={color.id === 'white' ? 'text-black' : 'text-white'} 
              />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};