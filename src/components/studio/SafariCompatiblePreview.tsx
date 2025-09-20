import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, RotateCw, AlertTriangle } from 'lucide-react';
import { useStudioStore } from '@/studio/store';
import { ViewName } from '@/studio/types';
import { useSafariCompatibility } from '@/hooks/useSafariCompatibility';
import { useToast } from '@/hooks/useToast';

export const SafariCompatiblePreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentView, setCurrentView] = useState<ViewName>('front');
  const [showWatermark, setShowWatermark] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [renderingError, setRenderingError] = useState<string | null>(null);
  
  const { nodes, garment, safe } = useStudioStore();
  const {
    deviceInfo,
    loadImageSafely,
    exportCanvasSafely,
    downloadSafely,
    getOptimalCanvasSize
  } = useSafariCompatibility();
  const { toast } = useToast();

  const getAssetPath = useCallback((asset: string) => {
    // Use absolute paths for better Safari compatibility
    const basePath = window.location.origin;
    return `${basePath}/assets/garments/${garment.slug}-${garment.color}-${currentView}-${asset}.png`;
  }, [garment, currentView]);

  const renderPreview = useCallback(async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLoading(true);
    setRenderingError(null);

    try {
      // Get optimal canvas size for the device
      const optimalSize = getOptimalCanvasSize(600, 700);
      canvas.width = optimalSize.width;
      canvas.height = optimalSize.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set high quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Load garment mockup safely
      try {
        const mockupImg = await loadImageSafely(getAssetPath('mockup'));
        
        if (mockupImg.naturalWidth > 0) {
          ctx.drawImage(mockupImg, 0, 0, canvas.width, canvas.height);
        } else {
          throw new Error('Mockup image failed to load');
        }
      } catch (error) {
        // Fallback rendering for garment
        ctx.fillStyle = 'hsl(var(--muted))';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'hsl(var(--muted-foreground))';
        ctx.font = `${16 * optimalSize.scale}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText('Garment Preview', canvas.width / 2, canvas.height / 2);
        ctx.fillText(`${garment.slug} - ${garment.color} - ${currentView}`, canvas.width / 2, canvas.height / 2 + 30 * optimalSize.scale);
      }

      // Calculate design area with scaling
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
      const scaleX = (designArea.width / 800) * optimalSize.scale;
      const scaleY = (designArea.height / 600) * optimalSize.scale;

      // Render nodes
      for (const node of nodes) {
        if (node.hidden) continue;
        
        ctx.save();
        ctx.globalAlpha = node.opacity || 1;
        
        const x = designArea.x + (node.x * scaleX);
        const y = designArea.y + (node.y * scaleY);
        const width = node.width * scaleX;
        const height = node.height * scaleY;
        
        try {
          if (node.type === 'rect') {
            ctx.fillStyle = (node as any).fill || 'hsl(var(--foreground))';
            ctx.fillRect(x, y, width, height);
            
            if ((node as any).stroke && (node as any).strokeWidth > 0) {
              ctx.strokeStyle = (node as any).stroke;
              ctx.lineWidth = (node as any).strokeWidth * Math.min(scaleX, scaleY);
              ctx.strokeRect(x, y, width, height);
            }
          } else if (node.type === 'circle') {
            ctx.fillStyle = (node as any).fill || 'hsl(var(--foreground))';
            ctx.beginPath();
            ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
            ctx.fill();
            
            if ((node as any).stroke && (node as any).strokeWidth > 0) {
              ctx.strokeStyle = (node as any).stroke;
              ctx.lineWidth = (node as any).strokeWidth * Math.min(scaleX, scaleY);
              ctx.stroke();
            }
          } else if (node.type === 'text') {
            ctx.fillStyle = (node as any).fill || 'hsl(var(--foreground))';
            const fontSize = ((node as any).fontSize || 24) * Math.min(scaleX, scaleY);
            ctx.font = `${fontSize}px ${(node as any).fontFamily || 'system-ui'}`;
            ctx.fillText((node as any).text || 'Text', x, y + fontSize);
          } else if (node.type === 'image' && (node as any).src) {
            try {
              const img = await loadImageSafely((node as any).src);
              if (img.naturalWidth > 0) {
                ctx.drawImage(img, x, y, width, height);
              }
            } catch (e) {
              // Skip failed images silently
            }
          }
        } catch (error) {
          console.warn(`Failed to render node ${node.id}:`, error);
        }
        
        ctx.restore();
      }

      ctx.restore();

      // Add watermark if enabled
      if (showWatermark) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = 'hsla(var(--background), 0.9)';
        const watermarkWidth = 170 * optimalSize.scale;
        const watermarkHeight = 30 * optimalSize.scale;
        ctx.fillRect(canvas.width - watermarkWidth - 10, canvas.height - watermarkHeight - 10, watermarkWidth, watermarkHeight);
        ctx.fillStyle = 'hsl(var(--foreground))';
        ctx.font = `${14 * optimalSize.scale}px system-ui`;
        ctx.textAlign = 'right';
        ctx.fillText('Manana Design Studio', canvas.width - 10, canvas.height - 20 * optimalSize.scale);
        ctx.restore();
      }

    } catch (error) {
      console.error('Preview render error:', error);
      setRenderingError(error instanceof Error ? error.message : 'Unknown rendering error');
      
      // Ultimate fallback
      ctx.fillStyle = 'hsl(var(--muted))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'hsl(var(--destructive))';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Preview not available', canvas.width / 2, canvas.height / 2);
      if (deviceInfo.isSafari || deviceInfo.isIOS) {
        ctx.fillText('Safari compatibility issue detected', canvas.width / 2, canvas.height / 2 + 25);
      }
    } finally {
      setIsLoading(false);
    }
  }, [nodes, currentView, garment, showWatermark, loadImageSafely, getAssetPath, getOptimalCanvasSize, deviceInfo]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  const exportPreview = useCallback(async (format: 'png' | 'jpeg') => {
    if (!canvasRef.current) return;
    
    setIsLoading(true);
    
    try {
      // For Safari/iOS, use current canvas size to avoid memory issues
      const canvas = canvasRef.current;
      
      if (deviceInfo.isSafari || deviceInfo.isIOS) {
        // Export current canvas directly for Safari/iOS
        const url = await exportCanvasSafely(canvas, format);
        if (url) {
          const filename = `preview_${garment.slug}_${currentView}_${Date.now()}.${format}`;
          downloadSafely(url, filename);
          toast({
            title: "Export successful",
            description: `Preview saved as ${format.toUpperCase()}`
          });
        } else {
          throw new Error('Failed to export canvas');
        }
      } else {
        // Create high-res export for other browsers
        const exportCanvas = document.createElement('canvas');
        const ctx = exportCanvas.getContext('2d');
        if (!ctx) throw new Error('Failed to create export canvas');

        const optimalSize = getOptimalCanvasSize(1200, 1400);
        exportCanvas.width = optimalSize.width;
        exportCanvas.height = optimalSize.height;
        
        // Scale and redraw
        ctx.scale(optimalSize.scale, optimalSize.scale);
        ctx.drawImage(canvas, 0, 0);

        const url = await exportCanvasSafely(exportCanvas, format);
        if (url) {
          const filename = `preview_${garment.slug}_${currentView}_${Date.now()}.${format}`;
          downloadSafely(url, filename);
          toast({
            title: "Export successful",
            description: `High-resolution preview saved as ${format.toUpperCase()}`
          });
        } else {
          throw new Error('Failed to export high-resolution canvas');
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: deviceInfo.isSafari ? "Safari export limitations detected. Try PNG format." : "Unable to export preview",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [canvasRef, deviceInfo, garment, currentView, exportCanvasSafely, downloadSafely, getOptimalCanvasSize]);

  const availableViews: ViewName[] = ['front', 'back', 'left', 'right'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Preview & Export</h2>
        <p className="text-muted-foreground">
          See how your design looks on the garment and export high-quality previews.
        </p>
        {(deviceInfo.isSafari || deviceInfo.isIOS) && (
          <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <p className="font-medium">Safari/iOS detected</p>
              <p>Preview optimized for your device. Some features may be limited.</p>
            </div>
          </div>
        )}
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
                    onClick={renderPreview}
                    disabled={isLoading}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderingError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">Rendering Error: {renderingError}</p>
                </div>
              )}
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
                {deviceInfo.isSafari || deviceInfo.isIOS ? (
                  <p>• Optimized resolution for Safari/iOS</p>
                ) : (
                  <p>• High resolution (1200x1400px) for both formats</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Device Info */}
          {(deviceInfo.isSafari || deviceInfo.isIOS) && (
            <Card>
              <CardHeader>
                <CardTitle>Device Compatibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Browser:</span>
                  <span className="font-medium">{deviceInfo.isSafari ? 'Safari' : 'Other'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <span className="font-medium">{deviceInfo.isIOS ? 'iOS' : 'Desktop'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Canvas:</span>
                  <span className="font-medium">{deviceInfo.maxCanvasSize}px</span>
                </div>
              </CardContent>
            </Card>
          )}

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
        </div>
      </div>
    </div>
  );
};