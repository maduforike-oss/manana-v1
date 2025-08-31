export interface GarmentSpec {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  dpi: number;
  printAreas: {
    front?: PrintArea;
    back?: PrintArea;
  };
  basePrompt: string;
  lighting: {
    angle: number;
    intensity: number;
    style: string;
  };
  pose: {
    angle: number;
    position: string;
  };
}

export interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
  safeMargin: number;
}

export const GARMENT_SPECS: Record<string, GarmentSpec> = {
  'tshirt': {
    id: 'tshirt',
    name: 'T-Shirt',
    canvasWidth: 2048,
    canvasHeight: 2048,
    dpi: 300,
    printAreas: {
      front: {
        x: 760,
        y: 600,
        width: 528,
        height: 600,
        maxWidth: 600,
        maxHeight: 700,
        safeMargin: 36
      },
      back: {
        x: 760,
        y: 500,
        width: 528,
        height: 700,
        maxWidth: 600,
        maxHeight: 800,
        safeMargin: 36
      }
    },
    basePrompt: "Clean minimal t-shirt on invisible mannequin, studio lighting, professional product photography",
    lighting: {
      angle: 45,
      intensity: 0.8,
      style: "studio"
    },
    pose: {
      angle: 0,
      position: "centered"
    }
  },
  'hoodie': {
    id: 'hoodie',
    name: 'Hoodie',
    canvasWidth: 2048,
    canvasHeight: 2048,
    dpi: 300,
    printAreas: {
      front: {
        x: 760,
        y: 700,
        width: 480,
        height: 550,
        maxWidth: 550,
        maxHeight: 650,
        safeMargin: 40
      }
    },
    basePrompt: "Clean minimal hoodie on invisible mannequin, studio lighting, professional product photography",
    lighting: {
      angle: 45,
      intensity: 0.8,
      style: "studio"
    },
    pose: {
      angle: 0,
      position: "centered"
    }
  },
  'crewneck': {
    id: 'crewneck',
    name: 'Crewneck',
    canvasWidth: 2048,
    canvasHeight: 2048,
    dpi: 300,
    printAreas: {
      front: {
        x: 760,
        y: 650,
        width: 500,
        height: 580,
        maxWidth: 580,
        maxHeight: 680,
        safeMargin: 38
      }
    },
    basePrompt: "Clean minimal crewneck sweatshirt on invisible mannequin, studio lighting, professional product photography",
    lighting: {
      angle: 45,
      intensity: 0.8,
      style: "studio"
    },
    pose: {
      angle: 0,
      position: "centered"
    }
  },
  'polo': {
    id: 'polo',
    name: 'Polo',
    canvasWidth: 2048,
    canvasHeight: 2048,
    dpi: 300,
    printAreas: {
      front: {
        x: 760,
        y: 600,
        width: 480,
        height: 550,
        maxWidth: 550,
        maxHeight: 650,
        safeMargin: 35
      }
    },
    basePrompt: "Clean minimal polo shirt on invisible mannequin, studio lighting, professional product photography",
    lighting: {
      angle: 45,
      intensity: 0.8,
      style: "studio"
    },
    pose: {
      angle: 0,
      position: "centered"
    }
  },
  'longsleeve': {
    id: 'longsleeve',
    name: 'Long Sleeve',
    canvasWidth: 2048,
    canvasHeight: 2048,
    dpi: 300,
    printAreas: {
      front: {
        x: 760,
        y: 600,
        width: 528,
        height: 600,
        maxWidth: 600,
        maxHeight: 700,
        safeMargin: 36
      }
    },
    basePrompt: "Clean minimal long sleeve shirt on invisible mannequin, studio lighting, professional product photography",
    lighting: {
      angle: 45,
      intensity: 0.8,
      style: "studio"
    },
    pose: {
      angle: 0,
      position: "centered"
    }
  }
};

export const getGarmentSpec = (garmentId: string): GarmentSpec | null => {
  return GARMENT_SPECS[garmentId] || null;
};

export const getPrintArea = (garmentId: string, orientation: 'front' | 'back'): PrintArea | null => {
  const spec = getGarmentSpec(garmentId);
  return spec?.printAreas[orientation] || null;
};

export const getCanvasSize = (garmentId: string): { width: number; height: number } => {
  const spec = getGarmentSpec(garmentId);
  return {
    width: spec?.canvasWidth || 2048,
    height: spec?.canvasHeight || 2048
  };
};