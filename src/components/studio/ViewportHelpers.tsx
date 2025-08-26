import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useStudioStore } from '../../lib/studio/store';
import { ViewportManager, BoundingBoxManager } from '../../lib/studio/garmentScaling';

interface ViewportHelpersProps {
  garmentType: string;
  showBoundingBox?: boolean;
  showGrid?: boolean;
  showRulers?: boolean;
  gridSize?: number;
}

export const ViewportHelpers: React.FC<ViewportHelpersProps> = ({
  garmentType,
  showBoundingBox = false,
  showGrid = false,
  showRulers = false,
  gridSize = 1
}) => {
  const { doc } = useStudioStore();
  
  // Get garment bounds for helpers
  const garmentBounds = useMemo(() => 
    ViewportManager.getGarmentBounds(garmentType), [garmentType]
  );
  
  const anchorPosition = useMemo(() => 
    ViewportManager.getAnchorPosition(garmentType, garmentBounds), [garmentType, garmentBounds]
  );

  // Generate bounding box
  const boundingBoxGeometry = useMemo(() => {
    if (!showBoundingBox) return null;
    return BoundingBoxManager.createBoundingBox(garmentBounds, '#00ff00');
  }, [showBoundingBox, garmentBounds]);

  // Generate snap grid
  const snapGridGeometry = useMemo(() => {
    if (!showGrid) return null;
    return BoundingBoxManager.createSnapGrid(garmentBounds, gridSize);
  }, [showGrid, garmentBounds, gridSize]);

  // Generate rulers
  const rulersGeometry = useMemo(() => {
    if (!showRulers) return null;
    return BoundingBoxManager.createRulers(garmentBounds);
  }, [showRulers, garmentBounds]);

  return (
    <group position={anchorPosition}>
      {/* Bounding Box */}
      {boundingBoxGeometry && (
        <primitive 
          object={boundingBoxGeometry} 
          material={new THREE.LineBasicMaterial({ 
            color: 'hsl(var(--primary))', 
            opacity: 0.6,
            transparent: true
          })}
        />
      )}
      
      {/* Snap Grid */}
      {snapGridGeometry && (
        <primitive 
          object={snapGridGeometry}
          material={new THREE.LineBasicMaterial({ 
            color: 'hsl(var(--muted-foreground))', 
            opacity: 0.3,
            transparent: true
          })}
        />
      )}
      
      {/* Rulers */}
      {rulersGeometry && (
        <primitive 
          object={rulersGeometry}
          material={new THREE.LineBasicMaterial({ 
            color: 'hsl(var(--accent))', 
            opacity: 0.8,
            transparent: true
          })}
        />
      )}
    </group>
  );
};