import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, RegularPolygon, Transformer, Image } from 'react-konva';
import { useStudioStore } from '../../lib/studio/store';
import { Node, TextNode, ShapeNode, ImageNode } from '../../lib/studio/types';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Download, Move, Hand, Grid3X3 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getGarmentView } from '@/lib/api/garments';
import { PrintAreaMaskManager } from '../../lib/studio/printAreaMask';
import { StrokePipeline } from '../../lib/studio/strokePipeline';
import { CommandStack, AddStrokeCommand } from '../../lib/studio/commandStack';
import { BrushEngine, BrushSettings, BRUSH_PRESETS } from '../../lib/studio/brushEngine';
import { AdvancedDrawingCanvas } from './AdvancedDrawingCanvas';
import { FloatingBrushPanel } from './FloatingBrushPanel';
import { CanvasDimensionsSync } from './CanvasDimensionsSync';
import { InlineTextEditor } from './InlineTextEditor';
import { EraserTool } from './EraserTool';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { HistoryIndicator } from './HistoryIndicator';
import { ToolCursorProvider } from './ToolCursorManager';
import { StageIntegration } from './StageIntegration';

interface FunctionalCanvasStageProps {
  brushSettings?: BrushSettings;
}

export const FunctionalCanvasStage: React.FC<FunctionalCanvasStageProps> = ({ 
  brushSettings: externalBrushSettings 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const maskManagerRef = useRef<PrintAreaMaskManager>(new PrintAreaMaskManager());
  const strokePipelineRef = useRef<StrokePipeline | null>(null);
  const commandStackRef = useRef<CommandStack>(new CommandStack());
  const artworkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [garmentImage, setGarmentImage] = useState<HTMLImageElement | null>(null);
  const [garmentImageUrl, setGarmentImageUrl] = useState<string | null>(null);
  const [safeArea, setSafeArea] = useState({ wPx: 400, hPx: 400 });
  const [focused, setFocused] = useState(false);
  const [canAcceptInput, setCanAcceptInput] = useState(false);
  const [liveStroke, setLiveStroke] = useState<any>(null);
  const [editingTextNode, setEditingTextNode] = useState<TextNode | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [showBrushPanel, setShowBrushPanel] = useState(false);
  const [isPersistentBrushPanel, setIsPersistentBrushPanel] = useState(false);
  const [brushSettings, setBrushSettings] = useState<BrushSettings>(externalBrushSettings || BRUSH_PRESETS.pencil);
  const [needsRedraw, setNeedsRedraw] = useState(0);
  
  const { 
    doc, 
    activeTool, 
    zoom, 
    panOffset, 
    addNode, 
    updateNode, 
    removeNode,
    selectNode,
    clearSelection,
    setZoom,
    setPanOffset,
    setActiveTool,
    undo,
    redo,
    canUndo,
    canRedo,
    saveSnapshot,
    toggleGrid
  } = useStudioStore();

  // Show brush panel when brush/eraser tool is active or when persistent
  useEffect(() => {
    setShowBrushPanel(
      isPersistentBrushPanel || activeTool === 'brush' || activeTool === 'eraser'
    );
  }, [activeTool, isPersistentBrushPanel]);

  // Initialize artwork bitmap canvas
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = doc.canvas.width || 800;
    canvas.height = doc.canvas.height || 600;
    artworkCanvasRef.current = canvas;
    
    // Initialize stroke pipeline
    if (!strokePipelineRef.current) {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = canvas.width;
      previewCanvas.height = canvas.height;
      strokePipelineRef.current = new StrokePipeline(previewCanvas);
    }
  }, [doc.canvas.width, doc.canvas.height]);

  // Handle window resize
  useEffect(() => {
    const updateStageSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setStageSize({ width: clientWidth, height: clientHeight });
      }
    };

    const observer = new ResizeObserver(updateStageSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Update focus state for mobile drawing
  useEffect(() => {
    const shouldAcceptInput = focused && (activeTool === 'brush' || activeTool === 'eraser');
    setCanAcceptInput(shouldAcceptInput);
  }, [focused, activeTool]);

  // Mobile touch handling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    el.style.touchAction = canAcceptInput ? "none" : "auto";
    
    if (canAcceptInput) {
      const preventTouch = (e: TouchEvent) => e.preventDefault();
      el.addEventListener('touchstart', preventTouch, { passive: false });
      el.addEventListener('touchmove', preventTouch, { passive: false });
      return () => {
        el.removeEventListener('touchstart', preventTouch);
        el.removeEventListener('touchmove', preventTouch);
      };
    }
  }, [canAcceptInput]);

  // Load garment background image
  useEffect(() => {
    const loadGarmentBackground = async () => {
      if (!doc.canvas.garmentType) return;
      
      try {
        console.log("Loading garment background for:", doc.canvas.garmentType);
        
        // Get garment view from new API
        const garmentView = await getGarmentView(doc.canvas.garmentType, 'front', 'white');
        
        if (garmentView?.url) {
          console.log("Found garment template:", garmentView.url);
          setGarmentImageUrl(garmentView.url);
          
          // Load image for canvas
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => setGarmentImage(img);
          img.src = garmentView.url;
          
          // Update safe area if available
          if (garmentView.safe_area) {
            setSafeArea({
              wPx: garmentView.safe_area.w,
              hPx: garmentView.safe_area.h,
            });
          }
          return;
        }
        
        // Fallback to local assets
        const { getGarmentImage } = await import('../../lib/studio/imageMapping');
        const imageUrl = await getGarmentImage(doc.canvas.garmentType, 'front', 'white');
        
        if (imageUrl) {
          console.log("Using fallback image path:", imageUrl);
          setGarmentImageUrl(imageUrl);
          
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => setGarmentImage(img);
          img.src = imageUrl;
        }
        
      } catch (error) {
        console.error("Error loading garment background:", error);
        // Final fallback - try to load image mapping utilities
        try {
          const { getGarmentImage } = await import('../../lib/studio/imageMapping');
          const fallbackUrl = await getGarmentImage(doc.canvas.garmentType, 'front', 'white');
          
          if (fallbackUrl) {
            setGarmentImageUrl(fallbackUrl);
            
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => setGarmentImage(img);
            img.src = fallbackUrl;
          }
        } catch (fallbackError) {
          console.warn("Fallback image loading also failed:", fallbackError);
        }
      }
    };

    loadGarmentBackground();
  }, [doc.canvas.garmentType]);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (doc.nodes.length > 0) {
        try {
          localStorage.setItem('studio-autosave', JSON.stringify(doc));
        } catch (error) {
          console.warn('Auto-save failed:', error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [doc]);

  // Grid rendering
  const renderGrid = () => {
    if (!doc.canvas.showGrid) return null;
    
    const gridSize = doc.canvas.gridSize || 20;
    const lines = [];
    
    // Vertical lines
    for (let i = 0; i < stageSize.width / zoom + panOffset.x; i += gridSize) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, stageSize.height / zoom]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i < stageSize.height / zoom + panOffset.y; i += gridSize) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, stageSize.width / zoom, i]}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth={1 / zoom}
          listening={false}
        />
      );
    }
    
    return lines;
  };

  // Render design nodes
  const renderNode = (node: Node) => {
    const isSelected = doc.selectedIds.includes(node.id);
    
    const commonProps = {
      id: node.id,
      x: node.x,
      y: node.y,
      rotation: node.rotation || 0,
      opacity: node.opacity || 1,
      draggable: !node.locked,
      onClick: () => selectNode(node.id),
      onDragEnd: (e: any) => {
        updateNode(node.id, {
          x: e.target.x(),
          y: e.target.y()
        });
        saveSnapshot();
      },
      onTransformEnd: (e: any) => {
        const scaleX = e.target.scaleX();
        const scaleY = e.target.scaleY();
        
        updateNode(node.id, {
          x: e.target.x(),
          y: e.target.y(),
          width: node.width * scaleX,
          height: node.height * scaleY,
          rotation: e.target.rotation()
        });
        
        // Reset scale after applying to dimensions
        e.target.scaleX(1);
        e.target.scaleY(1);
        saveSnapshot();
      }
    };

    switch (node.type) {
      case 'text': {
        const textNode = node as TextNode;
        return (
          <Text
            key={node.id}
            {...commonProps}
            text={textNode.text}
            fontSize={textNode.fontSize}
            fontFamily={textNode.fontFamily}
            fill={textNode.fill.type === 'solid' ? textNode.fill.color : '#000000'}
            align={textNode.align}
            width={textNode.width}
            height={textNode.height}
            stroke={isSelected ? '#0066FF' : undefined}
            strokeWidth={isSelected ? 2 : 0}
            onDblClick={() => setEditingTextNode(textNode)}
          />
        );
      }
      
      case 'shape': {
        const shapeNode = node as ShapeNode;
        const fill = shapeNode.fill.type === 'solid' ? shapeNode.fill.color : '#3B82F6';
        const stroke = shapeNode.stroke?.color || '#1E40AF';
        
        switch (shapeNode.shape) {
          case 'rect':
            return (
              <Rect
                key={node.id}
                {...commonProps}
                width={shapeNode.width}
                height={shapeNode.height}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
                cornerRadius={shapeNode.radius || 0}
              />
            );
            
          case 'circle':
            return (
              <Circle
                key={node.id}
                {...commonProps}
                radius={Math.min(shapeNode.width, shapeNode.height) / 2}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
            
          case 'triangle':
          case 'star':
            return (
              <RegularPolygon
                key={node.id}
                {...commonProps}
                sides={shapeNode.shape === 'triangle' ? 3 : (shapeNode.points || 5)}
                radius={Math.min(shapeNode.width, shapeNode.height) / 2}
                fill={fill}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
            
          case 'line':
            return (
              <Line
                key={node.id}
                {...commonProps}
                points={[0, 0, shapeNode.width, 0]}
                stroke={isSelected ? '#0066FF' : stroke}
                strokeWidth={isSelected ? 3 : (shapeNode.stroke?.width || 2)}
              />
            );
        }
        break;
      }
    }
    
    return null;
  };

  // Enhanced shape creation with drag
  const handleStageMouseDown = useCallback((e: any) => {
    if (e.target !== e.target.getStage()) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const localPos = {
      x: (pos.x - panOffset.x) / zoom,
      y: (pos.y - panOffset.y) / zoom
    };

    if (['rect', 'circle', 'line'].includes(activeTool)) {
      setDragStart(localPos);
    }
  }, [activeTool, panOffset, zoom]);

  const handleStageMouseUp = useCallback((e: any) => {
    if (e.target !== e.target.getStage()) return;
    
    const pos = e.target.getStage().getPointerPosition();
    const localPos = {
      x: (pos.x - panOffset.x) / zoom,
      y: (pos.y - panOffset.y) / zoom
    };

    if (dragStart && ['rect', 'circle', 'line'].includes(activeTool)) {
      const width = Math.abs(localPos.x - dragStart.x);
      const height = Math.abs(localPos.y - dragStart.y);
      
      if (width > 5 && height > 5) { // Minimum size threshold
        const shapeNode: ShapeNode = {
          id: `${activeTool}-${Date.now()}`,
          type: 'shape',
          name: `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Shape`,
          x: Math.min(dragStart.x, localPos.x),
          y: Math.min(dragStart.y, localPos.y),
          width,
          height,
          rotation: 0,
          opacity: 1,
          shape: activeTool as any,
          fill: { type: 'solid', color: '#3B82F6' },
          stroke: { color: '#1E40AF', width: 2 }
        };
        addNode(shapeNode);
        saveSnapshot();
        toast(`${activeTool} shape created!`);
      }
      setDragStart(null);
      return;
    }
  }, [activeTool, panOffset, zoom, addNode, clearSelection, saveSnapshot, dragStart]);

  // Handle stage click for tool interactions
  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
      
      const pos = e.target.getStage().getPointerPosition();
      const localPos = {
        x: (pos.x - panOffset.x) / zoom,
        y: (pos.y - panOffset.y) / zoom
      };

      if (activeTool === 'text') {
        const textNode: TextNode = {
          id: `text-${Date.now()}`,
          type: 'text',
          name: 'Text Layer',
          x: localPos.x,
          y: localPos.y,
          width: 200,
          height: 50,
          rotation: 0,
          opacity: 1,
          text: 'Double click to edit',
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: 0,
          align: 'left',
          fill: { type: 'solid', color: '#000000' }
        };
        addNode(textNode);
        saveSnapshot();
        toast('Text added! Double-click to edit.');
        // Auto-start editing new text
        setTimeout(() => setEditingTextNode(textNode), 100);
      }
    }
  }, [activeTool, panOffset, zoom, addNode, clearSelection, saveSnapshot]);

  return (
    <ToolCursorProvider>
      <div className="h-full bg-workspace text-foreground overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Top toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTool('select')}
                className={cn(
                  "p-2 transition-colors duration-200 flex items-center justify-center",
                  activeTool === 'select' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <Move className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTool('brush')}
                className={cn(
                  "p-2 transition-colors duration-200 flex items-center justify-center",
                  activeTool === 'brush' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                <Hand className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTool('text')}
                className={cn(
                  "p-2 transition-colors duration-200 flex items-center justify-center",
                  activeTool === 'text' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                T
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTool('rect')}
                className={cn(
                  "p-2 transition-colors duration-200 flex items-center justify-center",
                  activeTool === 'rect' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                □
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTool('circle')}
                className={cn(
                  "p-2 transition-colors duration-200 flex items-center justify-center",
                  activeTool === 'circle' 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                )}
              >
                ○
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(zoom * 0.9)}
                disabled={zoom <= 0.1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-mono min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(zoom * 1.1)}
                disabled={zoom >= 5}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setZoom(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleGrid()}
                className={cn(
                  doc.canvas.showGrid ? "bg-muted" : ""
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export functionality here
                  toast('Export feature coming soon!');
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Main canvas area with cursor integration */}
          <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden bg-workspace focus:outline-none"
            tabIndex={0}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onMouseDown={handleStageMouseDown}
            onMouseUp={handleStageMouseUp}
            onClick={handleStageClick}
          >
            <StageIntegration
              brushSettings={brushSettings}
              activeTool={activeTool}
              containerRef={containerRef}
            />
            
            <div className="relative w-full h-full overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <svg width="40" height="40" className="absolute inset-0">
                  <pattern
                    id="grid-pattern"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
              </div>

              <Stage
                ref={stageRef}
                width={stageSize.width}
                height={stageSize.height}
                scaleX={zoom}
                scaleY={zoom}
                x={panOffset.x * zoom}
                y={panOffset.y * zoom}
                onMouseDown={handleStageMouseDown}
                onMouseUp={handleStageMouseUp}
                onClick={handleStageClick}
                onWheel={(e) => {
                  e.evt.preventDefault();
                  const scaleBy = 1.05;
                  const stage = e.target.getStage();
                  const pointer = stage.getPointerPosition();
                  const mousePointTo = {
                    x: (pointer.x - stage.x()) / stage.scaleX(),
                    y: (pointer.y - stage.y()) / stage.scaleY(),
                  };

                  const newScale = e.evt.deltaY > 0 ? zoom / scaleBy : zoom * scaleBy;
                  const clampedScale = Math.max(0.1, Math.min(5, newScale));
                  setZoom(clampedScale);

                  const newPos = {
                    x: pointer.x - mousePointTo.x * clampedScale,
                    y: pointer.y - mousePointTo.y * clampedScale,
                  };
                  setPanOffset({ x: newPos.x / clampedScale, y: newPos.y / clampedScale });
                }}
                draggable={activeTool === 'select'}
                onDragEnd={(e) => {
                  const stage = e.target;
                  setPanOffset({
                    x: stage.x() / zoom,
                    y: stage.y() / zoom
                  });
                }}
              >
                <Layer>
                  {/* Background garment image */}
                  {garmentImage && (
                    <Image
                      image={garmentImage}
                      x={0}
                      y={0}
                      width={doc.canvas.width || 800}
                      height={doc.canvas.height || 600}
                      listening={false}
                      opacity={0.8}
                    />
                  )}

                  {/* Grid */}
                  {renderGrid()}

                  {/* Safe area outline */}
                  <Rect
                    x={(doc.canvas.width - safeArea.wPx) / 2}
                    y={(doc.canvas.height - safeArea.hPx) / 2}
                    width={safeArea.wPx}
                    height={safeArea.hPx}
                    stroke="#0066FF"
                    strokeWidth={1 / zoom}
                    strokeEnabled={doc.canvas.showGrid}
                    dash={[5 / zoom, 5 / zoom]}
                    listening={false}
                    opacity={0.5}
                  />

                  {/* Design nodes */}
                  {doc.nodes.map(renderNode)}

                  {/* Live drawing preview */}
                  {liveStroke && (
                    <Line
                      points={liveStroke.points}
                      stroke={liveStroke.stroke}
                      strokeWidth={liveStroke.strokeWidth}
                      globalCompositeOperation={
                        activeTool === 'eraser' ? 'destination-out' : 'source-over'
                      }
                      listening={false}
                    />
                  )}
                </Layer>

                <Layer>
                  <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                      if (newBox.width < 10 || newBox.height < 10) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                </Layer>
              </Stage>

              {/* Drawing Canvas Layer - Always mounted to persist strokes */}
              <div className="absolute inset-0 pointer-events-none">
                <AdvancedDrawingCanvas
                  width={stageSize.width}
                  height={stageSize.height}
                  brushSettings={brushSettings}
                  activeTool={activeTool as 'brush' | 'eraser'}
                  onStrokeComplete={(stroke) => {
                    console.log('Stroke completed:', stroke);
                  }}
                  className={cn(
                    "transition-opacity duration-200",
                    (activeTool === 'brush' || activeTool === 'eraser') 
                      ? "pointer-events-auto opacity-100" 
                      : "pointer-events-none opacity-100"
                  )}
                  isInteractive={activeTool === 'brush' || activeTool === 'eraser'}
                />
              </div>
            </div>
          </div>

          {/* Floating brush panel */}
          {showBrushPanel && (
            <FloatingBrushPanel
              isVisible={showBrushPanel}
              brushSettings={brushSettings}
              onBrushSettingsChange={(newSettings) => setBrushSettings(prev => ({ ...prev, ...newSettings }))}
              activeTool={activeTool}
              onToolChange={setActiveTool}
              onClose={() => setShowBrushPanel(false)}
              onTogglePersistent={() => setIsPersistentBrushPanel(!isPersistentBrushPanel)}
              isPersistent={isPersistentBrushPanel}
            />
          )}

          {/* Text editor */}
          {editingTextNode && (
            <InlineTextEditor
              node={editingTextNode}
              onChange={(updates) => {
                updateNode(editingTextNode.id, updates);
                saveSnapshot();
              }}
              onComplete={() => setEditingTextNode(null)}
            />
          )}

          {/* Canvas dimensions sync */}
          <CanvasDimensionsSync 
            width={stageSize.width}
            height={stageSize.height}
          />

          {/* Keyboard shortcuts */}
          <KeyboardShortcuts />

          {/* History indicator */}
          <HistoryIndicator />
          
          {/* Mobile drawing hints */}
          {canAcceptInput && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-background/90 px-3 py-1 rounded-lg text-sm text-muted-foreground pointer-events-none">
              Tap and drag to draw
            </div>
          )}
        </div>
      </div>
    </ToolCursorProvider>
  );
};