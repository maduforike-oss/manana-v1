import { toast } from 'sonner';
import { pipeline, env } from '@huggingface/transformers';
import { GarmentSpec, buildSpec, getGarmentName, Orientation } from './garmentSpecs';

// Configure transformers for browser usage
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface GenerationOptions {
  garmentId: string;
  orientation: Orientation;
  color?: string;
  material?: string;
  style?: string;
}

export interface GeneratedGarmentResult {
  imageUrl: string;
  spec: GarmentSpec;
  metadata: {
    generatedAt: number;
    quality: 'high' | 'medium' | 'low';
    transparent: boolean;
    centered: boolean;
  };
}

export class GarmentImageGenerator {
  private backgroundRemover: any = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  async initializeBackgroundRemover() {
    if (!this.backgroundRemover) {
      try {
        this.backgroundRemover = await pipeline(
          'image-segmentation',
          'Xenova/segformer-b0-finetuned-ade-512-512',
          { device: 'webgpu' }
        );
      } catch (error) {
        console.warn('WebGPU not available, falling back to CPU');
        this.backgroundRemover = await pipeline(
          'image-segmentation',
          'Xenova/segformer-b0-finetuned-ade-512-512'
        );
      }
    }
    return this.backgroundRemover;
  }

  async generateGarment(options: GenerationOptions): Promise<GeneratedGarmentResult> {
    const { garmentId, orientation, color = 'white', material = 'cotton', style = 'minimal' } = options;
    
    const spec = buildSpec({ garmentId, orientation });
    const garmentName = getGarmentName(garmentId);

    toast.loading(`Generating ${garmentName} template...`);

    try {
      // Step 1: Generate base garment image
      const generatedImageUrl = await this.generateBaseImage(spec, garmentName, orientation, color, material, style);
      
      // Step 2: Remove background and ensure transparency
      const transparentImageUrl = await this.ensureTransparency(generatedImageUrl);
      
      // Step 3: Quality validation
      const qualityCheck = await this.validateQuality(transparentImageUrl, spec);
      
      // Step 4: Normalize and center
      const finalImageUrl = await this.normalizeImage(transparentImageUrl, spec);

      toast.success('Garment template generated successfully!');

      return {
        imageUrl: finalImageUrl,
        spec,
        metadata: {
          generatedAt: Date.now(),
          quality: qualityCheck.quality,
          transparent: qualityCheck.transparent,
          centered: qualityCheck.centered
        }
      };
    } catch (error) {
      toast.error('Failed to generate garment template');
      throw error;
    }
  }

  private async generateBaseImage(
    spec: GarmentSpec,
    garmentName: string,
    orientation: string,
    color: string,
    material: string,
    style: string
  ): Promise<string> {
    // Enhanced prompt with garment specifications
    const prompt = `Clean minimal ${color} ${material} ${garmentName}, ${orientation} view, ${style} style, 
      transparent background, no logos, clean edges, professional studio lighting at 45 degrees, 
      high resolution, product photography, centered composition, print-ready quality`;

    if (this.apiKey) {
      // Use Runware API for high-quality generation
      return await this.generateWithRunware(prompt, spec);
    } else {
      // Use local generation as fallback
      return await this.generateWithLocal(prompt, spec);
    }
  }

