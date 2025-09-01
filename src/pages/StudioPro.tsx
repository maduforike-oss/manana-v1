// File: src/pages/StudioPro.tsx
// One-file, drop-in pro studio for Manana (Vite + React + Fabric.js)
// - Bottom tabs match Manana: Profile, Orders, Studio, Community, Market
// - Tools: Move/Select, Brush, Rect, Circle, Triangle, Text, Image Upload
// - Precision: Grid + snap, movable rulers, clickable guide creation, safe print area overlay
// - Layers: list, lock/hide, order, delete
// - Export: Transparent PNG (excludes mockup/rulers/guides/print-area)
//
// Optional query params (to integrate with your garment picker):
//   mockup   = URL to garment mockup (e.g. /catalog/t-shirt/white/front.png)
//   size     = garment size label (e.g. XS|S|M|L|XL|XXL) [display only]
//   mmToPx   = pixels per millimeter (e.g. 3.543 for 300 DPI) [default 3.543]
//   safeWmm  = printable safe width in millimeters (e.g. 280)
//   safeHmm  = printable safe height in millimeters (e.g. 380)
//
// If you don't have routes yet, just navigate to /studio/pro in dev and mount this component there.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Triangle, IText, PencilBrush, FabricImage, Line } from "fabric";

// ---------- Bottom Tabs (aligns with Manana) ----------
const BottomTabs: React.FC<{ active: "profile"|"orders"|"studio"|"community"|"market" }> = ({ active }) => {
  const Tab = ({ label, path, id }: { label: string; path: string; id: any }) => (
    <button
      onClick={() => (window.location.href = path)}
      className={
        "px-3 py-2 rounded-md border " +
        (active === id ? "bg-black text-white border-black" : "bg-white text-black hover:bg-neutral-50")
      }
    >
      {label}
    </button>
  );
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-white/90 backdrop-blur border rounded-xl p-2 shadow">
      <Tab id="profile"   label="Profile"   path="/" />
      <Tab id="orders"    label="Orders"    path="/orders" />
      <Tab id="studio"    label="Studio"    path="/studio" />
      <Tab id="community" label="Community" path="/" />
      <Tab id="market"    label="Market"    path="/" />
    </div>
  );
};

// ---------- Helpers ----------
type Tool = "select" | "brush" | "rect" | "circle" | "triangle" | "text" | "image";

const useQuery = () => {
  const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  return (k: string, fallback?: string) => sp.get(k) ?? fallback;
};

function makeGridPattern(size = 24, stroke = "rgba(0,0,0,0.08)") {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0.5, 0);
  ctx.lineTo(0.5, size);
  ctx.moveTo(0, 0.5);
  ctx.lineTo(size, 0.5);
  ctx.stroke();
  return c.toDataURL("image/png");
}

