import { DesignDoc } from './types';

export interface ExportOptions {
  format?: 'png' | 'svg' | 'pdf' | 'print-ready';
  transparent?: boolean;
  dpi?: 150 | 300;
  includeBleed?: boolean;
  filename?: string;
  separateSurfaces?: boolean;
  printReady?: boolean;
  colorProfile?: 'RGB' | 'CMYK';
}

export const exportPNG = async (
  canvas: HTMLCanvasElement, 
  doc: DesignDoc, 
  options: ExportOptions = { format: 'png' }
): Promise<void> => {
  const {
    transparent = false,
    dpi = 300,
    includeBleed = false,
    filename = `${doc.title}-${Date.now()}`
  } = options;

  // Calculate scale based on DPI
  const scale = dpi / 96; // 96 is default screen DPI
  
  // Create a new canvas for export
  const exportCanvas = document.createElement('canvas');
  const ctx = exportCanvas.getContext('2d')!;
  
  let width = doc.canvas.width;
  let height = doc.canvas.height;
  
  if (includeBleed) {
    const bleedPx = (doc.canvas.bleedMm * doc.canvas.dpi) / 25.4; // mm to px
    width += bleedPx * 2;
    height += bleedPx * 2;
  }
  
  exportCanvas.width = width * scale;
  exportCanvas.height = height * scale;
  
  // Set background
  if (!transparent) {
    ctx.fillStyle = doc.canvas.background === 'transparent' ? '#ffffff' : doc.canvas.background;
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  }
  
  // Scale and draw the original canvas
  ctx.scale(scale, scale);
  if (includeBleed) {
    const bleedPx = (doc.canvas.bleedMm * doc.canvas.dpi) / 25.4;
    ctx.translate(bleedPx, bleedPx);
  }
  
  ctx.drawImage(canvas, 0, 0);
  
  // Download
  exportCanvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `${filename}.png`);
    }
  }, 'image/png');
};

export const exportSVG = (doc: DesignDoc, options: ExportOptions = { format: 'svg' }): void => {
  const { filename = `${doc.title}-${Date.now()}` } = options;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', doc.canvas.width.toString());
  svg.setAttribute('height', doc.canvas.height.toString());
  svg.setAttribute('viewBox', `0 0 ${doc.canvas.width} ${doc.canvas.height}`);
  
  // Add background
  if (doc.canvas.background && doc.canvas.background !== 'transparent') {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', doc.canvas.background);
    svg.appendChild(rect);
  }
  
  // Convert nodes to SVG elements
  doc.nodes.forEach(node => {
    if (node.hidden) return;
    
    let element: SVGElement;
    
    switch (node.type) {
      case 'text':
        element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        element.setAttribute('x', node.x.toString());
        element.setAttribute('y', (node.y + node.fontSize).toString());
        element.setAttribute('font-family', node.fontFamily);
        element.setAttribute('font-size', node.fontSize.toString());
        element.setAttribute('font-weight', node.fontWeight.toString());
        element.setAttribute('text-anchor', node.align === 'center' ? 'middle' : node.align === 'right' ? 'end' : 'start');
        element.setAttribute('fill', node.fill.color || '#000000');
        element.setAttribute('opacity', node.opacity.toString());
        element.textContent = node.text;
        break;
        
      case 'shape':
        if (node.shape === 'rect') {
          element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          element.setAttribute('x', node.x.toString());
          element.setAttribute('y', node.y.toString());
          element.setAttribute('width', node.width.toString());
          element.setAttribute('height', node.height.toString());
          if (node.radius) {
            element.setAttribute('rx', node.radius.toString());
          }
        } else if (node.shape === 'circle') {
          element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          element.setAttribute('cx', (node.x + node.width / 2).toString());
          element.setAttribute('cy', (node.y + node.height / 2).toString());
          element.setAttribute('r', (node.width / 2).toString());
        } else {
          // Fallback for other shapes
          element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          element.setAttribute('x', node.x.toString());
          element.setAttribute('y', node.y.toString());
          element.setAttribute('width', node.width.toString());
          element.setAttribute('height', node.height.toString());
        }
        
        element.setAttribute('fill', node.fill.color || '#000000');
        element.setAttribute('opacity', node.opacity.toString());
        
        if (node.stroke) {
          element.setAttribute('stroke', node.stroke.color);
          element.setAttribute('stroke-width', node.stroke.width.toString());
        }
        break;
        
      default:
        return; // Skip unsupported node types
    }
    
    // Apply transform
    if (node.rotation !== 0) {
      const centerX = node.x + node.width / 2;
      const centerY = node.y + node.height / 2;
      element.setAttribute('transform', `rotate(${node.rotation} ${centerX} ${centerY})`);
    }
    
    svg.appendChild(element);
  });
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  downloadBlob(blob, `${filename}.svg`);
};

