"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileImage, Printer, Package, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useStudioStore } from '@/lib/studio/store';
import { exportRaster, exportPrintReady, downloadBlob } from '@/lib/print/export';
import { makePixelDims } from '@/lib/print/dpi';
import type { PrintPreset } from '@/lib/print/types';

export const PrintExportPanel = () => {
  const { doc, getCanvasElement } = useStudioStore();
  const { toast } = useToast();
  const [presets, setPresets] = useState<PrintPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PrintPreset | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    transparent: false,
    includeBleed: true,
    format: 'png' as 'png' | 'pdf' | 'svg'
  });

  // Load print presets
  useEffect(() => {
    const loadPresets = async () => {
      const { data, error } = await supabase
        .from('print_presets')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Failed to load print presets:', error);
        return;
      }
      
      setPresets(data || []);
      if (data && data.length > 0) {
        setSelectedPreset(data[0]);
      }
    };
    
    loadPresets();
  }, []);

  const handleExport = async () => {
    if (!selectedPreset) {
      toast({
        title: "No Preset Selected",
        description: "Please select a print preset before exporting.",
        variant: "destructive"
      });
      return;
    }

    const canvas = getCanvasElement();
    if (!canvas) {
      toast({
        title: "Canvas Not Found",
        description: "Unable to access the design canvas.",
        variant: "destructive"
      });
      return;
    }

    setExporting(true);

    try {
      const dims = makePixelDims(selectedPreset.width_in, selectedPreset.height_in, selectedPreset.dpi);
      const bleedPx = exportOptions.includeBleed ? Math.round(selectedPreset.bleed_in * selectedPreset.dpi) : 0;

      const exportRequest = {
        width_px: dims.wPx + (bleedPx * 2),
        height_px: dims.hPx + (bleedPx * 2),
        dpi: selectedPreset.dpi,
        format: exportOptions.format,
        transparent: exportOptions.transparent,
        color_profile: 'sRGB',
        include_bleed: exportOptions.includeBleed
      };

      const blob = await exportRaster(canvas, exportRequest);
      const filename = `${doc.title || 'design'}-print-ready.${exportOptions.format}`;
      downloadBlob(blob, filename);

      toast({
        title: "Export Complete",
        description: `${filename} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleProductionPackage = async () => {
    if (!selectedPreset) {
      toast({
        title: "No Preset Selected",
        description: "Please select a print preset before exporting.",
        variant: "destructive"
      });
      return;
    }

    const canvas = getCanvasElement();
    if (!canvas) return;

    setExporting(true);

    try {
      const { files, specs } = await exportPrintReady(canvas, doc, selectedPreset);
      
      // Create specs file
      const specsBlob = new Blob([JSON.stringify(specs, null, 2)], { type: 'application/json' });
      downloadBlob(specsBlob, `${doc.title || 'design'}-specs.json`);

      toast({
        title: "Production Package Ready",
        description: "Print-ready files with specifications have been generated.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An error occurred during export.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  if (presets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Print Presets Loading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Loading print presets...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Print Preset</Label>
            <Select
              value={selectedPreset?.id || ''}
              onValueChange={(id) => {
                const preset = presets.find(p => p.id === id);
                setSelectedPreset(preset || null);
              }}
            >
              <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/50">
                <SelectValue placeholder="Select a print preset" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-md border-border/50 z-50">
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id} className="focus:bg-accent/80">
                    <div className="flex items-center justify-between w-full">
                      <span>{preset.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {preset.width_in}"×{preset.height_in}" @ {preset.dpi}DPI
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preset Details */}
          {selectedPreset && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Dimensions:</span>
                <div className="font-medium">{selectedPreset.width_in}" × {selectedPreset.height_in}"</div>
              </div>
              <div>
                <span className="text-muted-foreground">Resolution:</span>
                <div className="font-medium">{selectedPreset.dpi} DPI</div>
              </div>
              <div>
                <span className="text-muted-foreground">Bleed:</span>
                <div className="font-medium">{selectedPreset.bleed_in}"</div>
              </div>
              <div>
                <span className="text-muted-foreground">Pixel Size:</span>
                <div className="font-medium">
                  {makePixelDims(selectedPreset.width_in, selectedPreset.height_in, selectedPreset.dpi).wPx} × 
                  {makePixelDims(selectedPreset.width_in, selectedPreset.height_in, selectedPreset.dpi).hPx}px
                </div>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="transparent" className="text-sm">Transparent Background</Label>
              <Switch
                id="transparent"
                checked={exportOptions.transparent}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, transparent: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="bleed" className="text-sm">Include Bleed Area</Label>
              <Switch
                id="bleed"
                checked={exportOptions.includeBleed}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeBleed: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Export Format</Label>
              <Select
                value={exportOptions.format}
                onValueChange={(format: 'png' | 'pdf' | 'svg') => 
                  setExportOptions(prev => ({ ...prev, format }))
                }
              >
                <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border/50 z-50">
                  <SelectItem value="png" className="focus:bg-accent/80">
                    <div className="flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      PNG (Raster)
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf" className="focus:bg-accent/80">
                    <div className="flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      PDF (Print-Ready)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Actions */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleExport}
              disabled={exporting || !selectedPreset}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Print File'}
            </Button>

            <Button
              onClick={handleProductionPackage}
              disabled={exporting || !selectedPreset}
              className="w-full"
            >
              <Package className="w-4 h-4 mr-2" />
              {exporting ? 'Generating...' : 'Production Package'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};