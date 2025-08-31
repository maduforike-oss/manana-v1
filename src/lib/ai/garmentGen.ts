import OpenAI from "openai";
import { GarmentSpec, buildSpec } from "@/lib/studio/garmentSpecs";

export type GenMode = "auto" | "openai" | "mock";

export async function generateImage(opts: {
  garmentId: string;
  orientation: "front" | "back" | "side";
  material?: string;
  colorHex?: string;
  mode?: GenMode;
  spec: GarmentSpec;
}) {
  const mode: GenMode = opts.mode ?? "auto";
  const hasOpenAI = !!getOpenAIKey();

  if (mode === "mock" || (!hasOpenAI && mode !== "openai")) {
    // Return a simple solid-shape garment silhouette to prove the pipeline.
    const dataUrl = fakePng(opts.spec.size.w, opts.spec.size.h, opts.colorHex ?? "#f5f5f5");
    return { 
      pngBase64: dataUrl.split(",")[1], 
      mime: "image/png", 
      previewDataUrl: dataUrl, 
      diagnostics: { mode: "mock" } 
    };
  }

  // --- OpenAI images path (transparent PNG) ---
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured on server. Please add OPENAI_API_KEY environment variable.");
  }

  const openai = new OpenAI({ apiKey });
  const sys = "You render apparel product images on transparent background; single garment, centered, requested angle.";
  const user =
    `Generate a ${opts.garmentId} (${opts.orientation}) on TRANSPARENT background, studio lighting, ` +
    `material ${opts.material ?? "cotton"}, color ${opts.colorHex ?? "#ffffff"}, canvas ${opts.spec.size.w}x${opts.spec.size.h}.`;
  const prompt = `${sys}\n${user}`;

  // Using DALL-E 3 for high-quality garment generation
  const r = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024", // DALL-E 3 supported size
    quality: "hd",
    response_format: "b64_json",
  });

  const b64 = r.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI Images returned no data");
  return { 
    pngBase64: b64, 
    mime: "image/png", 
    previewDataUrl: `data:image/png;base64,${b64}`, 
    diagnostics: { mode: "openai" } 
  };
}

export async function cutoutAndClean(
  gen: { pngBase64: string; mime: string; previewDataUrl: string; diagnostics: any },
  spec: GarmentSpec
) {
  // Stub passthrough—real build would run matting/QA here.
  return { 
    pngWithAlpha: gen.pngBase64, 
    diagnostics: { ...gen.diagnostics, cutout: "passthrough" } 
  };
}

// For demos: draw a rounded hoodie-like silhouette to a data URL
function fakePng(w: number, h: number, fill: string) {
  const canvas = globalThis?.document?.createElement?.("canvas");
  if (!canvas) {
    // SSR fallback: a tiny 1x1 transparent png
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABm8sW9QAAAABJRU5ErkJggg==";
  }
  canvas.width = w; 
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = fill;
  
  // body
  ctx.beginPath();
  ctx.moveTo(w*0.2,h*0.8); 
  ctx.lineTo(w*0.8,h*0.8); 
  ctx.quadraticCurveTo(w*0.9,h*0.6,w*0.7,h*0.4);
  ctx.quadraticCurveTo(w*0.6,h*0.2,w*0.5,h*0.2); 
  ctx.quadraticCurveTo(w*0.4,h*0.2,w*0.3,h*0.4);
  ctx.quadraticCurveTo(w*0.1,h*0.6,w*0.2,h*0.8); 
  ctx.closePath(); 
  ctx.fill();
  
  // hood hint
  ctx.beginPath();
  ctx.ellipse(w*0.5,h*0.27,w*0.12,h*0.16,0,0,Math.PI*2);
  ctx.fillStyle = shade(fill, -12); 
  ctx.fill();
  
  return canvas.toDataURL("image/png");
}

function shade(hex: string, amt: number) {
  const c = hex.replace("#",""); 
  const n = parseInt(c,16);
  const r = Math.max(0, Math.min(255, (n>>16)+amt));
  const g = Math.max(0, Math.min(255, ((n>>8)&0xff)+amt));
  const b = Math.max(0, Math.min(255, (n&0xff)+amt));
  return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}

export async function putToStorage(_pngBase64: string, _path: string) {
  // In Lovable/Vercel serverless you can't write to /public at runtime.
  // Return a no-op and let the client use data URL (works in preview).
  return { ok: true, stored: false };
}

// Helper function to get OpenAI API key from environment (server-side)
function getOpenAIKey(): string | null {
  // Server-side: use environment variable
  if (typeof window === 'undefined') {
    return process.env.OPENAI_API_KEY || null;
  }
  // Client-side: use localStorage as fallback
  return localStorage.getItem('openai_api_key');
}

// Helper function to set OpenAI API key in localStorage (client-side only)
export function setOpenAIKey(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('openai_api_key', key);
}

// Helper function to check if OpenAI key is configured
export function hasOpenAIKey(): boolean {
  return !!getOpenAIKey();
}