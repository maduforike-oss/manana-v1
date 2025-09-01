"use client";
import { useEffect, useMemo, useState } from "react";
import { getCatalog, Garment } from "@/lib/studio/catalog";
import { generateGarmentAPI } from "@/lib/api/garmentGeneration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { setOpenAIKeyInBrowser } from "@/lib/garmentGeneration";

export default function StudioEditor() {
  const [garment, setGarment] = useState<Garment | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [view, setView] = useState<"front"|"back"|"left"|"right">("front");
  const [size, setSize] = useState("M");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search);
    const slug = qp.get("garment") ?? "t-shirt";
    const cIdx = parseInt(qp.get("colorIndex") ?? "0", 10);
    const v = (qp.get("view") as any) ?? "front";
    const s = qp.get("size") ?? "M";

    getCatalog().then(cat => {
      const g = cat.garments.find(x => x.slug === slug) || cat.garments[0];
      setGarment(g!);
      setColorIndex(Number.isFinite(cIdx) ? cIdx : 0);
      setView(v);
      setSize(s);
    });

    // Check if API key exists
    const existingKey = localStorage.getItem("OPENAI_API_KEY");
    if (!existingKey) {
      setShowKeyInput(true);
    }
  }, []);

  const mockupSrc = useMemo(() => {
    if (!garment) return "";
    const color = garment.colors[colorIndex];
    return color.views[view]?.mockup ?? "";
  }, [garment, colorIndex, view]);

  const handleSetApiKey = () => {
    if (apiKey.trim()) {
      setOpenAIKeyInBrowser(apiKey.trim());
      setShowKeyInput(false);
      toast.success("API key saved! AI generation is now available.");
    }
  };

  const handleGenerateAI = async () => {
    if (!garment) return;
    
    setIsGenerating(true);
    try {
      const result = await generateGarmentAPI({
        garmentId: garment.slug,
        orientation: view === 'left' || view === 'right' ? 'side' : view,
        material: "cotton",
        style: "minimalist design",
        mode: 'auto'
      });

      if (result.ok && result.previewDataUrl) {
        toast.success("AI design generated successfully!");
        // You could add the generated image to your canvas here
        console.log("Generated image:", result.previewDataUrl);
      } else {
        toast.error(result.error || "Generation failed");
      }
    } catch (error) {
      toast.error("Failed to generate AI design");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!garment) return <div className="p-6">Loading editor…</div>;

  return (
    <main className="p-6 grid gap-6 lg:grid-cols-[1fr,360px]">
      <section className="border rounded p-4">
        <div className="text-sm text-muted-foreground mb-2">
          {garment.name} • {garment.colors[colorIndex].name} • {view} • size {size}
        </div>
        <div className="relative w-full flex items-center justify-center">
          <img src={mockupSrc} alt="Garment" className="max-h-[70vh] object-contain" />
          {/* TODO: place your Konva Stage here, clipped to print area */}
        </div>
      </section>

      <aside className="border rounded p-4 space-y-4">
        <h2 className="font-medium">Layers & Tools</h2>
        
        {showKeyInput && (
          <div className="border rounded p-3 bg-muted/50 space-y-2">
            <p className="text-sm font-medium">AI Generation Setup</p>
            <p className="text-xs text-muted-foreground">
              Enter your OpenAI API key to enable AI design generation, or skip to use mock generation.
            </p>
            <Input
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSetApiKey}>Save Key</Button>
              <Button size="sm" variant="outline" onClick={() => setShowKeyInput(false)}>
                Skip (Use Mock)
              </Button>
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleGenerateAI}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate AI Design"}
        </Button>
        
        <hr />
        
        <button className="w-full border rounded py-2 hover:bg-muted/50">Add Text</button>
        <button className="w-full border rounded py-2 hover:bg-muted/50">Add Shape</button>
        <button className="w-full border rounded py-2 hover:bg-muted/50">Upload Image</button>
        <button className="w-full border rounded py-2 hover:bg-muted/50">Brush</button>
        
        <hr />
        
        <button className="w-full bg-primary text-primary-foreground rounded py-2 hover:bg-primary/90">
          Export PNG (300 DPI)
        </button>
        
        {!showKeyInput && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => setShowKeyInput(true)}
          >
            Update API Key
          </Button>
        )}
      </aside>
    </main>
  );
}