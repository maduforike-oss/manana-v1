import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';
import { useStudioStore } from '../../lib/studio/store';

export const CanvasStage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const { doc, zoom, panOffset, clearSelection, selectNode, activeTool } = useStudioStore();

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

  // Don't render Stage until we have valid dimensions
  if (stageSize.width === 0 || stageSize.height === 0) {
    return (
      <div ref={containerRef} className="flex-1 bg-workspace overflow-hidden relative">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          Loading canvas...
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
          {/* Canvas Background */}
          <Rect
            x={stageSize.width / 2 - (doc.canvas.width * zoom) / 2}
            y={stageSize.height / 2 - (doc.canvas.height * zoom) / 2}
            width={doc.canvas.width}
            height={doc.canvas.height}
            fill={doc.canvas.background}
            stroke="hsl(var(--workspace-border))"
            strokeWidth={2 / zoom}
            shadowColor="hsl(var(--workspace-border))"
            shadowBlur={10 / zoom}
            shadowOffset={{ x: 0, y: 4 / zoom }}
          />

          {/* Render nodes */}
          {doc.nodes.map((node) => {
            const isSelected = doc.selectedIds.includes(node.id);
            const baseX = stageSize.width / 2 - (doc.canvas.width * zoom) / 2;
            const baseY = stageSize.height / 2 - (doc.canvas.height * zoom) / 2;

            if (node.type === 'shape') {
              if (node.shape === 'rect') {
                return (
                  <Rect
                    key={node.id}
                    x={baseX + node.x}
                    y={baseY + node.y}
                    width={node.width}
                    height={node.height}
                    fill={node.fill.type === 'solid' ? node.fill.color : 'transparent'}
                    stroke={isSelected ? 'hsl(var(--primary))' : node.stroke?.color}
                    strokeWidth={(isSelected ? 2 : node.stroke?.width || 0) / zoom}
                    rotation={node.rotation}
                    opacity={node.opacity}
                    draggable={activeTool === 'select'}
                    onClick={() => selectNode(node.id)}
                    onDragEnd={(e) => {
                      useStudioStore.getState().updateNode(node.id, {
                        x: e.target.x() - baseX,
                        y: e.target.y() - baseY
                      });
                    }}
                  />
                );
              } else if (node.shape === 'circle') {
                return (
                  <Circle
                    key={node.id}
                    x={baseX + node.x + node.width / 2}
                    y={baseY + node.y + node.height / 2}
                    radius={Math.min(node.width, node.height) / 2}
                    fill={node.fill.type === 'solid' ? node.fill.color : 'transparent'}
                    stroke={isSelected ? 'hsl(var(--primary))' : node.stroke?.color}
                    strokeWidth={(isSelected ? 2 : node.stroke?.width || 0) / zoom}
                    opacity={node.opacity}
                    draggable={activeTool === 'select'}
                    onClick={() => selectNode(node.id)}
                    onDragEnd={(e) => {
                      useStudioStore.getState().updateNode(node.id, {
                        x: e.target.x() - baseX - node.width / 2,
                        y: e.target.y() - baseY - node.height / 2
                      });
                    }}
                  />
                );
              }
            } else if (node.type === 'text') {
              return (
                <Text
                  key={node.id}
                  x={baseX + node.x}
                  y={baseY + node.y}
                  text={node.text}
                  fontSize={node.fontSize}
                  fontFamily={node.fontFamily}
                  fill={node.fill.type === 'solid' ? node.fill.color : 'black'}
                  width={node.width}
                  height={node.height}
                  align={node.align}
                  rotation={node.rotation}
                  opacity={node.opacity}
                  stroke={isSelected ? 'hsl(var(--primary))' : undefined}
                  strokeWidth={isSelected ? 1 / zoom : 0}
                  draggable={activeTool === 'select'}
                  onClick={() => selectNode(node.id)}
                  onDragEnd={(e) => {
                    useStudioStore.getState().updateNode(node.id, {
                      x: e.target.x() - baseX,
                      y: e.target.y() - baseY
                    });
                  }}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-card border border-workspace-border rounded-lg p-2 shadow-lg">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => useStudioStore.getState().setZoom(zoom / 1.2)}
            className="w-6 h-6 rounded bg-muted hover:bg-accent flex items-center justify-center"
          >
            −
          </button>
          <span className="min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => useStudioStore.getState().setZoom(zoom * 1.2)}
            className="w-6 h-6 rounded bg-muted hover:bg-accent flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => {
              useStudioStore.getState().setZoom(1);
              useStudioStore.getState().setPanOffset({ x: 0, y: 0 });
            }}
            className="ml-2 px-2 py-1 rounded bg-muted hover:bg-accent text-xs"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};