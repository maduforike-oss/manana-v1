"use client";
import { useState } from "react";
import { useStudioStore } from "@/lib/studio/store";
import { getCandidateUrls, setRuntimeGarmentImage } from "@/lib/studio/imageMapping";
import { GARMENT_TYPES } from "@/lib/studio/garments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Wand2, Shirt, RotateCcw, Palette } from "lucide-react";
import { toast } from "sonner";

export function StudioSidebar() {
  const { doc, updateCanvas } = useStudioStore();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  
  // Get current garment info from canvas
  const currentGarmentType = doc.canvas.garmentType || 'tshirt';
  const currentOrientation = 'front'; // Default to front for now

  async function generate(mode: "auto" | "mock" | "openai" = "auto") {
    setLoading(true);
    setMsg(null);
    
    try {
      const r = await fetch("/api/generate-garment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          garmentId: currentGarmentType, 
          orientation: currentOrientation, 
          colorHex: "#f5f5f5", 
          mode 
        }),
      });
      
      const json = await r.json();
      if (!json.ok) throw new Error(json.error || "Generation failed");
      
      if (json.previewDataUrl) {
        setRuntimeGarmentImage(currentGarmentType, currentOrientation, json.previewDataUrl);
        toast.success(`Generated ${json.filename}`);
      }
      
      setMsg(`Generated ${json.filename} (${json.diagnostics?.mode || "unknown"})`);
    } catch (e: any) {
      const errorMsg = e.message || "Error";
      setMsg(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const handleGarmentChange = (garmentId: string) => {
    updateCanvas({ garmentType: garmentId });
    toast.success(`Switched to ${garmentId}`);
  };

  const currentGarment = GARMENT_TYPES.find(g => g.id === currentGarmentType);

  return (
    <aside className="w-80 border-r border-border bg-background p-4 space-y-6 overflow-y-auto">
      {/* Current Garment Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Current Garment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentGarment && (
            <>
              <div className="flex items-center justify-between">
                <span className="font-medium">{currentGarment.name}</span>
                <Badge variant="secondary">{currentGarment.category}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Canvas: {doc.canvas.width}×{doc.canvas.height}px
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Garment Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Switch Garment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {GARMENT_TYPES.slice(0, 8).map((garment) => (
              <Button
                key={garment.id}
                variant={currentGarmentType === garment.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleGarmentChange(garment.id)}
                className="text-xs p-2 h-auto"
              >
                {garment.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* AI Base Image Generation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            AI Base Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => generate("auto")}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Base Image
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => generate("mock")}
              disabled={loading}
              className="w-full"
            >
              <Shirt className="w-4 h-4 mr-2" />
              Mock Template
            </Button>
          </div>
          
          {msg && (
            <div className="text-xs p-2 bg-muted rounded text-muted-foreground">
              {msg}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canvas Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Canvas Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateCanvas({ background: 'transparent' });
              toast.success('Background cleared');
            }}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Background
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateCanvas({ showGrid: !doc.canvas.showGrid });
              toast.success(`Grid ${doc.canvas.showGrid ? 'hidden' : 'shown'}`);
            }}
            className="w-full"
          >
            <Palette className="w-4 h-4 mr-2" />
            Toggle Grid
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}