// Web Worker for high-resolution PNG export
// This handles the heavy lifting of rendering designs at 300 DPI

interface ExportMessage {
  type: 'export';
  designJson: string;
  width: number;
  height: number;
  dpi: number;
}

interface ExportResponse {
  type: 'complete' | 'error';
  dataUrl?: string;
  error?: string;
}

self.onmessage = function(e: MessageEvent<ExportMessage>) {
  const { type, designJson, width, height, dpi } = e.data;
  
  if (type !== 'export') return;
  
  try {
    // Parse the design
    const design = JSON.parse(designJson);
    
    // Create high-resolution canvas
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Set high-resolution scaling
    const scale = dpi / 96; // 96 DPI is standard screen resolution
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, width, height);
    
    // Render each design node
    design.nodes?.forEach((node: any) => {
      if (node.hidden) return;
      
      ctx.save();
      ctx.globalAlpha = node.opacity || 1;
      
      // Apply transforms
      if (node.rotation) {
        ctx.translate(node.x + node.width / 2, node.y + node.height / 2);
        ctx.rotate((node.rotation * Math.PI) / 180);
        ctx.translate(-node.width / 2, -node.height / 2);
      } else {
        ctx.translate(node.x, node.y);
      }
      
      switch (node.type) {
        case 'rect':
          if (node.fill) {
            ctx.fillStyle = node.fill;
            ctx.fillRect(0, 0, node.width, node.height);
          }
          if (node.stroke && node.strokeWidth > 0) {
            ctx.strokeStyle = node.stroke;
            ctx.lineWidth = node.strokeWidth;
            ctx.strokeRect(0, 0, node.width, node.height);
          }
          break;
          
        case 'circle':
          ctx.beginPath();
          ctx.arc(node.width / 2, node.height / 2, node.width / 2, 0, Math.PI * 2);
          if (node.fill) {
            ctx.fillStyle = node.fill;
            ctx.fill();
          }
          if (node.stroke && node.strokeWidth > 0) {
            ctx.strokeStyle = node.stroke;
            ctx.lineWidth = node.strokeWidth;
            ctx.stroke();
          }
          break;
          
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(node.width / 2, 0);
          ctx.lineTo(0, node.height);
          ctx.lineTo(node.width, node.height);
          ctx.closePath();
          if (node.fill) {
            ctx.fillStyle = node.fill;
            ctx.fill();
          }
          if (node.stroke && node.strokeWidth > 0) {
            ctx.strokeStyle = node.stroke;
            ctx.lineWidth = node.strokeWidth;
            ctx.stroke();
          }
          break;
          
        case 'text':
          if (node.fill) {
            ctx.fillStyle = node.fill;
            const fontSize = (node.fontSize || 24);
            ctx.font = `${fontSize}px ${node.fontFamily || 'Arial'}`;
            
            // Apply text styling
            if (node.letterSpacing) {
              // Letter spacing requires manual character rendering
              const text = node.text || 'Text';
              let x = 0;
              for (let i = 0; i < text.length; i++) {
                ctx.fillText(text[i], x, fontSize);
                x += ctx.measureText(text[i]).width + node.letterSpacing;
              }
            } else {
              ctx.fillText(node.text || 'Text', 0, node.fontSize || 24);
            }
            
            // Text stroke
            if (node.textStroke && node.textStroke.width > 0) {
              ctx.strokeStyle = node.textStroke.color;
              ctx.lineWidth = node.textStroke.width;
              ctx.strokeText(node.text || 'Text', 0, node.fontSize || 24);
            }
          }
          break;
          
        case 'image':
          // Note: Image loading in worker is limited
          // In a real implementation, you'd need to pass image data
          break;
      }
      
      ctx.restore();
    });
    
    // Convert to blob and then to data URL
    canvas.convertToBlob({ type: 'image/png' }).then(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        const response: ExportResponse = {
          type: 'complete',
          dataUrl: reader.result as string
        };
        self.postMessage(response);
      };
      reader.readAsDataURL(blob);
    });
    
  } catch (error) {
    const response: ExportResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown export error'
    };
    self.postMessage(response);
  }
};

// Make TypeScript happy with the worker scope
export {};