import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Stage, Layer, Image as KonvaImage, Group, Rect, Line } from "react-konva";
import { useStudioStore } from '../../lib/studio/store';
import useImage from 'use-image';
import { PrintAreaMaskManager } from '../../lib/studio/printAreaMask';
import { StrokePipeline } from '../../lib/studio/strokePipeline';
import { TapToDrawPrompt } from './TapToDrawPrompt';

// --- CONFIG ---
const PENCIL_ONLY = true; // stylus draws, fingers pan/zoom; set false to allow finger drawing
const MAX_CANVAS_PX = 2200; // mobile safety; export can be higher on server
const AUTOSAVE_MS = 3000;

// Types
type Point = { x: number; y: number; p?: number; t?: number };
type Stroke = {
  id: string;
  color: string;
  size: number;
  opacity: number;
  points: Point[];
};

type CanvasCommand = {
  id: string;
  type: 'addStroke' | 'eraseSegment' | 'transformLayer';
  data: any;
  timestamp: number;
};

function clamp(v: number, min: number, max: number) { 
  return Math.max(min, Math.min(max, v)); 
}

// Simple stroke smoothing (Chaikin-like)
function smooth(points: Point[], passes = 1): Point[] {
  let pts = points;
  for (let k = 0; k < passes; k++) {
    const out: Point[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      out.push({ x: 0.75 * p.x + 0.25 * q.x, y: 0.75 * p.y + 0.25 * q.y, p: p.p });
      out.push({ x: 0.25 * p.x + 0.75 * q.x, y: 0.25 * p.y + 0.75 * q.y, p: q.p });
    }
    pts = [pts[0], ...out, pts[pts.length - 1]];
  }
  return pts;
}

