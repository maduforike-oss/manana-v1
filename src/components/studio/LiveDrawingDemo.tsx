import React from 'react';
import { LiveDrawingCanvas } from './LiveDrawingCanvas';
import { useStudioStore } from '@/lib/studio/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const LiveDrawingDemo: React.FC = () => {
  const {
    activeTool,
    activeColor,
    brushSize,
    brushOpacity,
    brushHardness,
    isEraser,
    liveStroke,
    setActiveTool,
    setActiveColor,
    setBrushSize,
    setBrushOpacity,
    setBrushHardness,
    toggleEraser,
    undo,
    redo,
    canUndo,
    canRedo,
    doc
  } = useStudioStore();

  return (
    <div className="flex gap-4 p-4 w-full h-screen">
      {/* Canvas */}
      <div className="flex-1">
        <LiveDrawingCanvas width={800} height={600} />
      </div>
      
      {/* Tools Panel */}
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Live Drawing Tools</CardTitle>
          <CardDescription>
            Real-time brush drawing with instant feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tool Selection */}
          <div className="space-y-2">
            <Label>Tool</Label>
            <div className="flex gap-2">
              <Button
                variant={activeTool === 'brush' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool('brush')}
              >
                Brush
              </Button>
              <Button
                variant={activeTool === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTool('select')}
              >
                Select
              </Button>
            </div>
          </div>

          <Separator />

          {/* Brush Settings */}
          {activeTool === 'brush' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={isEraser ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={toggleEraser}
                >
                  {isEraser ? 'Eraser ON' : 'Eraser OFF'}
                </Button>
              </div>

              {!isEraser && (
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <input
                    id="color"
                    type="color"
                    value={activeColor}
                    onChange={(e) => setActiveColor(e.target.value)}
                    className="w-full h-10 rounded border cursor-pointer"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Size: {brushSize}px</Label>
                <Slider
                  value={[brushSize]}
                  onValueChange={([value]) => setBrushSize(value)}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Opacity: {Math.round(brushOpacity * 100)}%</Label>
                <Slider
                  value={[brushOpacity]}
                  onValueChange={([value]) => setBrushOpacity(value)}
                  min={0.1}
                  max={1}
                  step={0.05}
                />
              </div>

              <div className="space-y-2">
                <Label>Hardness: {Math.round(brushHardness * 100)}%</Label>
                <Slider
                  value={[brushHardness]}
                  onValueChange={([value]) => setBrushHardness(value)}
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>
            </div>
          )}

          <Separator />

          {/* History Controls */}
          <div className="space-y-2">
            <Label>History</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
              >
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
              >
                Redo
              </Button>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Nodes: {doc.nodes.length}</div>
            {liveStroke && (
              <div className="text-primary">
                Live stroke: {liveStroke.strokeData.points.length} points
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};