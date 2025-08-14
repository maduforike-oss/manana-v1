import { useState, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Palette, Square, Type, Image, Layers, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { GarmentSelector } from '@/components/studio/GarmentSelector';
import { cn } from '@/lib/utils';

export const StudioPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const { selectedGarment, currentDesign } = useAppStore();
  
  const [activePanel, setActivePanel] = useState<'tools' | 'layers' | 'properties'>('tools');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#ffffff',
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  const tools = [
    { id: 'select', icon: Palette, label: 'Select' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'shapes', icon: Square, label: 'Shapes' },
    { id: 'images', icon: Image, label: 'Images' },
  ];

  const handleToolClick = (toolId: string) => {
    console.log(`Tool clicked: ${toolId}`);
    // Tool functionality will be implemented later
  };

  const handleExport = () => {
    console.log('Exporting design...');
    // Export functionality will be implemented later
  };

  const handleAddText = () => {
    console.log('Adding text...');
    // Add text functionality will be implemented later
  };

  const handleAddShape = () => {
    console.log('Adding shape...');
    // Add shape functionality will be implemented later
  };

  const handleUploadImage = () => {
    console.log('Uploading image...');
    // Upload image functionality will be implemented later
  };

  const handleTemplates = () => {
    console.log('Opening templates...');
    // Templates functionality will be implemented later
  };

  if (!selectedGarment) {
    return <GarmentSelector />;
  }

  return (
    <div className="flex h-full bg-workspace">
      {/* Left Toolbar */}
      <div className="w-16 bg-workspace border-r border-workspace-border flex flex-col items-center py-4 gap-2">
        {tools.map(({ id, icon: Icon, label }) => (
          <Button
            key={id}
            variant="ghost"
            size="sm"
            onClick={() => handleToolClick(id)}
            className="w-12 h-12 p-0 text-workspace-foreground hover:bg-primary/20 hover:text-primary"
            title={label}
          >
            <Icon className="w-5 h-5" />
          </Button>
        ))}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 bg-workspace border-b border-workspace-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-workspace-foreground font-medium">
              {currentDesign?.name || 'Untitled Design'}
            </h2>
            <span className="text-xs text-muted-foreground bg-primary/20 px-2 py-1 rounded">
              {selectedGarment}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-workspace-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" onClick={handleExport} className="bg-gradient-to-r from-primary to-secondary text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div className="flex-1 flex">
          <div className="flex-1 p-4 overflow-auto">
            <div className="flex items-center justify-center min-h-full">
              <Card className="p-4 bg-white shadow-workspace">
                <canvas 
                  ref={canvasRef} 
                  className="border border-border rounded-lg"
                />
              </Card>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-80 bg-card border-l border-border flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b border-border">
              {[
                { id: 'tools', label: 'Tools', icon: Palette },
                { id: 'layers', label: 'Layers', icon: Layers },
                { id: 'properties', label: 'Properties', icon: Settings },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActivePanel(id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                    activePanel === id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Panel Content */}
            <div className="flex-1 p-4">
              {activePanel === 'tools' && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Design Tools</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={handleAddText}>Add Text</Button>
                      <Button variant="outline" size="sm" onClick={handleAddShape}>Add Shape</Button>
                      <Button variant="outline" size="sm" onClick={handleUploadImage}>Upload Image</Button>
                      <Button variant="outline" size="sm" onClick={handleTemplates}>Templates</Button>
                    </div>
                  </div>
              )}
              
              {activePanel === 'layers' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Layers</h3>
                  <div className="text-sm text-muted-foreground">
                    No layers yet. Start designing!
                  </div>
                </div>
              )}
              
              {activePanel === 'properties' && (
                <div className="space-y-4">
                  <h3 className="font-medium">Properties</h3>
                  <div className="text-sm text-muted-foreground">
                    Select an element to edit properties
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};