// src/lib/garmentGeneration.ts
// Drop-in client-side generator for Vite projects (no Next.js API needed)
// Usage:
//   import { generateGarmentImage } from "@/lib/garmentGeneration";
//   const { url } = await generateGarmentImage({ prompt: "minimal line-art logo for a white tee", size: "1024x1024", transparent: true });
//
// Notes:
// - Set your key once in dev with: localStorage.setItem("OPENAI_API_KEY", "<sk-...>")
//   or via .env: VITE_OPENAI_API_KEY=sk-... (will be exposed to the client; fine for local/dev)
// - Automatically falls back to a mock transparent PNG when no key is present.

export type ImageSize = "512x512" | "768x768" | "1024x1024";

export interface GenerateGarmentOptions {
  prompt: string;
  size?: ImageSize;
  transparent?: boolean;
  referenceImageUrl?: string; // optional image-to-image
}

export interface GenerateGarmentResult {
  url: string; // data URL or remote URL
}

function mockTransparentPng(width = 1024, height = 1024, text = "Mock Image") {
  const c = document.createElement("canvas");
  c.width = width; c.height = height;
  const ctx = c.getContext("2d")!;
  // Transparent background
  // Light guide (center cross) so designers see something
  ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, height/2); ctx.lineTo(width, height/2); ctx.stroke();
  // Label
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.font = "24px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, width/2, height/2 - 12);
  ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.fillText("No API key detected — using mock", width/2, height/2 + 16);
  return c.toDataURL("image/png");
}

function sizeToWH(size: ImageSize) {
  const [w, h] = size.split("x").map(n => parseInt(n, 10));
  return { w: Number.isFinite(w) ? w : 1024, h: Number.isFinite(h) ? h : 1024 };
}

export async function generateGarmentImage(opts: GenerateGarmentOptions): Promise<GenerateGarmentResult> {
  const {
    prompt,
    size = "1024x1024",
    transparent = true,
    referenceImageUrl
  } = opts;

  const apiKey =
    (typeof window !== "undefined" && localStorage.getItem("OPENAI_API_KEY")) ||
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_OPENAI_API_KEY) ||
    "";

  if (!apiKey) {
    const { w, h } = sizeToWH(size);
    return { url: mockTransparentPng(w, h, "Mock Garment Artwork") };
  }

  const endpoint = referenceImageUrl
    ? "https://api.openai.com/v1/images/edits"
    : "https://api.openai.com/v1/images/generations";

  // Build body (OpenAI Images supports 'background: "transparent"' on gpt-image-1)
  const body: Record<string, any> = {
    model: "gpt-image-1",
    size,
    n: 1
  };

  if (transparent) body.background = "transparent";

  if (referenceImageUrl) {
    // Image-to-image/edits
    body.image = referenceImageUrl;
    body.prompt = prompt;
  } else {
    // Text-to-image
    body.prompt = prompt;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    // Preserve debuggable error content for your console
    const errText = await res.text().catch(() => "");
    // Graceful fallback to mock so the Studio keeps working
    console.warn(`OpenAI error ${res.status}: ${errText}`);
    const { w, h } = sizeToWH(size);
    return { url: mockTransparentPng(w, h, `OpenAI ${res.status}`) };
  }

  // Handle either {url} or {b64_json}
  const data = await res.json();
  const first = data?.data?.[0];
  const url: string | undefined =
    first?.url ||
    (first?.b64_json ? `data:image/png;base64,${first.b64_json}` : undefined);

  if (!url) {
    const { w, h } = sizeToWH(size);
    return { url: mockTransparentPng(w, h, "Empty Response") };
  }

  return { url };
}

// Optional helper to set the key at runtime from a quick settings screen
export function setOpenAIKeyInBrowser(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("OPENAI_API_KEY", key);
  }
}

export default generateGarmentImage;