export const exportPrintReady = async (
  canvas: HTMLCanvasElement, 
  doc: DesignDoc, 
  options: ExportOptions = { format: 'print-ready' }
): Promise<void> => {
  const {
    dpi = 300,
    includeBleed = true,
    separateSurfaces = false,
    filename = `${doc.title}-print-ready`
  } = options;

  if (separateSurfaces && doc.canvas.printSurfaces) {
    // Export each surface separately
    for (const surface of doc.canvas.printSurfaces) {
      if (!surface.enabled) continue;
      
      const surfaceDoc = {
        ...doc,
        nodes: doc.nodes.filter(node => node.surfaceId === surface.id)
      };
      
      await exportPNG(canvas, surfaceDoc, {
        ...options,
        filename: `${filename}-${surface.name}`,
        dpi,
        includeBleed
      });
    }
  } else {
    // Export combined design
    await exportPNG(canvas, doc, {
      ...options,
      filename: `${filename}-combined`,
      dpi,
      includeBleed
    });
  }

  // Generate print specifications
  generatePrintSpecs(doc, filename);
};

const generatePrintSpecs = (doc: DesignDoc, filename: string): void => {
  const surfaces = doc.canvas.printSurfaces || [];
  const activeSurfaces = surfaces.filter(s => s.enabled);
  
  // Calculate colors used
  const allColors = new Set<string>();
  activeSurfaces.forEach(surface => {
    const surfaceNodes = doc.nodes.filter(node => node.surfaceId === surface.id);
    surfaceNodes.forEach(node => {
      if (node.type === 'text' && node.fill?.color) allColors.add(node.fill.color);
      if (node.type === 'shape' && node.fill?.color) allColors.add(node.fill.color);
    });
  });

  const specs = {
    designTitle: doc.title,
    garmentType: doc.canvas.garmentType,
    garmentColor: doc.canvas.garmentColor,
    canvasDimensions: `${doc.canvas.width}×${doc.canvas.height}px`,
    resolution: `${doc.canvas.dpi} DPI`,
    bleedArea: `${doc.canvas.bleedMm}mm`,
    printSurfaces: activeSurfaces.map(surface => ({
      name: surface.name,
      area: `${surface.area.width}×${surface.area.height}px`,
      elements: doc.nodes.filter(node => node.surfaceId === surface.id).length
    })),
    colorCount: allColors.size,
    colorsUsed: Array.from(allColors),
    printRecommendations: generatePrintRecommendations(doc, activeSurfaces, allColors.size),
    generatedAt: new Date().toISOString()
  };

  const specsBlob = new Blob([JSON.stringify(specs, null, 2)], { 
    type: 'application/json' 
  });
  downloadBlob(specsBlob, `${filename}-specifications.json`);
};

const generatePrintRecommendations = (
  doc: DesignDoc, 
  surfaces: any[], 
  colorCount: number
): string[] => {
  const recommendations: string[] = [];
  
  if (colorCount <= 3) {
    recommendations.push("Screen printing recommended for cost-effectiveness");
  } else if (colorCount <= 6) {
    recommendations.push("DTG printing recommended for multiple colors");
  } else {
    recommendations.push("Consider reducing colors or using DTG/sublimation");
  }
  
  if (surfaces.length > 2) {
    recommendations.push("Multi-surface design requires careful registration");
  }
  
  const hasSmallText = doc.nodes.some(node => 
    node.type === 'text' && node.fontSize < 12
  );
  
  if (hasSmallText) {
    recommendations.push("Verify small text legibility at production size");
  }
  
  return recommendations;
};

export const exportPDF = (doc: DesignDoc, options: ExportOptions = { format: 'pdf' }): void => {
  // TODO: Implement PDF export using jsPDF
  // This is a placeholder for future implementation
  console.log('PDF export not yet implemented');
  alert('PDF export coming soon!');
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};