export type ViewName = "front" | "back" | "left" | "right";
export type GarmentSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";
export type PrintMethod = "DTG" | "Screen" | "Vinyl";

export interface MethodRules {
  DTG: {
    minLineWidthMm: number;
    allowGradients: boolean;
  };
  Screen: {
    maxSpotColors: number;
    allowGradients: boolean;
    setupFee: number;
    colorFee: number;
  };
  Vinyl: {
    solidsOnly: boolean;
    minCurveRadius: number;
    minTextSizeMm: number;
  };
}

export interface SafeArea {
  wPx: number;
  hPx: number;
  poly?: [number, number][];
}

export interface QuoteInput {
  garmentType: string;
  size: GarmentSize;
  quantity: number;
  fabric: "standard" | "premium";
  placements: {
    view: ViewName;
    method: PrintMethod;
    colors: number;
  }[];
  rush: boolean;
  rushDays?: number;
  region: "UK" | "EU" | "US";
}

export interface QuoteOutput {
  basePrice: number;
  placementFees: number;
  screenFees: number;
  vinylFees: number;
  rushUpcharge: number;
  sizeUpcharge: number;
  subtotal: number;
  shipping: number;
  vat: number;
  total: number;
  unitPrice: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

export interface StudioGarment {
  slug: string;
  color: string;
  view: ViewName;
  size: GarmentSize;
  mmToPx: number;
}

export interface StudioNode {
  id: string;
  type: "text" | "image" | "shape" | "path";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
  hidden?: boolean;
  name: string;
  [key: string]: any;
}

export interface StudioState {
  garment: StudioGarment;
  safe: SafeArea;
  nodes: StudioNode[];
  selectedIds: string[];
  grid: {
    enabled: boolean;
    step: number;
    snap: boolean;
  };
  guides: {
    x: number[];
    y: number[];
  };
  history: string[];
  histIndex: number;
  
  // Actions
  loadGarment: (garment: Partial<StudioGarment>) => void;
  setNodes: (nodes: StudioNode[]) => void;
  addNode: (node: StudioNode) => void;
  updateNode: (id: string, updates: Partial<StudioNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string) => void;
  selectNodes: (ids: string[]) => void;
  clearSelection: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  setGrid: (grid: Partial<StudioState['grid']>) => void;
  addGuide: (axis: 'x' | 'y', position: number) => void;
  removeGuide: (axis: 'x' | 'y', position: number) => void;
}