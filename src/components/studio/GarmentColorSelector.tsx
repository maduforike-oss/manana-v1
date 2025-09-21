import React from 'react';
import { EnhancedColorSelector, TSHIRT_COLORS } from './EnhancedColorSelector';
import { useStudioStore } from '@/lib/studio/store';

export const GarmentColorSelector = () => {
  const { doc, updateCanvas } = useStudioStore();

  const handleColorChange = (colorId: string) => {
    updateCanvas({ garmentColor: colorId });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-lg border">
      <span className="text-sm font-medium text-muted-foreground">Garment:</span>
      <EnhancedColorSelector
        mode="garment"
        currentColor={doc.canvas.garmentColor || 'white'}
        onColorChange={handleColorChange}
        showHex={false}
      />
    </div>
  );
};

// Export colors for backward compatibility
export { TSHIRT_COLORS };