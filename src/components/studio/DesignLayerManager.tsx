import React, { useRef, useEffect, useState } from 'react';
import { Layer } from 'react-konva';
import { useStudioStore } from '@/lib/studio/store';
import { LayerSystem } from '@/lib/studio/layerSystem';

interface DesignLayerManagerProps {
  children: React.ReactNode;
  garmentWidth: number;
  garmentHeight: number;
  printArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const DesignLayerManager: React.FC<DesignLayerManagerProps> = ({
  children,
  garmentWidth,
  garmentHeight,
  printArea
}) => {
  const layerRef = useRef<any>(null);
  const [layerSystem, setLayerSystem] = useState<LayerSystem | null>(null);
  const { doc, updateNode, addNode } = useStudioStore();

  // Initialize layer system
  useEffect(() => {
    const system = new LayerSystem(printArea.width, printArea.height);
    setLayerSystem(system);

    return () => {
      system.dispose();
    };
  }, [printArea.width, printArea.height]);

  // Update layer system when nodes change
  useEffect(() => {
    if (!layerSystem) return;

    // Clear existing layers except background
    const layers = layerSystem.getLayersInOrder();
    layers.forEach(layer => {
      if (layer.id !== 'background') {
        layerSystem.deleteLayer(layer.id);
      }
    });

    // Add nodes as layers
    doc.nodes.forEach(node => {
      const layer = layerSystem.createLayer(node.id, node.name || node.type);
      // Update layer properties based on node
      layerSystem.updateLayerProperty(layer.id, 'visible', !node.hidden);
      layerSystem.updateLayerProperty(layer.id, 'opacity', node.opacity);
      layerSystem.updateLayerProperty(layer.id, 'locked', !!node.locked);
    });
  }, [doc.nodes, layerSystem]);

  return (
    <Layer ref={layerRef}>
      {/* Design area boundary visualization */}
      {children}
    </Layer>
  );
};