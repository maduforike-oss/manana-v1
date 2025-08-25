import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image } from 'react-konva';
import { useStudioStore } from '../../lib/studio/store';
import { getGarmentById, getColorByGarmentAndId } from '@/lib/studio/garments';

export const CanvasStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [garmentImage, setGarmentImage] = useState<HTMLImageElement | null>(null);
  const { doc, zoom, panOffset, clearSelection, selectNode, activeTool } = useStudioStore();

  // Load garment image
  useEffect(() => {
    const garmentType = doc.canvas.garmentType || 't-shirt';
    const garmentColor = doc.canvas.garmentColor || 'white';
    
    const garment = getGarmentById(garmentType);
    if (garment) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setGarmentImage(img);
      };
      img.src = garment.images.front;
    }
  }, [doc.canvas.garmentType, doc.canvas.garmentColor]);

  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setStageSize({
            width: clientWidth,
            height: clientHeight
          });
        }
      }
    };

    // Initial size update
    const timer = setTimeout(updateStageSize, 0);
    
    window.addEventListener('resize', updateStageSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateStageSize);
    };
  }, []);

  const handleStageClick = (e: any) => {
    // If clicking on stage background, clear selection
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    // Update zoom in store
    useStudioStore.getState().setZoom(newScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    useStudioStore.getState().setPanOffset(newPos);
  };

  // Calculate garment dimensions and print area
  const garmentWidth = 400;
  const garmentHeight = 500;
  const printAreaX = garmentWidth * 0.25; // 25% from left
  const printAreaY = garmentHeight * 0.3; // 30% from top
  const printAreaWidth = garmentWidth * 0.5; // 50% of garment width
  const printAreaHeight = garmentHeight * 0.4; // 40% of garment height

  // Don't render Stage until we have valid dimensions
  if (stageSize.width === 0 || stageSize.height === 0) {
    return (
      <div ref={containerRef} className="flex-1 bg-workspace overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/80">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Loading design studio...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 bg-workspace overflow-hidden relative">
      {/* Grid Background */}
      {doc.canvas.showGrid && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--workspace-border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--workspace-border)) 1px, transparent 1px)
            `,
            backgroundSize: `${doc.canvas.gridSize * zoom}px ${doc.canvas.gridSize * zoom}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
          }}
        />
      )}
      
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={panOffset.x}
        y={panOffset.y}
        onClick={handleStageClick}
        onWheel={handleWheel}
        draggable={activeTool === 'hand'}
        onDragEnd={(e) => {
          useStudioStore.getState().setPanOffset({ x: e.target.x(), y: e.target.y() });
        }}
      >
        <Layer>
          {/* Garment Background */}
          {garmentImage && (
            <Image
              image={garmentImage}
              x={stageSize.width / 2 - garmentWidth / 2}
              y={stageSize.height / 2 - garmentHeight / 2}
              width={garmentWidth}
              height={garmentHeight}
              opacity={0.8}
            />
          )}

          {/* Print Area Outline (subtle) */}
          <Rect
            x={stageSize.width / 2 - garmentWidth / 2 + printAreaX}
            y={stageSize.height / 2 - garmentHeight / 2 + printAreaY}
            width={printAreaWidth}
            height={printAreaHeight}
            fill="transparent"
            stroke="hsl(var(--primary))"
            strokeWidth={1 / zoom}
            opacity={0.3}
            dash={[5 / zoom, 5 / zoom]}
          />

          {/* Render design nodes */}
          {doc.nodes.map((node) => {
            const isSelected = doc.selectedIds.includes(node.id);
            // Map design coordinates to print area
            const printBaseX = stageSize.width / 2 - garmentWidth / 2 + printAreaX;
            const printBaseY = stageSize.height / 2 - garmentHeight / 2 + printAreaY;
            const scaleX = printAreaWidth / doc.canvas.width;
            const scaleY = printAreaHeight / doc.canvas.height;

            if (node.type === 'shape') {
              if (node.shape === 'rect') {
                return (
                  <Rect
                    key={node.id}
                    x={printBaseX + node.x * scaleX}
                    y={printBaseY + node.y * scaleY}
                    width={node.width * scaleX}
                    height={node.height * scaleY}
                    fill={node.fill.type === 'solid' ? node.fill.color : 'transparent'}
                    stroke={isSelected ? 'hsl(var(--primary))' : node.stroke?.color}
                    strokeWidth={(isSelected ? 3 : node.stroke?.width || 0) / zoom}
                    rotation={node.rotation}
                    opacity={node.opacity}
                    draggable={activeTool === 'select'}
                    onClick={() => selectNode(node.id)}
                    onDragEnd={(e) => {
                      useStudioStore.getState().updateNode(node.id, {
                        x: (e.target.x() - printBaseX) / scaleX,
                        y: (e.target.y() - printBaseY) / scaleY
                      });
                    }}
                  />
                );
              } else if (node.shape === 'circle') {
                return (
                  <Circle
                    key={node.id}
                    x={printBaseX + (node.x + node.width / 2) * scaleX}
                    y={printBaseY + (node.y + node.height / 2) * scaleY}
                    radius={Math.min(node.width * scaleX, node.height * scaleY) / 2}
                    fill={node.fill.type === 'solid' ? node.fill.color : 'transparent'}
                    stroke={isSelected ? 'hsl(var(--primary))' : node.stroke?.color}
                    strokeWidth={(isSelected ? 3 : node.stroke?.width || 0) / zoom}
                    opacity={node.opacity}
                    draggable={activeTool === 'select'}
                    onClick={() => selectNode(node.id)}
                    onDragEnd={(e) => {
                      useStudioStore.getState().updateNode(node.id, {
                        x: (e.target.x() - printBaseX) / scaleX - node.width / 2,
                        y: (e.target.y() - printBaseY) / scaleY - node.height / 2
                      });
                    }}
                  />
                );
              }
            } else if (node.type === 'text') {
              return (
                <Text
                  key={node.id}
                  x={printBaseX + node.x * scaleX}
                  y={printBaseY + node.y * scaleY}
                  text={node.text}
                  fontSize={node.fontSize * Math.min(scaleX, scaleY)}
                  fontFamily={node.fontFamily}
                  fill={node.fill.type === 'solid' ? node.fill.color : 'black'}
                  width={node.width * scaleX}
                  height={node.height * scaleY}
                  align={node.align}
                  rotation={node.rotation}
                  opacity={node.opacity}
                  stroke={isSelected ? 'hsl(var(--primary))' : undefined}
                  strokeWidth={isSelected ? 2 / zoom : 0}
                  draggable={activeTool === 'select'}
                  onClick={() => selectNode(node.id)}
                  onDragEnd={(e) => {
                    useStudioStore.getState().updateNode(node.id, {
                      x: (e.target.x() - printBaseX) / scaleX,
                      y: (e.target.y() - printBaseY) / scaleY
                    });
                  }}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {/* Enhanced Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-card border border-border backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => useStudioStore.getState().setZoom(zoom / 1.2)}
            className="w-7 h-7 rounded-md bg-studio-surface hover:bg-accent text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 border border-border"
          >
            −
          </button>
          <span className="min-w-[50px] text-center font-medium text-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => useStudioStore.getState().setZoom(zoom * 1.2)}
            className="w-7 h-7 rounded-md bg-studio-surface hover:bg-accent text-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 border border-border"
          >
            +
          </button>
          <button
            onClick={() => {
              useStudioStore.getState().setZoom(1);
              useStudioStore.getState().setPanOffset({ x: 0, y: 0 });
            }}
            className="ml-2 px-3 py-1.5 rounded-md bg-studio-surface hover:bg-accent text-foreground text-xs font-medium transition-all duration-200 hover:scale-105 border border-border"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};