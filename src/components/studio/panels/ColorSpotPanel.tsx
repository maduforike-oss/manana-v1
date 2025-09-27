"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Palette, Eye } from 'lucide-react';
import { useStudioStore } from '@/lib/studio/store';
import { getColorInfo, generateColorWarning } from '@/lib/print/color';

export const ColorSpotPanel = () => {
  const { doc, updateNode } = useStudioStore();
  const [activeColor, setActiveColor] = useState('#000000');

  // Analyze colors in the design
  const analyzeDesignColors = () => {
    const colors = new Set<string>();
    const colorNodes: { id: string; color: string; type: string }[] = [];

    doc.nodes.forEach(node => {
      if (node.type === 'text' && (node as any).fill?.color) {
        const color = (node as any).fill.color;
        colors.add(color);
        colorNodes.push({ id: node.id, color, type: 'text fill' });
      }
      if (node.type === 'shape' && (node as any).fill?.color) {
        const color = (node as any).fill.color;
        colors.add(color);
        colorNodes.push({ id: node.id, color, type: 'shape fill' });
      }
      if ((node as any).stroke?.color) {
        const color = (node as any).stroke.color;
        colors.add(color);
        colorNodes.push({ id: node.id, color, type: 'stroke' });
      }
    });

    return { colors: Array.from(colors), colorNodes };
  };

  const { colors, colorNodes } = analyzeDesignColors();
  
  const colorInfos = colors.map(color => ({
    hex: color,
    info: getColorInfo(color),
    warning: generateColorWarning(getColorInfo(color))
  }));

  const outOfGamutColors = colorInfos.filter(c => c.warning);

  const handleColorUpdate = (oldColor: string, newColor: string) => {
    const nodesToUpdate = colorNodes.filter(node => node.color === oldColor);
    
    nodesToUpdate.forEach(nodeInfo => {
      const node = doc.nodes.find(n => n.id === nodeInfo.id);
      if (!node) return;

      if (nodeInfo.type === 'text fill' || nodeInfo.type === 'shape fill') {
        updateNode(node.id, { 
          fill: { type: 'solid', color: newColor }
        });
      } else if (nodeInfo.type === 'stroke' && (node as any).stroke) {
        updateNode(node.id, { 
          stroke: { ...(node as any).stroke, color: newColor }
        });
      }
    });
  };

  const fixOutOfGamutColor = (color: string) => {
    const colorInfo = getColorInfo(color);
    if (colorInfo.pantone) {
      const pantoneMatch = colorInfo.pantone;
      // In a real implementation, we'd get the exact Pantone hex
      const pantoneHex = '#000000'; // Placeholder
      handleColorUpdate(color, pantoneHex);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Color Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color Count Summary */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Colors Used:</span>
            <Badge variant={colors.length > 6 ? "destructive" : "default"}>
              {colors.length} {colors.length > 6 ? '(Screen limit exceeded)' : ''}
            </Badge>
          </div>

          {/* Color List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Design Colors</Label>
            {colorInfos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No colors detected in design</p>
            ) : (
              <div className="space-y-2">
                {colorInfos.map(({ hex, info, warning }) => (
                  <div key={hex} className="flex items-center gap-3 p-2 border rounded">
                    <div 
                      className="w-8 h-8 rounded border-2 border-border flex-shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{hex.toUpperCase()}</span>
                        {info.isOutOfGamut && (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                      </div>
                      {info.pantone && (
                        <div className="text-xs text-muted-foreground">
                          Nearest: {info.pantone}
                        </div>
                      )}
                    </div>
                    {info.isOutOfGamut && info.pantone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fixOutOfGamutColor(hex)}
                        className="text-xs"
                      >
                        Fix
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings */}
          {outOfGamutColors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {outOfGamutColors.length} color{outOfGamutColors.length > 1 ? 's' : ''} may not print accurately. 
                Consider using the suggested Pantone alternatives.
              </AlertDescription>
            </Alert>
          )}

          {colors.length > 6 && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Your design uses {colors.length} colors. Screen printing typically allows 
                maximum 6 spot colors. Consider reducing colors or using DTG printing.
              </AlertDescription>
            </Alert>
          )}

          {colors.length <= 6 && outOfGamutColors.length === 0 && (
            <Alert>
              <CheckCircle className="w-4 h-4" />
              <AlertDescription>
                All colors are print-ready and within acceptable gamut ranges.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Color Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Color Picker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Color Value</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-16 h-10 p-1 border-border"
              />
              <Input
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="flex-1 font-mono"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Active Color Analysis */}
          {activeColor && (
            <div className="space-y-2">
              <Label className="text-sm">Color Analysis</Label>
              {(() => {
                const info = getColorInfo(activeColor);
                const warning = generateColorWarning(info);
                
                return (
                  <div className="p-3 border rounded bg-muted/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: activeColor }}
                      />
                      <span className="font-mono text-sm">{activeColor.toUpperCase()}</span>
                      {info.isOutOfGamut ? (
                        <Badge variant="destructive">Out of Gamut</Badge>
                      ) : (
                        <Badge variant="default">Print Safe</Badge>
                      )}
                    </div>
                    
                    {info.pantone && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Nearest Pantone:</strong> {info.pantone}
                        {info.name && ` (${info.name})`}
                      </div>
                    )}
                    
                    {warning && (
                      <Alert className="mt-2">
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription className="text-xs">
                          {warning}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};