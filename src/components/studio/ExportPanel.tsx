import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useStudioStore } from '@/lib/studio/store';
import { useToast } from '@/hooks/use-toast';
import { exportPNG, exportSVG, exportPrintReady, ExportOptions } from '@/lib/studio/export';
import { Download, FileImage, FileText, Printer, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportPanelProps {
  className?: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ className }) => {
  const { doc, getCanvasElement, getPrintSurfaces } = useStudioStore();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    dpi: 300,
    transparent: false,
    includeBleed: true,
    separateSurfaces: false,
    printReady: false,
    filename: doc.title || 'design'
  });

  const handleExport = async (format: 'png' | 'svg' | 'print-ready') => {
    setExporting(true);
    
    try {
      const canvas = getCanvasElement();
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const options = { ...exportOptions, format };

      switch (format) {
        case 'png':
          await exportPNG(canvas, doc, options);
          toast({
            title: "PNG Export Complete",
            description: `${options.filename}.png has been downloaded.`,
          });
          break;
        
        case 'svg':
          exportSVG(doc, options);
          toast({
            title: "SVG Export Complete", 
            description: `${options.filename}.svg has been downloaded.`,
          });
          break;
        
        case 'print-ready':
          await exportPrintReady(canvas, doc, options);
          toast({
            title: "Print Files Generated",
            description: "Print-ready files with CMYK profiles and bleeds have been created.",
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const surfaces = getPrintSurfaces();
  const activeColorCount = surfaces.reduce((total, surface) => {
    const nodes = doc.nodes.filter(node => node.surfaceId === surface.id);
    const colors = new Set<string>();
    nodes.forEach(node => {
      if (node.type === 'text' && node.fill?.color) colors.add(node.fill.color);
      if (node.type === 'shape' && node.fill?.color) colors.add(node.fill.color);
    });
    return total + colors.size;
  }, 0);

  const estimatedFileSize = (doc.canvas.width * doc.canvas.height * exportOptions.dpi * activeColorCount) / 1000000;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Export Quality Settings */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-foreground">Export Quality</Label>
          <Select 
            value={exportOptions.dpi?.toString()} 
            onValueChange={(value) => setExportOptions(prev => ({ 
              ...prev, 
              dpi: parseInt(value) as 150 | 300 
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="150">
                <div className="flex items-center justify-between w-full">
                  <span>150 DPI</span>
                  <Badge variant="outline">Web</Badge>
                </div>
              </SelectItem>
              <SelectItem value="300">
                <div className="flex items-center justify-between w-full">
                  <span>300 DPI</span>
                  <Badge variant="outline">Print</Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="transparent" className="text-sm">
              Transparent Background
            </Label>
            <Switch
              id="transparent"
              checked={exportOptions.transparent}
              onCheckedChange={(checked) => 
                setExportOptions(prev => ({ ...prev, transparent: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeBleed" className="text-sm">
              Include Bleed Area
            </Label>
            <Switch
              id="includeBleed"
              checked={exportOptions.includeBleed}
              onCheckedChange={(checked) => 
                setExportOptions(prev => ({ ...prev, includeBleed: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="separateSurfaces" className="text-sm">
              Export Each Surface
            </Label>
            <Switch
              id="separateSurfaces"
              checked={exportOptions.separateSurfaces}
              onCheckedChange={(checked) => 
                setExportOptions(prev => ({ ...prev, separateSurfaces: checked }))
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Design Statistics */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Design Info</Label>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Dimensions</span>
            <div className="font-medium">{doc.canvas.width}×{doc.canvas.height}px</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Colors Used</span>
            <div className="font-medium">{activeColorCount} colors</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Print Surfaces</span>
            <div className="font-medium">{surfaces.filter(s => s.enabled).length} active</div>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Est. File Size</span>
            <div className="font-medium">{estimatedFileSize.toFixed(1)}MB</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Export Actions */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Export Options</Label>
        
        <div className="grid gap-3">
          {/* Design Preview Export */}
          <Button
            onClick={() => handleExport('png')}
            disabled={exporting}
            className="h-12 justify-start gap-3"
            variant="outline"
          >
            <FileImage className="w-5 h-5 text-primary" />
            <div className="text-left">
              <div className="font-medium">Design Preview</div>
              <div className="text-xs text-muted-foreground">PNG with transparency</div>
            </div>
          </Button>

          {/* Vector Export */}
          <Button
            onClick={() => handleExport('svg')}
            disabled={exporting}
            className="h-12 justify-start gap-3"
            variant="outline"
          >
            <FileText className="w-5 h-5 text-secondary" />
            <div className="text-left">
              <div className="font-medium">Vector File</div>
              <div className="text-xs text-muted-foreground">SVG scalable format</div>
            </div>
          </Button>

          {/* Print-Ready Export */}
          <Button
            onClick={() => handleExport('print-ready')}
            disabled={exporting}
            className="h-12 justify-start gap-3"
            variant="default"
          >
            <Printer className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Print-Ready Files</div>
              <div className="text-xs opacity-90">CMYK + PDF with bleeds</div>
            </div>
          </Button>
        </div>

        {/* Production Package */}
        <div className="pt-3 border-t border-border">
          <Button
            onClick={() => handleExport('print-ready')}
            disabled={exporting}
            className="w-full h-12 gap-3"
            size="lg"
          >
            <Package className="w-5 h-5" />
            {exporting ? 'Generating...' : 'Download Production Package'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Includes all files needed for professional printing
          </p>
        </div>
      </div>
    </div>
  );
};