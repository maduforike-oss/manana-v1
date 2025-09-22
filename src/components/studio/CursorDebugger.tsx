import React, { useState, useEffect } from 'react';
import { useUnifiedCursor } from './UnifiedCursorSystem';
import { useUnifiedCoordinates } from './UnifiedCoordinateSystem';
import { useStudioStore } from '@/lib/studio/store';

interface CursorDebugInfo {
  screenPosition: { x: number; y: number };
  canvasPosition: { x: number; y: number };
  isInCanvas: boolean;
  cursorVisible: boolean;
  inputType: string;
  tool: string;
  zoom: number;
  panOffset: { x: number; y: number };
  accuracy: number; // Alignment accuracy in pixels
}

interface CursorDebuggerProps {
  enabled?: boolean;
}

export const CursorDebugger: React.FC<CursorDebuggerProps> = ({ enabled = false }) => {
  const { cursorState } = useUnifiedCursor();
  const { screenToCanvas, isPointInCanvas } = useUnifiedCoordinates();
  const { zoom, panOffset } = useStudioStore();
  const [debugInfo, setDebugInfo] = useState<CursorDebugInfo | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      const inCanvas = isPointInCanvas(e.clientX, e.clientY);
      
      // Calculate cursor accuracy (how close cursor appears to actual mouse)
      const cursorX = cursorState.position.x;
      const cursorY = cursorState.position.y;
      const accuracy = Math.sqrt(
        Math.pow(cursorX - e.clientX, 2) + Math.pow(cursorY - e.clientY, 2)
      );
      
      setDebugInfo({
        screenPosition: { x: e.clientX, y: e.clientY },
        canvasPosition: canvasPos,
        isInCanvas: inCanvas,
        cursorVisible: cursorState.isVisible,
        inputType: cursorState.inputType,
        tool: cursorState.tool,
        zoom,
        panOffset,
        accuracy
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [enabled, screenToCanvas, isPointInCanvas, cursorState, zoom, panOffset]);

  if (!enabled || !debugInfo) return null;

  return (
    <>
      {/* Crosshair at actual mouse position */}
      <div
        className="fixed pointer-events-none z-[10000]"
        style={{
          left: mousePosition.x - 10,
          top: mousePosition.y - 1,
          width: 20,
          height: 2,
          backgroundColor: 'red',
          opacity: 0.8
        }}
      />
      <div
        className="fixed pointer-events-none z-[10000]"
        style={{
          left: mousePosition.x - 1,
          top: mousePosition.y - 10,
          width: 2,
          height: 20,
          backgroundColor: 'red',
          opacity: 0.8
        }}
      />
      
      {/* Debug info panel */}
      <div className="fixed bottom-4 left-4 bg-background/95 backdrop-blur border rounded-lg p-3 text-xs font-mono z-50 max-w-xs">
        <h3 className="font-bold mb-2">Cursor Debug</h3>
        <div className="space-y-1">
          <div>Screen: ({debugInfo.screenPosition.x.toFixed(0)}, {debugInfo.screenPosition.y.toFixed(0)})</div>
          <div>Canvas: ({debugInfo.canvasPosition.x.toFixed(1)}, {debugInfo.canvasPosition.y.toFixed(1)})</div>
          <div className={debugInfo.isInCanvas ? 'text-green-500' : 'text-red-500'}>
            In Canvas: {debugInfo.isInCanvas ? 'Yes' : 'No'}
          </div>
          <div className={debugInfo.cursorVisible ? 'text-green-500' : 'text-red-500'}>
            Cursor Visible: {debugInfo.cursorVisible ? 'Yes' : 'No'}
          </div>
          <div>Input: {debugInfo.inputType}</div>
          <div>Tool: {debugInfo.tool}</div>
          <div>Zoom: {debugInfo.zoom.toFixed(2)}x</div>
          <div>Pan: ({debugInfo.panOffset.x.toFixed(0)}, {debugInfo.panOffset.y.toFixed(0)})</div>
          <div className={debugInfo.accuracy < 1 ? 'text-green-500' : debugInfo.accuracy < 5 ? 'text-yellow-500' : 'text-red-500'}>
            Accuracy: {debugInfo.accuracy.toFixed(1)}px
          </div>
        </div>
      </div>
    </>
  );
};