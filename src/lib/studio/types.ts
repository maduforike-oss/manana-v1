export type Vec2 = { x: number; y: number };

export type Fill = {
  type: "solid" | "linear";
  color?: string;
  from?: Vec2;
  to?: Vec2;
  stops?: { offset: number; color: string }[];
};

export type BaseNode = {
  id: string;
  type: "text" | "image" | "shape" | "path";
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
  hidden?: boolean;
  selected?: boolean;
  surfaceId?: string; // Which print surface this node belongs to
  colorCount?: number; // Number of colors used (for pricing)
};

export type TextNode = BaseNode & {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  align: "left" | "center" | "right";
  fill: Fill;
  stroke?: { color: string; width: number };
};

export type ImageNode = BaseNode & {
  type: "image";
  src: string;
  crop?: { x: number; y: number; width: number; height: number };
  filters?: { brightness: number; contrast: number; saturation: number };
};

export type ShapeNode = BaseNode & {
  type: "shape";
  shape: "rect" | "circle" | "line" | "triangle" | "star";
  fill: Fill;
  stroke?: { color: string; width: number };
  radius?: number;
  points?: number;
};

export type PathNode = BaseNode & {
  type: "path";
  points: number[];
  stroke: { color: string; width: number };
  closed: boolean;
};

export type Node = TextNode | ImageNode | ShapeNode | PathNode;

export type PrintSurface = {
  id: string;
  name: string;
  area: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  enabled: boolean;
  maxColors?: number;
  printMethod?: string;
  nodes: string[]; // Node IDs assigned to this surface
};

export type CanvasConfig = {
  unit: "px" | "mm";
  width: number;
  height: number;
  dpi: 150 | 300;
  background: string | "transparent";
  showGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showGuides: boolean;
  safeAreaPct: number;
  bleedMm: number;
  garmentType?: string;
  garmentColor?: string;
  activeSurface?: string;
  printSurfaces?: PrintSurface[];
  // Legacy support - remove after migration
  printArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type HistoryEntry = {
  id: string;
  at: number;
  snapshot: string;
};

export type DesignDoc = {
  id: string;
  title: string;
  nodes: Node[];
  canvas: CanvasConfig;
  selectedIds: string[];
};

export type Tool = "select" | "hand" | "text" | "image" | "rect" | "circle" | "line" | "triangle" | "star" | "brush" | "eraser";

export type MockupConfig = {
  type: "front" | "back" | "side" | "worn";
  color: "light" | "dark" | "studio";
  opacity: number;
  showGrid?: boolean;
  showPrintArea?: boolean;
};

export type MaterialConfig = {
  id: string;
  name: string;
  type: 'cotton' | 'polyester' | 'fleece' | 'blend' | 'performance' | 'denim';
  printMethods: string[];
  basePrice: number;
  colorMultiplier: number;
  properties: {
    roughness: number;
    metalness: number;
    thickness: number;
    texture: string;
  };
};

export type PricingConfig = {
  basePrice: number;
  materialMultiplier: number;
  colorPricing: {
    '1': number;
    '2': number;
    '3': number;
    '4+': number;
  };
  surfacePricing: {
    front: number;
    back: number;
    sleeve: number;
    additional: number;
  };
  quantityBreaks: {
    qty: number;
    discount: number;
  }[];
};