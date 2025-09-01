import { generateGarmentImage } from '@/lib/garmentGeneration';

export interface GenerateGarmentRequest {
  garmentId: string;
  orientation: 'front' | 'back' | 'side';
  material?: string;
  colorHex?: string;
  style?: string;
  mode?: 'mock' | 'openai' | 'auto';
}

export interface GenerateGarmentResponse {
  ok: boolean;
  filename?: string;
  previewDataUrl?: string;
  diagnostics?: any;
  error?: string;
}

export async function generateGarmentAPI(request: GenerateGarmentRequest): Promise<GenerateGarmentResponse> {
  try {
    // Build a descriptive prompt for the garment
    const { garmentId, orientation, material, colorHex, style } = request;
    
    const materialText = material ? ` made of ${material}` : '';
    const colorText = colorHex ? ` in ${colorHex} color` : '';
    const styleText = style ? ` with ${style} style` : '';
    
    const prompt = `A clean, professional ${garmentId} garment ${orientation} view${materialText}${colorText}${styleText}, isolated on transparent background, high quality product photography style`;

    // Use the client-side generator
    const result = await generateGarmentImage({
      prompt,
      size: "1024x1024",
      transparent: true
    });

    return {
      ok: true,
      previewDataUrl: result.url,
      filename: `${garmentId}-${orientation}-generated.png`,
      diagnostics: {
        prompt,
        timestamp: new Date().toISOString(),
        mode: request.mode || 'auto'
      }
    };
  } catch (error) {
    console.error('Garment generation API error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}