export const UnifiedCanvasStage = () => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const maskManagerRef = useRef<PrintAreaMaskManager>(new PrintAreaMaskManager());
  const strokePipelineRef = useRef<StrokePipeline | null>(null);

  // Studio store state
  const { 
    doc, 
    zoom, 
    panOffset, 
    activeTool,
    mockup,
    updateNode,
    addNode,
    setZoom,
    setPanOffset,
    saveSnapshot
  } = useStudioStore();

  // Canvas focus state
  const [focused, setFocused] = useState(false);
  const [canAcceptInput, setCanAcceptInput] = useState(false);

  // Live preview stroke
  const [liveStroke, setLiveStroke] = useState<Stroke | null>(null);

  // Command stack for undo/redo
  const [commandStack, setCommandStack] = useState<CanvasCommand[]>([]);

  // Artwork bitmap layer (persisted strokes)
  const [artworkLayer, setArtworkLayer] = useState<HTMLCanvasElement>(() => {
    const c = document.createElement("canvas");
    c.width = doc.canvas.width;
    c.height = doc.canvas.height;
    return c;
  });

  // Load garment and mask images
  const garmentImageUrl = `/mockups/tshirt_${mockup.color}_${mockup.type}.png`;
  const [garmentImg] = useImage(garmentImageUrl);
  const [maskImg] = useImage('/masks/tshirt-print-area.png'); // Default mask

  // Resize down for mobile safety
  const scaleFit = useMemo(() => {
    const max = Math.max(doc.canvas.width, doc.canvas.height);
    return max > MAX_CANVAS_PX ? MAX_CANVAS_PX / max : 1;
  }, [doc.canvas.width, doc.canvas.height]);

  // Update focus state based on tool
  useEffect(() => {
    const shouldAcceptInput = focused && (activeTool === 'brush' || activeTool === 'eraser');
    setCanAcceptInput(shouldAcceptInput);
  }, [focused, activeTool]);

  // Initialize stroke pipeline
  useEffect(() => {
    if (!strokePipelineRef.current && doc.canvas.width && doc.canvas.height) {
      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = doc.canvas.width;
      previewCanvas.height = doc.canvas.height;
      strokePipelineRef.current = new StrokePipeline(previewCanvas);
    }
  }, [doc.canvas.width, doc.canvas.height]);

  // Make body scroll only when not drawing on the canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    // Set touch-action based on focus and tool
    el.style.touchAction = canAcceptInput ? "none" : "auto";
    
    // Add/remove event listeners based on capture mode
    const options = canAcceptInput ? { passive: false } : { passive: true };
    
    if (canAcceptInput) {
      // Prevent default on touch events when capturing
      const preventTouch = (e: TouchEvent) => e.preventDefault();
      el.addEventListener('touchstart', preventTouch, options);
      el.addEventListener('touchmove', preventTouch, options);
      return () => {
        el.removeEventListener('touchstart', preventTouch);
        el.removeEventListener('touchmove', preventTouch);
      };
    }
  }, [canAcceptInput]);

  // Autosave
  useEffect(() => {
    const t = setInterval(() => {
      saveSnapshot();
    }, AUTOSAVE_MS);
    return () => clearInterval(t);
  }, [saveSnapshot]);

  // Pointer utils
  const isStylus = useCallback((e: any) => {
    return e?.evt?.pointerType === "pen" || e?.evt?.pointerType === "stylus";
  }, []);

  const stageToCanvasCoords = useCallback((pos: { x: number; y: number }) => {
    // invert current view transform
    return { 
      x: (pos.x - panOffset.x) / (zoom * scaleFit), 
      y: (pos.y - panOffset.y) / (zoom * scaleFit) 
    };
  }, [panOffset, zoom, scaleFit]);

  // Start stroke
  const handlePointerDown = useCallback((e: any) => {
    setFocused(true);
    
    if (activeTool !== "brush" && activeTool !== "eraser") return;

    if (PENCIL_ONLY && !isStylus(e) && e?.evt?.pointerType !== "mouse") {
      // fingers do not draw in pencil-only mode
      return;
    }

    e.evt.preventDefault();
    const pos = stageRef.current.getPointerPosition();
    if (!pos) return;
    
    const p = stageToCanvasCoords(pos);
    
    // Check if point is in print area
    if (!maskManagerRef.current.isPointInPrintArea(p)) {
      return; // Don't start stroke outside print area
    }

    const strokeId = strokePipelineRef.current?.startStroke(
      p,
      e?.evt?.pressure ?? 0.5,
      {
        size: 6,
        color: "#000000",
        opacity: 1,
        hardness: 0.8,
        type: activeTool === 'eraser' ? 'eraser' : 'normal'
      }
    );

    if (strokeId) {
      const s: Stroke = {
        id: strokeId,
        color: activeTool === 'eraser' ? 'transparent' : "#000000",
        size: 6,
        opacity: 1,
        points: [{ x: p.x, y: p.y, p: e?.evt?.pressure ?? 0.5, t: Date.now() }],
      };
      setLiveStroke(s);
    }
  }, [activeTool, isStylus, stageToCanvasCoords]);

  // Move stroke or pan/zoom
  const handlePointerMove = useCallback((e: any) => {
    if ((activeTool === "brush" || activeTool === "eraser") && liveStroke && strokePipelineRef.current) {
      e.evt.preventDefault();
      const pos = stageRef.current.getPointerPosition();
      if (!pos) return;
      
      const p = stageToCanvasCoords(pos);
      
      // Add point to stroke pipeline
      const added = strokePipelineRef.current.addPoint(p, e?.evt?.pressure ?? 0.5);
      
      if (added) {
        setLiveStroke((prev) =>
          prev
            ? {
                ...prev,
                points: [...prev.points, { x: p.x, y: p.y, p: e?.evt?.pressure ?? 0.5, t: Date.now() }],
              }
            : prev
        );
      }
      return;
    }

    // two-finger pan when not drawing
    if (e.evt.touches?.length === 2) {
      e.evt.preventDefault();
      const [t1, t2] = e.evt.touches;
      const cx = (t1.clientX + t2.clientX) / 2;
      const cy = (t1.clientY + t2.clientY) / 2;
      setPanOffset({ 
        x: cx - (doc.canvas.width * scaleFit) / 2, 
        y: cy - (doc.canvas.height * scaleFit) / 2 
      });
    }
  }, [activeTool, liveStroke, stageToCanvasCoords, setPanOffset, doc.canvas.width, doc.canvas.height, scaleFit]);

  // End stroke: rasterize to artworkLayer
  const handlePointerUp = useCallback((e: any) => {
    if ((activeTool === "brush" || activeTool === "eraser") && liveStroke && strokePipelineRef.current) {
      const completedStroke = strokePipelineRef.current.endStroke();
      
      if (completedStroke) {
        // Rasterize stroke to artwork layer
        strokePipelineRef.current.rasterizeStroke(completedStroke, artworkLayer);
        
        // Create command for undo/redo
        const command: CanvasCommand = {
          id: crypto.randomUUID(),
          type: 'addStroke',
          data: completedStroke,
          timestamp: Date.now()
        };
        
        setCommandStack(prev => [...prev, command]);
        
        // Add as image node to studio store
        const imageData = artworkLayer.toDataURL();
        addNode({
          id: `artwork-${Date.now()}`,
          type: 'image',
          name: 'Artwork Layer',
          x: 0,
          y: 0,
          width: doc.canvas.width,
          height: doc.canvas.height,
          rotation: 0,
          opacity: 1,
          src: imageData,
        });
      }
      
      setLiveStroke(null);
    }
  }, [activeTool, liveStroke, artworkLayer, addNode, doc.canvas.width, doc.canvas.height]);

  // Wheel zoom (desktop)
  const handleWheel = useCallback((e: any) => {
    // Only handle zoom when focused
    if (!canAcceptInput) return;
    e.evt.preventDefault();
    
    const dir = e.evt.deltaY > 0 ? -1 : 1;
    const factor = 1 + dir * 0.08;
    const nextZoom = clamp(zoom * factor, 0.3, 6);
    setZoom(nextZoom);
  }, [canAcceptInput, zoom, setZoom]);

  // Handle canvas click to focus
  const handleCanvasClick = useCallback(() => {
    setFocused(true);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    if (activeTool !== 'brush' && activeTool !== 'eraser') {
      setFocused(false);
    }
  }, [activeTool]);

  return (
    <div className="relative w-full h-full">
      {/* Focus hint on mobile */}
      {!focused && (activeTool === "brush" || activeTool === "eraser") && (
        <TapToDrawPrompt onTap={handleCanvasClick} />
      )}

      <div
        ref={containerRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
        onBlur={handleBlur}
        tabIndex={0}
      >
        <Stage
          ref={stageRef}
          width={doc.canvas.width * scaleFit}
          height={doc.canvas.height * scaleFit}
          scaleX={zoom * scaleFit}
          scaleY={zoom * scaleFit}
          x={panOffset.x}
          y={panOffset.y}
          onWheel={handleWheel}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onMousemove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchEnd={handlePointerUp}
        >
          <Layer listening={false}>
            {/* Garment base */}
            {garmentImg && (
              <KonvaImage 
                image={garmentImg} 
                x={0} 
                y={0} 
                width={doc.canvas.width} 
                height={doc.canvas.height} 
              />
            )}

            {/* Mask group for print area */}
            <Group>
              {/* Apply alpha mask if available */}
              {maskImg && (
                <>
                  {/* draw artwork bitmap first */}
                  <KonvaImage 
                    image={artworkLayer} 
                    x={0} 
                    y={0} 
                    width={doc.canvas.width} 
                    height={doc.canvas.height} 
                  />
                  
                  {/* live stroke preview */}
                  {liveStroke && (
                    <Line
                      points={liveStroke.points.flatMap((p) => [p.x, p.y])}
                      stroke={liveStroke.color}
                      strokeWidth={liveStroke.size}
                      opacity={liveStroke.opacity}
                      lineCap="round"
                      lineJoin="round"
                    />
                  )}
                  
                  {/* mask by drawing mask as destination-in */}
                  <Rect
                    x={0}
                    y={0}
                    width={doc.canvas.width}
                    height={doc.canvas.height}
                    globalCompositeOperation="destination-in"
                    fillPatternImage={maskImg}
                    fillPatternScaleX={doc.canvas.width / maskImg.width}
                    fillPatternScaleY={doc.canvas.height / maskImg.height}
                  />
                </>
              )}

              {/* If no mask, still show artwork */}
              {!maskImg && (
                <>
                  <KonvaImage 
                    image={artworkLayer} 
                    x={0} 
                    y={0} 
                    width={doc.canvas.width} 
                    height={doc.canvas.height} 
                  />
                  {liveStroke && (
                    <Line
                      points={liveStroke.points.flatMap((p) => [p.x, p.y])}
                      stroke={liveStroke.color}
                      strokeWidth={liveStroke.size}
                      opacity={liveStroke.opacity}
                      lineCap="round"
                      lineJoin="round"
                    />
                  )}
                </>
              )}
            </Group>

            {/* Render existing studio nodes */}
            {doc.nodes.map((node) => {
              if (node.type === 'image' && node.src) {
                return (
                  <KonvaImage
                    key={node.id}
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rotation={node.rotation}
                    opacity={node.opacity}
                    image={new Image()}
                    onLoad={(e) => {
                      const img = new Image();
                      img.onload = () => {
                        e.target.image(img);
                        e.target.getLayer()?.batchDraw();
                      };
                      img.src = node.src;
                    }}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};