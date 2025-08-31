import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage, cutoutAndClean, putToStorage } from "@/lib/ai/garmentGen";
import { buildSpec } from "@/lib/studio/garmentSpecs";
import { normalizeStyle, STYLE_PROMPTS } from "@/lib/studio/stylePrompts";

export const runtime = "edge";

const HEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

const Input = z.object({
  garmentId: z.string().min(1),
  orientation: z.enum(["front","back","side"]),
  material: z.string().default("cotton"),
  colorHex: z.string().regex(HEX).default("#FFFFFF"),
  style: z.string().optional(),
  mode: z.enum(["auto","openai","mock"]).default("auto"),
});

export async function POST(req: NextRequest) {
  const raw = await req.json();
  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok:false, error:"invalid_input", issues: parsed.error.issues }, { status: 400 });
  }
  const { garmentId, orientation, material, colorHex, style, mode } = parsed.data;
  const spec = buildSpec({ garmentId, orientation });
  const styleKey = normalizeStyle(style);
  const stylePhrase = STYLE_PROMPTS[styleKey];

  try {
    const gen = await generateImage({ garmentId, orientation, material, colorHex, style, mode, spec });
    const { pngWithAlpha, diagnostics } = await cutoutAndClean(gen, spec);
    if (!pngWithAlpha) return NextResponse.json({ ok:false, error: "Generation failed" }, { status: 400 });

    const filename = `${garmentId}-${orientation}.png`;
    await putToStorage(pngWithAlpha, `public/assets/custom/${filename}`);

    return NextResponse.json({
      ok: true,
      filename,
      // previewDataUrl lets client swap image instantly in Lovable preview
      previewDataUrl: `data:image/png;base64,${pngWithAlpha}`,
      diagnostics,
    });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}