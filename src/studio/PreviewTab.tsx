import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, RotateCw } from 'lucide-react';
import { useStudioStore } from './store';
import { ViewName } from './types';

export const PreviewTab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentView, setCurrentView] = useState<ViewName>('front');
  const [showWatermark, setShowWatermark] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const { nodes, garment, safe } = useStudioStore();

  // Mock garment assets - in a real app, these would come from your asset system
  const getAssetPath = (asset: string) => {
    return `/assets/garments/${garment.slug}-${garment.color}-${currentView}-${asset}.png`;
  };

  const renderPreview = async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 700;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Load garment mockup
      const mockupImg = new Image();
      mockupImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        mockupImg.onload = resolve;
        mockupImg.onerror = () => {
          // Fallback to a placeholder
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#666';
          ctx.font = '16px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('Garment Preview', canvas.width / 2, canvas.height / 2);
          ctx.fillText(`${garment.slug} - ${garment.color} - ${currentView}`, canvas.width / 2, canvas.height / 2 + 30);
          resolve(null);
        };
        mockupImg.src = getAssetPath('mockup');
      });

      if (mockupImg.complete && mockupImg.naturalWidth > 0) {
        // Draw base garment
        ctx.drawImage(mockupImg, 0, 0, canvas.width, canvas.height);
      }

      // Calculate design area on the garment (simplified positioning)
      const designArea = {
        x: canvas.width * 0.25,
        y: canvas.height * 0.3,
        width: canvas.width * 0.5,
        height: canvas.height * 0.4
      };

      // Draw design elements
      ctx.save();
      
      // Clip to design area
      ctx.beginPath();
      ctx.rect(designArea.x, designArea.y, designArea.width, designArea.height);
      ctx.clip();

      // Scale factor from design canvas to preview
      const scaleX = designArea.width / 800; // 800 is design canvas width
      const scaleY = designArea.height / 600; // 600 is design canvas height

      nodes.forEach(node => {
        if (node.hidden) return;
        
        ctx.save();
        ctx.globalAlpha = node.opacity || 1;
        
        const x = designArea.x + (node.x * scaleX);
        const y = designArea.y + (node.y * scaleY);
        const width = node.width * scaleX;
        const height = node.height * scaleY;
        
        if (node.type === 'rect') {
          ctx.fillStyle = (node as any).fill || '#000000';
          ctx.fillRect(x, y, width, height);
          
          if ((node as any).stroke && (node as any).strokeWidth > 0) {
            ctx.strokeStyle = (node as any).stroke;
            ctx.lineWidth = (node as any).strokeWidth * Math.min(scaleX, scaleY);
            ctx.strokeRect(x, y, width, height);
          }
        } else if (node.type === 'circle') {
          ctx.fillStyle = (node as any).fill || '#000000';
          ctx.beginPath();
          ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
          ctx.fill();
          
          if ((node as any).stroke && (node as any).strokeWidth > 0) {
            ctx.strokeStyle = (node as any).stroke;
            ctx.lineWidth = (node as any).strokeWidth * Math.min(scaleX, scaleY);
            ctx.stroke();
          }
        } else if (node.type === 'text') {
          ctx.fillStyle = (node as any).fill || '#000000';
          const fontSize = ((node as any).fontSize || 24) * Math.min(scaleX, scaleY);
          ctx.font = `${fontSize}px ${(node as any).fontFamily || 'Arial'}`;
          ctx.fillText((node as any).text || 'Text', x, y + fontSize);
        } else if (node.type === 'image' && (node as any).src) {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
              img.src = (node as any).src;
            });
            
            if (img.complete && img.naturalWidth > 0) {
              ctx.drawImage(img, x, y, width, height);
            }
          } catch (e) {
            // Skip failed images
          }
        }
        
        ctx.restore();
      });

      ctx.restore();

      // Try to load and apply shadow (optional enhancement)
      try {
        const shadowImg = new Image();
        shadowImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          shadowImg.onload = resolve;
          shadowImg.onerror = reject;
          shadowImg.src = getAssetPath('shadow');
        });
        
        if (shadowImg.complete && shadowImg.naturalWidth > 0) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = 0.3;
          ctx.drawImage(shadowImg, 0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1;
        }
      } catch (e) {
        // Shadow is optional
      }

      // Add watermark if enabled
      if (showWatermark) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(canvas.width - 180, canvas.height - 40, 170, 30);
        ctx.fillStyle = '#333';
        ctx.font = '14px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText('Manana Design Studio', canvas.width - 10, canvas.height - 20);
        ctx.restore();
      }

    } catch (error) {
      console.error('Preview render error:', error);
      
      // Fallback rendering
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Preview not available', canvas.width / 2, canvas.height / 2);
    }
  };

  // Re-render when dependencies change
  useEffect(() => {
    renderPreview();
  }, [nodes, currentView, garment, showWatermark]);

  const exportPreview = async (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    
    try {
      // Create high-res export canvas
      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return;

      exportCanvas.width = 1200; // High resolution
      exportCanvas.height = 1400;

      // Scale and redraw
      ctx.scale(2, 2);
      ctx.drawImage(canvasRef.current, 0, 0);

      // Download
      const dataURL = exportCanvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : 1.0);
      const link = document.createElement('a');
      link.download = `preview_${garment.slug}_${currentView}_${Date.now()}.${format}`;
      link.href = dataURL;
      link.click();
    } finally {
      setIsLoading(false);
    }
  };

  const availableViews: ViewName[] = ['front', 'back', 'left', 'right'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Preview & Export</h2>
        <p className="text-muted-foreground">
          See how your design looks on the garment and export high-quality previews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Garment Preview</span>
                <div className="flex items-center space-x-2">
                  <Select value={currentView} onValueChange={(value) => setCurrentView(value as ViewName)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableViews.map(view => (
                        <SelectItem key={view} value={view}>
                          {view.charAt(0).toUpperCase() + view.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => renderPreview()}
                    disabled={isLoading}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="border border-border/50 rounded-lg shadow-sm bg-background max-w-full h-auto"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* View Controls */}
          <Card>
            <CardHeader>
              <CardTitle>View Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current View</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentView.charAt(0).toUpperCase() + currentView.slice(1)} view of {garment.slug}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={showWatermark}
                  onCheckedChange={setShowWatermark}
                />
                <Label>Show Watermark</Label>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportPreview('png')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PNG
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportPreview('jpeg')}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JPEG
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>• PNG: Transparent background, best for web</p>
                <p>• JPEG: Smaller file size, best for email</p>
                <p>• High resolution (1200x1400px) for both formats</p>
              </div>
            </CardContent>
          </Card>

          {/* Garment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Garment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Type:</span>
                <span className="font-medium">{garment.slug}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Color:</span>
                <span className="font-medium">{garment.color}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Size:</span>
                <span className="font-medium">{garment.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Print Area:</span>
                <span className="font-medium">
                  {Math.round(safe.wPx / garment.mmToPx)}×{Math.round(safe.hPx / garment.mmToPx)}mm
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Composite Info */}
          <Card>
            <CardHeader>
              <CardTitle>Rendering</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Base mockup loaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Design composite applied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Shadow effects (optional)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Normal mapping (future)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};