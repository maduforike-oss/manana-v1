import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Image } from 'react-konva';
import { useStudioSelectors, useStudioActions, useViewport } from '../../lib/studio/storeSelectors';
import { getGarmentById } from '@/lib/studio/garments';
import { Canvas3D } from './Canvas3D';
import { Canvas3DControls } from './Canvas3DControls';
import { VirtualCanvas } from './optimized/VirtualCanvas';

export const SimplifiedCanvasStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [garmentImage, setGarmentImage] = useState<HTMLImageElement | null>(null);
  
  // Optimized selectors
  const { doc, canvasMetrics, viewportState } = useStudioSelectors();
  const { selectNode, clearSelection, updateNode } = useStudioActions();
  const { zoom, panOffset } = useViewport();
  
  // Simplified image loading
  useEffect(() => {
    const garmentType = canvasMetrics.garmentType || 't-shirt';
    const garment = getGarmentById(garmentType);
    
    if (garment) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setGarmentImage(img);
      img.src = garment.images.front;
    }
  }, [canvasMetrics.garmentType]);

  // Responsive stage sizing
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setStageSize({ width: clientWidth, height: clientHeight });
        }
      }
    };

    const observer = new ResizeObserver(updateStageSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Simplified layout calculations
  const layoutMetrics = useMemo(() => {
    const garmentWidth = 400;
    const garmentHeight = 500;
    const printAreaWidth = garmentWidth * 0.5;
    const printAreaHeight = garmentHeight * 0.4;
    
    const printBaseX = stageSize.width / 2 - printAreaWidth / 2;
    const printBaseY = stageSize.height / 2 - printAreaHeight / 2;
    const scaleX = printAreaWidth / canvasMetrics.width;
    const scaleY = printAreaHeight / canvasMetrics.height;

    return { printBaseX, printBaseY, scaleX, scaleY };
  }, [stageSize, canvasMetrics.width, canvasMetrics.height]);

  // Viewport for virtual rendering
  const viewport = useMemo(() => ({
    x: panOffset.x,
    y: panOffset.y,
    width: stageSize.width,
    height: stageSize.height,
    zoom
  }), [panOffset, stageSize, zoom]);

  // Simple stage click handler
  const handleStageClick = React.useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);

  // 3D mode
  if (viewportState.is3DMode) {
    return (
      <div ref={containerRef} className="relative w-full h-full bg-background">
        <Canvas3D />
        <Canvas3DControls />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-background">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onClick={handleStageClick}
        className="cursor-crosshair"
      >
        <Layer>
          {/* Simplified garment background */}
          {garmentImage && (
            <Image
              image={garmentImage}
              x={stageSize.width / 2 - 200}
              y={stageSize.height / 2 - 250}
              width={400}
              height={500}
              opacity={0.4}
              listening={false}
            />
          )}
          
          {/* Virtual Canvas for nodes */}
          <VirtualCanvas
            nodes={doc.nodes}
            selectedIds={doc.selectedIds}
            layoutMetrics={layoutMetrics}
            viewport={viewport}
            activeTool="select"
            snapEnabled={false}
            snapToGrid={false}
            gridSize={20}
            onSelectNode={selectNode}
            onUpdateNode={updateNode}
          />
        </Layer>
      </Stage>
    </div>
  );
};