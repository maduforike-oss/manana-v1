import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useViewportState } from '@/hooks/useViewportState';

export interface ViewportSettingsPanelProps {
  className?: string;
}

export const ViewportSettingsPanel = ({ className }: ViewportSettingsPanelProps) => {
  const {
    showBoundingBox,
    showGrid,
    showRulers,
    snapToGrid,
    gridSize,
    toggleBoundingBox,
    toggleGrid,
    toggleRulers,
    toggleSnap,
    setGridSize
  } = useViewportState();

  const [gridUnit, setGridUnit] = React.useState('px');
  const [gridOpacity, setGridOpacity] = React.useState(0.3);
  const [snapTolerance, setSnapTolerance] = React.useState(10);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Viewport Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid" className="text-sm font-medium">
              Show Grid
            </Label>
            <Switch
              id="show-grid"
              checked={showGrid}
              onCheckedChange={toggleGrid}
            />
          </div>

          {showGrid && (
            <div className="pl-4 space-y-3 border-l border-border/50">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Grid Size</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[gridSize]}
                    onValueChange={([value]) => setGridSize(value)}
                    min={0.5}
                    max={10}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-12">
                    {gridSize}{gridUnit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Grid Unit</Label>
                <Select value={gridUnit} onValueChange={setGridUnit}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="px">Pixels (px)</SelectItem>
                    <SelectItem value="mm">Millimeters (mm)</SelectItem>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="in">Inches (in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Grid Opacity</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[gridOpacity]}
                    onValueChange={([value]) => setGridOpacity(value)}
                    min={0.1}
                    max={1}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">
                    {Math.round(gridOpacity * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Ruler Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-rulers" className="text-sm font-medium">
              Show Rulers
            </Label>
            <Switch
              id="show-rulers"
              checked={showRulers}
              onCheckedChange={toggleRulers}
            />
          </div>

          {showRulers && (
            <div className="pl-4 space-y-3 border-l border-border/50">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Ruler Unit</Label>
                <Select defaultValue="px">
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="px">Pixels (px)</SelectItem>
                    <SelectItem value="mm">Millimeters (mm)</SelectItem>
                    <SelectItem value="cm">Centimeters (cm)</SelectItem>
                    <SelectItem value="in">Inches (in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Snap Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="snap-to-grid" className="text-sm font-medium">
              Snap to Grid
            </Label>
            <Switch
              id="snap-to-grid"
              checked={snapToGrid}
              onCheckedChange={toggleSnap}
            />
          </div>

          {snapToGrid && (
            <div className="pl-4 space-y-3 border-l border-border/50">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Snap Tolerance</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[snapTolerance]}
                    onValueChange={([value]) => setSnapTolerance(value)}
                    min={1}
                    max={50}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">
                    {snapTolerance}px
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Visual Aids */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-bounding-box" className="text-sm font-medium">
              Show Bounding Box
            </Label>
            <Switch
              id="show-bounding-box"
              checked={showBoundingBox}
              onCheckedChange={toggleBoundingBox}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};