function downloadDataURL(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Mark UI objects so we can exclude on export
const markUI = (obj: any, tag: string) => ((obj as any).uiTag = tag, obj);

// ---------- Component ----------
const StudioPro: React.FC = () => {
  const getQ = useQuery();
  const mockupUrl = getQ("mockup") || "";            // optional
  const sizeLabel = getQ("size") || "M";             // display only
  const mmToPx = parseFloat(getQ("mmToPx") || "3.543"); // ~300DPI default
  const safeWmm = parseFloat(getQ("safeWmm") || "280");
  const safeHmm = parseFloat(getQ("safeHmm") || "380");

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<FabricCanvas | null>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [fill, setFill] = useState<string>("#111111");
  const [stroke, setStroke] = useState<string>("#000000");
  const [strokeW, setStrokeW] = useState<number>(2);
  const [brushW, setBrushW] = useState<number>(6);
  const [fontSize, setFontSize] = useState<number>(48);
  const [fontFamily, setFontFamily] = useState<string>("system-ui, -apple-system, Segoe UI, Roboto, sans-serif");
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snap, setSnap] = useState<boolean>(true);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [objects, setObjects] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number>(-1);

  const gridDataUrl = useMemo(() => makeGridPattern(24, "rgba(0,0,0,0.07)"), []);
  const printAreaPx = useMemo(() => ({
    w: Math.round(safeWmm * mmToPx),
    h: Math.round(safeHmm * mmToPx)
  }), [safeWmm, safeHmm, mmToPx]);

  // Init canvas
  useEffect(() => {
    if (!containerRef.current) return;
    const el = document.createElement("canvas");
    el.id = "manana-studio-canvas";
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(el);

    const pad = 24;
    const maxW = Math.min(1000, containerRef.current.clientWidth);
    const maxH = Math.min(800, window.innerHeight - 220);
    let W = Math.max(600, maxW);
    let H = Math.max(500, maxH);

    const canvas = new FabricCanvas(el, {
      width: W,
      height: H,
      preserveObjectStacking: true,
      selection: true
    });
    canvasRef.current = canvas;

    // Background grid
    if (showGrid) {
      FabricImage.fromURL(gridDataUrl).then((img) => {
        img.scaleToWidth(W);
        img.scaleToHeight(H);
        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    }

    // Mockup (background image)
    if (mockupUrl) {
      FabricImage.fromURL(mockupUrl, { crossOrigin: "anonymous" }).then((img) => {
        // Fit mockup within canvas while preserving aspect ratio
        const scale = Math.min((W - pad*2) / img.width, (H - pad*2) / img.height);
        img.set({
          left: (W - img.width * scale) / 2,
          top: (H - img.height * scale) / 2,
          selectable: false,
          evented: false,
          hoverCursor: 'default',
          moveCursor: 'default'
        });
        img.scale(scale);
        markUI(img, "mockup");
        canvas.add(img);
        canvas.sendObjectToBack(img);
        canvas.renderAll();
      });
    }

    // Print-safe area overlay (dashed rectangle)
    const rect = new Rect({
      left: W/2 - printAreaPx.w/2,
      top: H/2 - printAreaPx.h/2,
      width: printAreaPx.w,
      height: printAreaPx.h,
      fill: "rgba(0,0,0,0.02)",
      stroke: "rgba(255,0,0,0.55)",
      strokeDashArray: [8, 8],
      selectable: false,
      evented: false
    });
    markUI(rect, "printSafe");
    canvas.add(rect);
    canvas.bringObjectToFront(rect);

    // Rulers (CSS overlay) + guide creation
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "10";
    containerRef.current.appendChild(overlay);

    const makeRuler = (orientation: "top" | "left") => {
      const r = document.createElement("canvas");
      r.width = orientation === "top" ? W : 24;
      r.height = orientation === "top" ? 24 : H;
      r.style.position = "absolute";
      r.style.background = "#f7f7f7";
      r.style.boxShadow = "inset 0 -1px 0 rgba(0,0,0,0.08)";
      r.style.pointerEvents = "auto";
      r.style.cursor = "crosshair";
      r.style[orientation === "top" ? "top" : "left"] = "0px";
      r.style[orientation === "top" ? "left" : "top"] = "0px";
      if (orientation === "top") r.style.right = "0px";
      if (orientation === "left") r.style.bottom = "0px";
      overlay.appendChild(r);

      // Tick marks
      const ctx = r.getContext("2d")!;
      ctx.clearRect(0, 0, r.width, r.height);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      for (let i = 0; i <= (orientation === "top" ? W : H); i += 10) {
        const long = i % 50 === 0;
        ctx.beginPath();
        if (orientation === "top") {
          ctx.moveTo(i + 0.5, 24);
          ctx.lineTo(i + 0.5, long ? 8 : 14);
        } else {
          ctx.moveTo(24, i + 0.5);
          ctx.lineTo(long ? 8 : 14, i + 0.5);
        }
        ctx.stroke();
        if (long) {
          ctx.font = "10px system-ui";
          if (orientation === "top") ctx.fillText(String(i), i + 2, 10);
          else ctx.fillText(String(i), 2, i - 2);
        }
      }

      // Click to add a guide
      r.addEventListener("click", (e) => {
        const rectDom = r.getBoundingClientRect();
        if (orientation === "top") {
          const x = Math.round(e.clientX - rectDom.left);
          const guide = new Line([x, 0, x, H], { stroke: "rgba(0,0,255,0.5)", strokeWidth: 1, selectable: true, evented: true });
          (guide as any).guide = true;
          markUI(guide, "guide");
          canvas.add(guide);
          canvas.bringObjectToFront(guide);
        } else {
          const y = Math.round(e.clientY - rectDom.top);
          const guide = new Line([0, y, W, y], { stroke: "rgba(0,0,255,0.5)", strokeWidth: 1, selectable: true, evented: true });
          (guide as any).guide = true;
          markUI(guide, "guide");
          canvas.add(guide);
          canvas.bringObjectToFront(guide);
        }
        pushHistory();
      });
      return r;
    };

    let topR: HTMLCanvasElement | null = null;
    let leftR: HTMLCanvasElement | null = null;
    const ensureRulers = () => {
      if (!overlay) return;
      overlay.innerHTML = "";
      if (!showRulers) return;
      topR = makeRuler("top");
      leftR = makeRuler("left");
    };
    ensureRulers();

    // Snap to grid on move/scale
    const snapSize = 6;
    canvas.on("object:moving", (e) => {
      if (!snap || !e.target) return;
      const t = e.target;
      t.left = Math.round((t.left ?? 0) / snapSize) * snapSize;
      t.top  = Math.round((t.top ?? 0) / snapSize) * snapSize;
    });

    // Track layer list
    const refreshObjects = () => {
      setObjects(canvas.getObjects().filter(o => !(o as any).uiTag)); // hide UI from list
    };
    canvas.on("object:added", refreshObjects);
    canvas.on("object:removed", refreshObjects);
    canvas.on("object:modified", () => { refreshObjects(); pushHistory(); });

    // History
    const pushHistory = () => {
      const json = JSON.stringify(canvas.toJSON());
      setHistory(prev => {
        const next = prev.slice(0, histIndex + 1).concat(json);
        setHistIndex(next.length - 1);
        return next;
      });
    };
    // expose pushHistory to closure
    (window as any).__pushStudioHistory = pushHistory;
    pushHistory();

    // Resize handling
    const onResize = () => {
      const maxW2 = Math.min(1000, containerRef.current!.clientWidth);
      const maxH2 = Math.min(800, window.innerHeight - 220);
      const newW = Math.max(600, maxW2);
      const newH = Math.max(500, maxH2);
      canvas.setWidth(newW);
      canvas.setHeight(newH);
      canvas.renderAll();
      ensureRulers();
    };
    window.addEventListener("resize", onResize);

    // Keyboard shortcuts
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.key === "Backspace" || ev.key === "Delete") && canvas.getActiveObjects().length) {
        canvas.getActiveObjects().forEach(o => canvas.remove(o));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        pushHistory();
      }
      const meta = ev.ctrlKey || ev.metaKey;
      if (meta && ev.key.toLowerCase() === "z") {
        if (ev.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", onKey);

    // Cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      canvas.dispose();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  // Toggle grid/rulers live
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (showGrid) {
      FabricImage.fromURL(gridDataUrl).then((img) => {
        img.scaleToWidth(canvas.getWidth());
        img.scaleToHeight(canvas.getHeight());
        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    } else {
      canvas.backgroundImage = undefined;
      canvas.renderAll();
    }
  }, [showGrid, gridDataUrl]);

  // ------------- Actions -------------
  const addShape = (kind: Tool) => {
    const c = canvasRef.current!;
    const cx = c.getWidth() / 2, cy = c.getHeight() / 2;
    let obj: any = null;
    if (kind === "rect") {
      obj = new Rect({ left: cx - 60, top: cy - 40, width: 120, height: 80, fill, stroke, strokeWidth: strokeW, rx: 6, ry: 6 });
    } else if (kind === "circle") {
      obj = new Circle({ left: cx - 50, top: cy - 50, radius: 50, fill, stroke, strokeWidth: strokeW });
    } else if (kind === "triangle") {
      obj = new Triangle({ left: cx - 60, top: cy - 60, width: 120, height: 120, fill, stroke, strokeWidth: strokeW });
    }
    if (obj) {
      c.add(obj);
      c.setActiveObject(obj);
      c.requestRenderAll();
      (window as any).__pushStudioHistory?.();
    }
  };

  const startBrush = () => {
    const c = canvasRef.current!;
    c.isDrawingMode = true;
    c.freeDrawingBrush = new PencilBrush(c);
    c.freeDrawingBrush.color = fill;
    c.freeDrawingBrush.width = brushW;
  };

  const stopBrush = () => {
    const c = canvasRef.current!;
    c.isDrawingMode = false;
  };

  const addText = () => {
    const c = canvasRef.current!;
    const t = new IText("Your text", {
      left: c.getWidth() / 2 - 100,
      top: c.getHeight() / 2 - 20,
      fill,
      fontSize,
      fontFamily
    });
    c.add(t);
    c.setActiveObject(t);
    c.requestRenderAll();
    (window as any).__pushStudioHistory?.();
  };

  const uploadImage = async (file: File) => {
    const c = canvasRef.current!;
    const dataUrl = await new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
    FabricImage.fromURL(dataUrl).then((img) => {
      img.set({ left: c.getWidth() / 2 - img.width / 4, top: c.getHeight() / 2 - img.height / 4, scaleX: 0.5, scaleY: 0.5 });
      c.add(img);
      c.setActiveObject(img);
      c.requestRenderAll();
      (window as any).__pushStudioHistory?.();
    });
  };

  const clearGuides = () => {
    const c = canvasRef.current!;
    c.getObjects().filter(o => (o as any).uiTag === "guide").forEach(o => c.remove(o));
    c.requestRenderAll();
    (window as any).__pushStudioHistory?.();
  };

  const exportPNG = () => {
    const c = canvasRef.current!;
    // Hide UI & mockup for export
    const hidden: { obj: any; visible: boolean }[] = [];
    c.getObjects().forEach(o => {
      const t = (o as any).uiTag;
      if (t === "mockup" || t === "guide" || t === "printSafe") {
        hidden.push({ obj: o, visible: o.visible ?? true });
        o.visible = false;
      }
    });
    c.discardActiveObject();
    c.requestRenderAll();
    const data = c.toDataURL({ format: "png", multiplier: 1 });
    // restore
    hidden.forEach(h => (h.obj.visible = h.visible));
    c.requestRenderAll();
    downloadDataURL(`manana_design_${Date.now()}.png`, data);
  };

  const undo = () => {
    const c = canvasRef.current!;
    if (histIndex <= 0) return;
    const nextIndex = histIndex - 1;
    const json = history[nextIndex];
    c.loadFromJSON(json).then(() => {
      c.renderAll();
      setHistIndex(nextIndex);
      setObjects(c.getObjects().filter(o => !(o as any).uiTag));
    });
  };
  const redo = () => {
    const c = canvasRef.current!;
    if (histIndex >= history.length - 1) return;
    const nextIndex = histIndex + 1;
    const json = history[nextIndex];
    c.loadFromJSON(json).then(() => {
      c.renderAll();
      setHistIndex(nextIndex);
      setObjects(c.getObjects().filter(o => !(o as any).uiTag));
    });
  };

  // Tool switching
  useEffect(() => {
    const c = canvasRef.current!;
    if (!c) return;
    if (tool === "brush") startBrush(); else stopBrush();
  }, [tool, fill, brushW]);

  // Selected object property sync
  const applyPropsToActive = () => {
    const c = canvasRef.current!;
    const o = c.getActiveObject();
    if (!o) return;
    if ("set" in o) {
      if (o.type === "i-text" || o.type === "textbox" || o.type === "text") {
        (o as IText).set({ fill, fontSize, fontFamily });
      } else {
        (o as any).set({ fill, stroke, strokeWidth: strokeW });
      }
      c.requestRenderAll();
      (window as any).__pushStudioHistory?.();
    }
  };

  // ------------- UI -------------
  return (
    <div className="w-full min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-semibold text-lg">Manana Studio Pro</div>
          <div className="text-xs text-neutral-500">
            Size: <span className="font-medium">{sizeLabel}</span> | Safe: <span className="font-medium">{safeWmm}×{safeHmm} mm</span> @ {mmToPx.toFixed(3)} px/mm
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={undo} className="px-3 py-2 border rounded hover:bg-neutral-100">Undo</button>
          <button onClick={redo} className="px-3 py-2 border rounded hover:bg-neutral-100">Redo</button>
          <button onClick={exportPNG} className="px-3 py-2 border rounded bg-black text-white">Export PNG</button>
        </div>
      </header>

      {/* Main */}
      <div className="grid grid-cols-[64px_1fr_320px] gap-3 p-3">
        {/* Tools */}
        <aside className="bg-white border rounded-lg p-2 flex flex-col gap-2">
          {[
            { id: "select",  label: "Move/Select" },
            { id: "brush",   label: "Brush" },
            { id: "rect",    label: "Rect" },
            { id: "circle",  label: "Circle" },
            { id: "triangle",label: "Triangle" },
            { id: "text",    label: "Text" },
            { id: "image",   label: "Image" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === "rect" || t.id === "circle" || t.id === "triangle") addShape(t.id as Tool);
                else if (t.id === "text") addText();
                else if (t.id === "image") document.getElementById("fileUp")?.click();
                else setTool(t.id as Tool);
              }}
              className={
                "text-xs px-2 py-2 rounded border " +
                (tool === t.id ? "bg-black text-white border-black" : "hover:bg-neutral-100")
              }
              title={t.label}
            >
              {t.label}
            </button>
          ))}

          <input
            id="fileUp"
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files && uploadImage(e.target.files[0])}
          />

          <hr className="my-2"/>
          <button onClick={clearGuides} className="text-xs px-2 py-2 border rounded hover:bg-neutral-100">Clear Guides</button>
        </aside>

        {/* Canvas */}
        <section className="bg-white border rounded-lg relative overflow-hidden">
          <div ref={containerRef} className="relative w-full h-[calc(100vh-220px)] min-h-[520px]" />
        </section>

        {/* Properties / Layers */}
        <aside className="bg-white border rounded-lg p-3 flex flex-col gap-3">
          <div className="font-medium">Properties</div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">Fill
              <input type="color" value={fill} onChange={(e)=>setFill(e.target.value)} className="w-full h-9 p-0 bg-transparent border rounded" />
            </label>
            <label className="text-xs">Stroke
              <input type="color" value={stroke} onChange={(e)=>setStroke(e.target.value)} className="w-full h-9 p-0 bg-transparent border rounded" />
            </label>
            <label className="text-xs">Stroke W
              <input type="number" min={0} value={strokeW} onChange={(e)=>setStrokeW(parseInt(e.target.value||"0"))} className="w-full border rounded px-2 py-1" />
            </label>
            <label className="text-xs">Brush W
              <input type="number" min={1} value={brushW} onChange={(e)=>setBrushW(parseInt(e.target.value||"1"))} className="w-full border rounded px-2 py-1" />
            </label>
            <label className="text-xs col-span-2">Font Family
              <input type="text" value={fontFamily} onChange={(e)=>setFontFamily(e.target.value)} className="w-full border rounded px-2 py-1" />
            </label>
            <label className="text-xs">Font Size
              <input type="number" min={6} value={fontSize} onChange={(e)=>setFontSize(parseInt(e.target.value||"12"))} className="w-full border rounded px-2 py-1" />
            </label>
            <div className="flex items-end">
              <button onClick={applyPropsToActive} className="w-full px-3 py-2 border rounded hover:bg-neutral-100">Apply to Selection</button>
            </div>
          </div>

          <div className="border-t pt-3" />

          <div className="font-medium">Precision</div>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={showGrid} onChange={(e)=>setShowGrid(e.target.checked)} />
            Show Grid
          </label>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={snap} onChange={(e)=>setSnap(e.target.checked)} />
            Snap to Grid
          </label>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={showRulers} onChange={(e)=>setShowRulers(e.target.checked)} />
            Rulers & Click-to-add Guides
          </label>
          <div className="text-xs text-neutral-500">
            Safe area: {safeWmm}×{safeHmm} mm → {printAreaPx.w}×{printAreaPx.h} px
          </div>

          <div className="border-t pt-3" />

          <div className="font-medium">Layers</div>
          <div className="max-h-64 overflow-auto border rounded">
            {objects.length === 0 && <div className="p-2 text-xs text-neutral-500">No layers yet.</div>}
            {objects.map((o, idx) => (
              <div key={(o as any).id ?? idx} className="flex items-center justify-between px-2 py-1 border-b last:border-b-0">
                <div className="text-xs truncate">{o.type}</div>
                <div className="flex items-center gap-1">
                  <button className="text-[11px] px-2 py-1 border rounded" onClick={() => { o.visible = !o.visible; canvasRef.current!.requestRenderAll(); }}>👁️</button>
                  <button className="text-[11px] px-2 py-1 border rounded" onClick={() => { o.lockMovementX = o.lockMovementY = !(o.lockMovementX); o.hasControls = !o.hasControls; }}>🔒</button>
                  <button className="text-[11px] px-2 py-1 border rounded" onClick={() => { canvasRef.current!.bringObjectForward(o); canvasRef.current!.requestRenderAll(); }}>⬆️</button>
                  <button className="text-[11px] px-2 py-1 border rounded" onClick={() => { canvasRef.current!.sendObjectBackwards(o); canvasRef.current!.requestRenderAll(); }}>⬇️</button>
                  <button className="text-[11px] px-2 py-1 border rounded text-red-600" onClick={() => { canvasRef.current!.remove(o); }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <BottomTabs active="studio" />
    </div>
  );
};

export default StudioPro;