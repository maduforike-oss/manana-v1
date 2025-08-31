import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage, cutoutAndClean, putToStorage } from "@/lib/ai/garmentGen";
import { buildSpec } from "@/lib/studio/garmentSpecs";

export const runtime = "edge";

const Input = z.object({
  garmentId: z.string(),
  orientation: z.enum(["front","back","side"]),
  material: z.string().optional(),
  colorHex: z.string().default("#FFFFFF"),
  mode: z.enum(["auto","openai","mock"]).default("auto"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { garmentId, orientation, material, colorHex, mode } = Input.parse(body);
  const spec = buildSpec({ garmentId, orientation });

  try {
    const gen = await generateImage({ garmentId, orientation, material, colorHex, mode, spec });
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