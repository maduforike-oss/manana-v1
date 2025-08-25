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
  type: "front" | "back";
  color: "light" | "dark";
  opacity: number;
};