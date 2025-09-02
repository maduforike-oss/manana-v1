import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MousePointer2, 
  Brush, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  Upload,
  Grid3x3,
  Ruler,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Download,
  Undo,
  Redo
} from 'lucide-react';
import { useStudioStore } from './store';
import { StudioNode, Tool } from './types';

export const DesignTab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [showRulers, setShowRulers] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  
  // Properties panel state
  const [fill, setFill] = useState('#000000');
  const [stroke, setStroke] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [brushWidth, setBrushWidth] = useState(6);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(24);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [textStroke, setTextStroke] = useState({ width: 0, color: '#000000' });
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [shadowBlur, setShadowBlur] = useState(4);
  const [shadowOffset, setShadowOffset] = useState({ x: 2, y: 2 });

  const {
    nodes,
    selectedIds,
    grid,
    guides,
    addNode,
    updateNode,
    removeNode,
    selectNode,
    clearSelection,
    setGrid,
    addGuide,
    removeGuide,
    undo,
    redo,
    safe
  } = useStudioStore();

  const selectedNodes = nodes.filter(node => selectedIds.includes(node.id));

  // Canvas setup
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      if (grid.enabled) {
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += grid.step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += grid.step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Draw safe area
      if (showSafeArea) {
        const safeX = (canvas.width - safe.wPx) / 2;
        const safeY = (canvas.height - safe.hPx) / 2;
        
        ctx.strokeStyle = 'rgba(255,0,0,0.6)';
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 2;
        ctx.strokeRect(safeX, safeY, safe.wPx, safe.hPx);
        ctx.setLineDash([]);
      }

      // Draw guides
      ctx.strokeStyle = 'rgba(0,100,255,0.6)';
      ctx.lineWidth = 1;
      guides.x.forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      });
      guides.y.forEach(y => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        if (node.hidden) return;
        
        ctx.save();
        ctx.globalAlpha = node.opacity || 1;
        
        if (node.type === 'rect') {
          ctx.fillStyle = fill;
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeWidth;
          ctx.fillRect(node.x, node.y, node.width, node.height);
          if (strokeWidth > 0) {
            ctx.strokeRect(node.x, node.y, node.width, node.height);
          }
        } else if (node.type === 'circle') {
          ctx.fillStyle = fill;
          ctx.strokeStyle = stroke;
          ctx.lineWidth = strokeWidth;
          ctx.beginPath();
          ctx.arc(node.x + node.width/2, node.y + node.height/2, node.width/2, 0, Math.PI * 2);
          ctx.fill();
          if (strokeWidth > 0) {
            ctx.stroke();
          }
        } else if (node.type === 'text') {
          ctx.fillStyle = fill;
          ctx.font = `${fontSize}px ${fontFamily}`;
          ctx.fillText(node.text || 'Text', node.x, node.y + fontSize);
        }

        // Selection outline
        if (selectedIds.includes(node.id)) {
          ctx.strokeStyle = '#007bff';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(node.x - 2, node.y - 2, node.width + 4, node.height + 4);
          ctx.setLineDash([]);
        }
        
        ctx.restore();
      });
    };

    render();
    
    // Canvas click handler
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on a node
      const clickedNode = nodes.find(node => 
        x >= node.x && x <= node.x + node.width &&
        y >= node.y && y <= node.y + node.height
      );

      if (clickedNode) {
        selectNode(clickedNode.id);
      } else {
        clearSelection();
        
        // Add guides when rulers are clicked
        if (showRulers) {
          if (y <= 24) { // Top ruler
            addGuide('x', x);
          } else if (x <= 24) { // Left ruler
            addGuide('y', y);
          }
        }
      }
      
      render();
    };

    canvas.addEventListener('click', handleCanvasClick);
    
    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [nodes, selectedIds, grid, guides, safe, showSafeArea, showRulers, fill, stroke, strokeWidth, fontSize, fontFamily]);

  // Tool handlers
  const addShape = (type: 'rect' | 'circle' | 'triangle') => {
    const newNode: StudioNode = {
      id: `${type}_${Date.now()}`,
      type,
      x: 300,
      y: 200,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodes.length + 1}`
    };
    addNode(newNode);
  };

  const addText = () => {
    const newNode: StudioNode = {
      id: `text_${Date.now()}`,
      type: 'text',
      x: 300,
      y: 200,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      name: `Text ${nodes.length + 1}`,
      text: 'Your text here'
    };
    addNode(newNode);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newNode: StudioNode = {
        id: `image_${Date.now()}`,
        type: 'image',
        x: 250,
        y: 150,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: 1,
        name: `Image ${nodes.length + 1}`,
        src: event.target?.result as string
      };
      addNode(newNode);
    };
    reader.readAsDataURL(file);
  };

  const exportPNG = () => {
    if (!canvasRef.current) return;
    
    // Create high-res export canvas
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    exportCanvas.width = 2400; // 300 DPI equivalent
    exportCanvas.height = 1800;
    
    const scale = 3; // Scale factor for high-res
    
    // Draw nodes only (no grid, guides, safe area)
    nodes.forEach(node => {
      if (node.hidden) return;
      
      ctx.save();
      ctx.globalAlpha = node.opacity || 1;
      
      if (node.type === 'rect') {
        ctx.fillStyle = fill;
        ctx.fillRect(node.x * scale, node.y * scale, node.width * scale, node.height * scale);
      } else if (node.type === 'circle') {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc((node.x + node.width/2) * scale, (node.y + node.height/2) * scale, (node.width/2) * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (node.type === 'text') {
        ctx.fillStyle = fill;
        ctx.font = `${fontSize * scale}px ${fontFamily}`;
        ctx.fillText(node.text || 'Text', node.x * scale, (node.y + fontSize) * scale);
      }
      
      ctx.restore();
    });

    // Download
    const dataURL = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `design_${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  const deleteSelected = () => {
    selectedIds.forEach(id => removeNode(id));
  };

  const toggleNodeVisibility = (id: string, hidden: boolean) => {
    updateNode(id, { hidden });
  };

  const toggleNodeLock = (id: string, locked: boolean) => {
    updateNode(id, { locked });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <div className="w-16 bg-card border-r border-border/50 flex flex-col items-center py-4 space-y-2">
        {[
          { tool: 'select', icon: MousePointer2 },
          { tool: 'brush', icon: Brush },
          { tool: 'rect', icon: Square },
          { tool: 'circle', icon: Circle },
          { tool: 'triangle', icon: Triangle },
          { tool: 'text', icon: Type }
        ].map(({ tool, icon: Icon }) => (
          <Button
            key={tool}
            variant={activeTool === tool ? 'default' : 'ghost'}
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => {
              setActiveTool(tool as Tool);
              if (['rect', 'circle', 'triangle'].includes(tool)) {
                addShape(tool as any);
              } else if (tool === 'text') {
                addText();
              }
            }}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <Upload className="w-4 h-4" />
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        <div className="border-t border-border/50 pt-2 mt-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={undo}
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={redo}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
            onClick={exportPNG}
            title="Export PNG"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas controls */}
        <div className="h-12 bg-card border-b border-border/50 flex items-center px-4 space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={grid.enabled}
              onCheckedChange={(enabled) => setGrid({ enabled })}
            />
            <Grid3x3 className="w-4 h-4" />
            <span className="text-sm">Grid</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={showRulers}
              onCheckedChange={setShowRulers}
            />
            <Ruler className="w-4 h-4" />
            <span className="text-sm">Rulers</span>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={showSafeArea}
              onCheckedChange={setShowSafeArea}
            />
            <span className="text-sm">Safe Area</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">Grid Size:</span>
            <Select
              value={grid.step.toString()}
              onValueChange={(value) => setGrid({ step: parseInt(value) })}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4px</SelectItem>
                <SelectItem value="8">8px</SelectItem>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="24">24px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main canvas area */}
        <div className="flex-1 flex">
          <div className="flex-1 relative bg-muted/20 overflow-hidden">
            {showRulers && (
              <>
                {/* Top ruler */}
                <div className="absolute top-0 left-6 right-0 h-6 bg-card border-b border-border/50 z-10"></div>
                {/* Left ruler */}
                <div className="absolute top-6 left-0 bottom-0 w-6 bg-card border-r border-border/50 z-10"></div>
              </>
            )}
            <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: showRulers ? '24px' : 0, paddingLeft: showRulers ? '24px' : 0 }}>
              <canvas
                ref={canvasRef}
                className="border border-border/50 bg-background shadow-sm"
                style={{ cursor: activeTool === 'brush' ? 'crosshair' : 'default' }}
              />
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-card border-l border-border/50">
            <Tabs defaultValue="properties" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="layers">Layers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="properties" className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-6">
                    {/* Fill & Stroke */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Fill & Stroke</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-xs">Fill Color</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="color"
                              value={fill}
                              onChange={(e) => setFill(e.target.value)}
                              className="w-12 h-8 p-1"
                            />
                            <Input
                              value={fill}
                              onChange={(e) => setFill(e.target.value)}
                              className="flex-1 text-xs font-mono"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Stroke Color</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="color"
                              value={stroke}
                              onChange={(e) => setStroke(e.target.value)}
                              className="w-12 h-8 p-1"
                            />
                            <Input
                              value={stroke}
                              onChange={(e) => setStroke(e.target.value)}
                              className="flex-1 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">Stroke Width: {strokeWidth}px</Label>
                          <Slider
                            value={[strokeWidth]}
                            onValueChange={(value) => setStrokeWidth(value[0])}
                            min={0}
                            max={10}
                            step={1}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Brush Width: {brushWidth}px</Label>
                          <Slider
                            value={[brushWidth]}
                            onValueChange={(value) => setBrushWidth(value[0])}
                            min={1}
                            max={20}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Typography */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Typography</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-xs">Font Family</Label>
                          <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs">Font Size: {fontSize}px</Label>
                          <Slider
                            value={[fontSize]}
                            onValueChange={(value) => setFontSize(value[0])}
                            min={8}
                            max={120}
                            step={1}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Letter Spacing: {letterSpacing}px</Label>
                          <Slider
                            value={[letterSpacing]}
                            onValueChange={(value) => setLetterSpacing(value[0])}
                            min={-2}
                            max={10}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Line Height: {lineHeight}</Label>
                          <Slider
                            value={[lineHeight]}
                            onValueChange={(value) => setLineHeight(value[0])}
                            min={0.8}
                            max={3}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={textStroke.width > 0}
                              onCheckedChange={(checked) => 
                                setTextStroke(prev => ({ ...prev, width: checked ? 2 : 0 }))
                              }
                            />
                            <Label className="text-xs">Text Stroke</Label>
                          </div>
                          {textStroke.width > 0 && (
                            <div className="mt-2 space-y-2">
                              <div>
                                <Label className="text-xs">Stroke Width: {textStroke.width}px</Label>
                                <Slider
                                  value={[textStroke.width]}
                                  onValueChange={(value) => 
                                    setTextStroke(prev => ({ ...prev, width: value[0] }))
                                  }
                                  min={1}
                                  max={10}
                                  step={1}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Stroke Color</Label>
                                <Input
                                  type="color"
                                  value={textStroke.color}
                                  onChange={(e) => 
                                    setTextStroke(prev => ({ ...prev, color: e.target.value }))
                                  }
                                  className="w-full h-8 mt-1"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Shadow */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Shadow</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={shadowEnabled}
                            onCheckedChange={setShadowEnabled}
                          />
                          <Label className="text-xs">Enable Shadow</Label>
                        </div>

                        {shadowEnabled && (
                          <>
                            <div>
                              <Label className="text-xs">Blur: {shadowBlur}px</Label>
                              <Slider
                                value={[shadowBlur]}
                                onValueChange={(value) => setShadowBlur(value[0])}
                                min={0}
                                max={20}
                                step={1}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Offset X: {shadowOffset.x}px</Label>
                              <Slider
                                value={[shadowOffset.x]}
                                onValueChange={(value) => 
                                  setShadowOffset(prev => ({ ...prev, x: value[0] }))
                                }
                                min={-20}
                                max={20}
                                step={1}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Offset Y: {shadowOffset.y}px</Label>
                              <Slider
                                value={[shadowOffset.y]}
                                onValueChange={(value) => 
                                  setShadowOffset(prev => ({ ...prev, y: value[0] }))
                                }
                                min={-20}
                                max={20}
                                step={1}
                                className="mt-1"
                              />
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="layers" className="flex-1 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Layers ({nodes.length})</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deleteSelected}
                      disabled={selectedIds.length === 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-80">
                    <div className="space-y-1">
                      {nodes.map((node) => (
                        <div
                          key={node.id}
                          className={`flex items-center space-x-2 p-2 rounded text-sm cursor-pointer hover:bg-accent/50 ${
                            selectedIds.includes(node.id) ? 'bg-accent' : ''
                          }`}
                          onClick={() => selectNode(node.id)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNodeVisibility(node.id, !node.hidden);
                            }}
                          >
                            {node.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNodeLock(node.id, !node.locked);
                            }}
                          >
                            {node.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          </Button>
                          
                          <span className="flex-1 truncate">{node.name}</span>
                          
                          <span className="text-xs text-muted-foreground capitalize">
                            {node.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};