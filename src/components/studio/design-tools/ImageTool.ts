import { Image } from 'lucide-react';
import { BaseDesignTool, ToolConfig } from './types';
import { useStudioStore } from '@/lib/studio/store';
import { ImageNode } from '@/lib/studio/types';
import { generateId } from '@/lib/utils';

export interface ImageSettings {
  opacity: number;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

export class ImageTool extends BaseDesignTool {
  readonly config: ToolConfig = {
    id: 'image',
    name: 'Add Image',
    icon: Image,
    shortcut: 'I',
    description: 'Upload and add images',
    cursor: 'default',
    preventPanning: false
  };

  constructor(initialSettings: Partial<ImageSettings> = {}) {
    const defaultSettings: ImageSettings = {
      opacity: 1,
      filters: {
        brightness: 1,
        contrast: 1,
        saturation: 1
      },
      ...initialSettings
    };

    super(defaultSettings);
  }

  activate(): void {
    console.log('Image tool activated');
    // Immediately trigger file dialog when tool is activated
    this.openFileDialog();
  }

  deactivate(): void {
    console.log('Image tool deactivated');
  }

  private openFileDialog(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handleImageFile(file);
      }
      
      // Switch back to select tool after handling file
      const { toolManager } = require('./ToolManager');
      toolManager.activateTool('select');
    };

    input.oncancel = () => {
      // Switch back to select tool if dialog is cancelled
      const { toolManager } = require('./ToolManager');
      toolManager.activateTool('select');
    };

    input.click();
  }

  private handleImageFile(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imageSrc = event.target?.result as string;
      if (imageSrc) {
        this.createImageNode(imageSrc);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading image file:', error);
    };

    reader.readAsDataURL(file);
  }

  private createImageNode(src: string): void {
    const store = useStudioStore.getState();
    const settings = this.getSettings() as ImageSettings;

    // Create a temporary image to get dimensions
    const img = new window.Image();
    img.onload = () => {
      const maxWidth = 400;
      const maxHeight = 400;
      
      let { width, height } = img;
      
      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width *= scale;
        height *= scale;
      }

      const imageNode: ImageNode = {
        id: generateId(),
        type: 'image',
        name: 'Image Layer',
        x: (store.doc.canvas.width - width) / 2,
        y: (store.doc.canvas.height - height) / 2,
        width,
        height,
        rotation: 0,
        opacity: settings.opacity,
        src,
        filters: settings.filters
      };

      store.addNode(imageNode);
      store.selectNode(imageNode.id);
      store.saveSnapshot();
    };

    img.src = src;
  }

  renderSettings(): React.ReactNode {
    // This will be implemented when we create the unified image properties panel
    return null;
  }
}