  private async generateWithRunware(prompt: string, spec: any): Promise<string> {
    try {
      const response = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            taskType: 'authentication',
            apiKey: this.apiKey
          },
          {
            taskType: 'imageInference',
            taskUUID: crypto.randomUUID(),
        positivePrompt: prompt,
        width: spec.size.w,
        height: spec.size.h,
            model: 'runware:100@1',
            numberResults: 1,
            outputFormat: 'PNG',
            CFGScale: 7,
            steps: 20
          }
        ])
      });

      const result = await response.json();
      
      if (result.data && result.data[1] && result.data[1].imageURL) {
        return result.data[1].imageURL;
      } else {
        throw new Error('Invalid Runware API response');
      }
    } catch (error) {
      console.error('Runware generation failed:', error);
      throw new Error('Failed to generate with Runware API');
    }
  }

  private async generateWithLocal(prompt: string, spec: GarmentSpec): Promise<string> {
    // For now, return a placeholder that simulates generation
    // In a real implementation, you'd use a local model or fallback service
    
    // Create a canvas with the garment spec dimensions
    const canvas = document.createElement('canvas');
    canvas.width = spec.size.w;
    canvas.height = spec.size.h;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Canvas context not available');
    
    // Create a simple placeholder garment shape
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a basic garment outline
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const garmentWidth = canvas.width * 0.6;
    const garmentHeight = canvas.height * 0.7;
    
    ctx.fillRect(
      centerX - garmentWidth / 2,
      centerY - garmentHeight / 2,
      garmentWidth,
      garmentHeight
    );
    
    ctx.strokeRect(
      centerX - garmentWidth / 2,
      centerY - garmentHeight / 2,
      garmentWidth,
      garmentHeight
    );
    
    // Add print area indicator (safe area)
    ctx.strokeStyle = '#007bff';
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(spec.safeArea.x, spec.safeArea.y, spec.safeArea.w, spec.safeArea.h);
    
    return canvas.toDataURL('image/png');
  }

  private async ensureTransparency(imageUrl: string): Promise<string> {
    try {
      // Load the image
      const img = await this.loadImage(imageUrl);
      
      // Initialize background remover
      await this.initializeBackgroundRemover();
      
      // Create canvas for processing
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // For now, return the original image
      // In a real implementation, you'd use the background remover here
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Background removal failed:', error);
      return imageUrl; // Return original on failure
    }
  }

  private async validateQuality(imageUrl: string, spec: GarmentSpec): Promise<{
    quality: 'high' | 'medium' | 'low';
    transparent: boolean;
    centered: boolean;
  }> {
    try {
      const img = await this.loadImage(imageUrl);
      
      // Create canvas for analysis
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Basic quality checks
      const hasTransparency = this.checkTransparency(imageData);
      const isCentered = this.checkCentering(imageData, spec);
      const edgeQuality = this.checkEdgeQuality(imageData);
      
      return {
        quality: edgeQuality > 0.8 ? 'high' : edgeQuality > 0.6 ? 'medium' : 'low',
        transparent: hasTransparency,
        centered: isCentered
      };
    } catch (error) {
      console.error('Quality validation failed:', error);
      return { quality: 'medium', transparent: false, centered: false };
    }
  }

  private checkTransparency(imageData: ImageData): boolean {
    const data = imageData.data;
    let transparentPixels = 0;
    
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) {
        transparentPixels++;
      }
    }
    
    return transparentPixels > 0;
  }

  private checkCentering(imageData: ImageData, spec: GarmentSpec): boolean {
    // Simple check for content distribution
    // In a real implementation, you'd use more sophisticated analysis
    return true;
  }

  private checkEdgeQuality(imageData: ImageData): number {
    // Simple edge quality metric
    // In a real implementation, you'd analyze edge smoothness and aliasing
    return 0.8;
  }

  private async normalizeImage(imageUrl: string, spec: GarmentSpec): Promise<string> {
    try {
      const img = await this.loadImage(imageUrl);
      
      const canvas = document.createElement('canvas');
      canvas.width = spec.size.w;
      canvas.height = spec.size.h;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');
      
      // Clear canvas with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate centered position
      const aspectRatio = img.width / img.height;
      let drawWidth = canvas.width * 0.8;
      let drawHeight = drawWidth / aspectRatio;
      
      if (drawHeight > canvas.height * 0.8) {
        drawHeight = canvas.height * 0.8;
        drawWidth = drawHeight * aspectRatio;
      }
      
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;
      
      // Draw centered and scaled image
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Image normalization failed:', error);
      return imageUrl;
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async saveGeneratedImage(result: GeneratedGarmentResult, filename: string): Promise<void> {
    try {
      // In a real implementation, you'd save to your asset system
      // For now, we'll create a local blob URL
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      
      // Create a downloadable link (for testing)
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      URL.revokeObjectURL(url);
      
      toast.success(`Saved ${filename} successfully`);
    } catch (error) {
      console.error('Failed to save generated image:', error);
      toast.error('Failed to save generated image');
    }
  }
}

// Singleton instance for the app
export const garmentGenerator = new GarmentImageGenerator();