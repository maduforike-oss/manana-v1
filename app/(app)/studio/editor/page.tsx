"use client";
import { useEffect, useMemo, useState } from "react";
import { getCatalog, Garment } from "@/lib/studio/catalog";
import { getTemplate, SupabaseTemplate } from "@/lib/studio/supabaseTemplates";

export default function Editor() {
  const [garment, setGarment] = useState<Garment | null>(null);
  const [template, setTemplate] = useState<SupabaseTemplate | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [view, setView] = useState<"front"|"back"|"left"|"right">("front");
  const [size, setSize] = useState("M");

  useEffect(() => {
    const qp = new URLSearchParams(window.location.search);
    const slug = qp.get("garment") ?? "t-shirt";
    const templateName = qp.get("template");
    const cIdx = parseInt(qp.get("colorIndex") ?? "0", 10);
    const v = (qp.get("view") as any) ?? "front";
    const s = qp.get("size") ?? "M";
    const color = qp.get("color") ?? "white";

    // If template is specified, load it directly from Supabase
    if (templateName) {
      getTemplate(slug, v, color).then(t => {
        if (t) {
          setTemplate(t);
          setView(v);
          setSize(s);
        }
      });
    } else {
      // Fall back to catalog system
      getCatalog().then(cat => {
        const g = cat.garments.find(x => x.slug === slug) || cat.garments[0];
        setGarment(g!);
        setColorIndex(Number.isFinite(cIdx) ? cIdx : 0);
        setView(v);
        setSize(s);
      });
    }
  }, []);

  const mockupSrc = useMemo(() => {
    if (template) {
      return template.url;
    }
    if (!garment) return "";
    const color = garment.colors[colorIndex];
    return color.views[view]?.mockup ?? "";
  }, [template, garment, colorIndex, view]);

  if (!garment && !template) return <div className="p-6">Loading editor…</div>;

  return (
    <main className="p-6 grid gap-6 lg:grid-cols-[1fr,360px]">
      <section className="border rounded p-4">
        <div className="text-sm text-gray-600 mb-2">
          {template ? `${template.garmentType} template` : garment?.name} • {template ? template.color : garment?.colors[colorIndex]?.name} • {view} • size {size}
        </div>
        <div className="relative w-full flex items-center justify-center">
          <img src={mockupSrc} alt="Garment" className="max-h-[70vh] object-contain" />
          {/* TODO: place your Konva Stage here, clipped to print area */}
        </div>
      </section>

      <aside className="border rounded p-4 space-y-4">
        <h2 className="font-medium">Layers & Tools</h2>
        <button className="w-full border rounded py-2">Add Text</button>
        <button className="w-full border rounded py-2">Add Shape</button>
        <button className="w-full border rounded py-2">Upload Image</button>
        <button className="w-full border rounded py-2">Brush</button>
        <hr />
        <button className="w-full bg-black text-white rounded py-2">Export PNG (300 DPI)</button>
      </aside>
    </main>
  );
}