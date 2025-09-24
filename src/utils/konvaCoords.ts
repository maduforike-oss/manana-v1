import Konva from "konva";

// Grid-centered coordinate utilities
export function getGridCenter(canvasWidth: number, canvasHeight: number) {
  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2
  };
}

export function screenToGridCoords(
  screenX: number, 
  screenY: number, 
  gridCenter: { x: number; y: number }
) {
  return {
    x: screenX - gridCenter.x,
    y: screenY - gridCenter.y
  };
}

export function gridToScreenCoords(
  gridX: number, 
  gridY: number, 
  gridCenter: { x: number; y: number }
) {
  return {
    x: gridX + gridCenter.x,
    y: gridY + gridCenter.y
  };
}

export function getSmartPointer(stage: Konva.Stage, canvasConfig?: { width: number; height: number }) {
  const pos = stage.getPointerPosition();
  if (!pos) return null;
  const inv = stage.getAbsoluteTransform().copy().invert();
  const p = inv.point(pos);
  
  // Always return grid-centered coordinates by default
  if (canvasConfig) {
    const gridCenter = getGridCenter(canvasConfig.width, canvasConfig.height);
    return screenToGridCoords(p.x, p.y, gridCenter);
  }
  
  // Default canvas size if not provided - grid-centered by default
  const defaultGridCenter = getGridCenter(800, 600);
  return screenToGridCoords(p.x, p.y, defaultGridCenter);
}

export function getSmartPointerFromEvent(
  stage: Konva.Stage,
  e: Konva.KonvaEventObject<PointerEvent | MouseEvent | TouchEvent>,
  canvasConfig?: { width: number; height: number }
) {
  const pos = stage.getPointerPosition();
  if (!pos) return null;
  const inv = stage.getAbsoluteTransform().copy().invert();
  const p = inv.point(pos);
  
  // Always return grid-centered coordinates by default
  if (canvasConfig) {
    const gridCenter = getGridCenter(canvasConfig.width, canvasConfig.height);
    const gridCoords = screenToGridCoords(p.x, p.y, gridCenter);
    return { x: gridCoords.x, y: gridCoords.y, evt: e.evt as PointerEvent };
  }
  
  // Default canvas size if not provided - grid-centered by default
  const defaultGridCenter = getGridCenter(800, 600);
  const gridCoords = screenToGridCoords(p.x, p.y, defaultGridCenter);
  return { x: gridCoords.x, y: gridCoords.y, evt: e.evt as PointerEvent };
}

export function fitStageToContainer(stage: Konva.Stage) {
  const rect = stage.container().getBoundingClientRect();
  if (stage.width() !== rect.width || stage.height() !== rect.height) {
    stage.size({ width: rect.width, height: rect.height });
    stage.batchDraw();
  }
}

// Snap to grid with grid-centered coordinates
export function snapToGrid(x: number, y: number, gridSize: number): { x: number; y: number } {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  };
}