import { GenMode } from '@/lib/ai/garmentGen';
import { Orientation } from '@/lib/studio/garmentSpecs';

export interface GenerateGarmentRequest {
  garmentId: string;
  orientation: Orientation;
  material?: string;
  colorHex?: string;
  mode?: GenMode;
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
    const response = await fetch('/api/generate-garment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Generation failed');
    }

    return data;
  } catch (error) {
    console.error('Garment generation API error:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}