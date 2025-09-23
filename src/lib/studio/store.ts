import { create } from 'zustand';
import { produce } from 'immer';
import { DesignDoc, Node, CanvasConfig, HistoryEntry, Tool, MockupConfig, PrintSurface, MaterialConfig, BrushStrokeNode } from './types';
import { CANVAS_PRESETS } from './presets';

interface StudioState {
  doc: DesignDoc;
  history: HistoryEntry[];
  redoStack: HistoryEntry[];
  activeTool: Tool;
  zoom: number;
  panOffset: { x: number; y: number };
  snapEnabled: boolean;
  mockup: MockupConfig;
  is3DMode: boolean;
  
  // Computed properties
  canUndo: boolean;
  canRedo: boolean;
  
  // Actions
  addNode: (node: Node) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  removeNode: (id: string) => void;
  reorderNodes: (fromIndex: number, toIndex: number) => void;
  selectNode: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clearSelection: () => void;
  setActiveTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  toggleSnap: () => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  updateCanvas: (config: Partial<CanvasConfig>) => void;
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => void;
  duplicate: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  alignToArtboard: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelection: (distribution: 'horizontal' | 'vertical') => void;
  setMockup: (mockup: Partial<MockupConfig>) => void;
  toggle3DMode: () => void;
  set3DMode: (enabled: boolean) => void;
  saveToLocal: () => void;
  loadFromLocal: (id: string) => void;
  newDesign: (garmentType?: string) => void;
  setTitle: (title: string) => void;
  initializeFromGarment: (garmentType: string, garmentColor: string) => void;
  updateGarmentColor: (colorId: string) => void;
  // Phase 1 additions
  switchPrintSurface: (surfaceId: string) => void;
  toggleSurfaceVisibility: (surfaceId: string) => void;
  getPrintSurfaces: () => PrintSurface[];
  getPrintSurfaceNodes: (surfaceId: string) => Node[];
  activePrintSurface: string;
  updateMaterialConfig?: (material: MaterialConfig) => void;
  getCanvasElement: () => HTMLCanvasElement | null;
  // Phase 2 additions
  loadStudioFromAppDesign: (design: any) => Promise<void>;
  // Brush stroke persistence
  addBrushStroke: (strokeData: any) => void;
  getBrushStrokes: () => BrushStrokeNode[];
  clearBrushCanvas: () => void;
}

const createInitialDoc = (garmentType?: string): DesignDoc => ({
  id: `design-${Date.now()}`,
  title: 'Untitled Design',
  nodes: [],
  canvas: { ...CANVAS_PRESETS[garmentType as keyof typeof CANVAS_PRESETS] || CANVAS_PRESETS['T-Shirt'] },
  selectedIds: [],
});

export const useStudioStore = create<StudioState>((set, get) => ({
  doc: createInitialDoc(),
  history: [],
  redoStack: [],
  activeTool: 'select',
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  snapEnabled: true,
  mockup: { type: 'front', color: 'light', opacity: 0.8, garmentOpacity: 0.7 },
  is3DMode: false,
  
  get canUndo() {
    return get().history.length > 1;
  },
  
  get canRedo() {
    return get().redoStack.length > 0;
  },

  addNode: (node) => set(produce((state) => {
    state.doc.nodes.push(node);
    state.doc.selectedIds = [node.id];
    get().saveSnapshot();
  })),

  updateNode: (id, updates) => set(produce((state) => {
    const nodeIndex = state.doc.nodes.findIndex(n => n.id === id);
    if (nodeIndex >= 0) {
      Object.assign(state.doc.nodes[nodeIndex], updates);
    }
  })),

  removeNode: (id) => set(produce((state) => {
    state.doc.nodes = state.doc.nodes.filter(n => n.id !== id);
    state.doc.selectedIds = state.doc.selectedIds.filter(sid => sid !== id);
    get().saveSnapshot();
  })),

  reorderNodes: (fromIndex, toIndex) => set(produce((state) => {
    const [removed] = state.doc.nodes.splice(fromIndex, 1);
    state.doc.nodes.splice(toIndex, 0, removed);
    get().saveSnapshot();
  })),

  selectNode: (id) => set(produce((state) => {
    state.doc.selectedIds = [id];
  })),

  selectMany: (ids) => set(produce((state) => {
    state.doc.selectedIds = ids;
  })),

  clearSelection: () => set(produce((state) => {
    state.doc.selectedIds = [];
  })),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPanOffset: (offset) => set({ panOffset: offset }),

  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),

  toggleGrid: () => set(produce((state) => {
    state.doc.canvas.showGrid = !state.doc.canvas.showGrid;
  })),

  toggleRulers: () => set(produce((state) => {
    state.doc.canvas.showRulers = !state.doc.canvas.showRulers;
  })),

  updateCanvas: (config) => set(produce((state) => {
    Object.assign(state.doc.canvas, config);
  })),

  saveSnapshot: () => set(produce((state) => {
    const snapshot = JSON.stringify(state.doc);
    const entry: HistoryEntry = {
      id: `history-${Date.now()}`,
      at: Date.now(),
      snapshot,
    };
    state.history.push(entry);
    if (state.history.length > 100) {
      state.history.shift();
    }
    state.redoStack = [];
  })),

  undo: () => set(produce((state) => {
    if (state.history.length > 1) {
      const current = state.history.pop()!;
      state.redoStack.push(current);
      const previous = state.history[state.history.length - 1];
      state.doc = JSON.parse(previous.snapshot);
    }
  })),

  redo: () => set(produce((state) => {
    if (state.redoStack.length > 0) {
      const next = state.redoStack.pop()!;
      state.history.push(next);
      state.doc = JSON.parse(next.snapshot);
    }
  })),

  duplicate: (id) => set(produce((state) => {
    const node = state.doc.nodes.find(n => n.id === id);
    if (node) {
      const duplicate = { ...node, id: `${id}-copy-${Date.now()}`, x: node.x + 20, y: node.y + 20 };
      state.doc.nodes.push(duplicate);
      state.doc.selectedIds = [duplicate.id];
      get().saveSnapshot();
    }
  })),

  bringToFront: (id) => set(produce((state) => {
    const nodeIndex = state.doc.nodes.findIndex(n => n.id === id);
    if (nodeIndex >= 0) {
      const [node] = state.doc.nodes.splice(nodeIndex, 1);
      state.doc.nodes.push(node);
      get().saveSnapshot();
    }
  })),

  sendToBack: (id) => set(produce((state) => {
    const nodeIndex = state.doc.nodes.findIndex(n => n.id === id);
    if (nodeIndex >= 0) {
      const [node] = state.doc.nodes.splice(nodeIndex, 1);
      state.doc.nodes.unshift(node);
      get().saveSnapshot();
    }
  })),

  alignToArtboard: (alignment) => set(produce((state) => {
    const { canvas, selectedIds, nodes } = state.doc;
    selectedIds.forEach(id => {
      const node = nodes.find(n => n.id === id);
      if (!node) return;

      switch (alignment) {
        case 'left':
          node.x = 0;
          break;
        case 'center':
          node.x = (canvas.width - node.width) / 2;
          break;
        case 'right':
          node.x = canvas.width - node.width;
          break;
        case 'top':
          node.y = 0;
          break;
        case 'middle':
          node.y = (canvas.height - node.height) / 2;
          break;
        case 'bottom':
          node.y = canvas.height - node.height;
          break;
      }
    });
    get().saveSnapshot();
  })),

  distributeSelection: (distribution) => set(produce((state) => {
    const { selectedIds, nodes } = state.doc;
    if (selectedIds.length < 3) return;

    const selectedNodes = selectedIds.map(id => nodes.find(n => n.id === id)!).filter(Boolean);
    
    if (distribution === 'horizontal') {
      selectedNodes.sort((a, b) => a.x - b.x);
      const totalWidth = selectedNodes[selectedNodes.length - 1].x - selectedNodes[0].x;
      const spacing = totalWidth / (selectedNodes.length - 1);
      selectedNodes.forEach((node, i) => {
        if (i > 0 && i < selectedNodes.length - 1) {
          node.x = selectedNodes[0].x + spacing * i;
        }
      });
    } else {
      selectedNodes.sort((a, b) => a.y - b.y);
      const totalHeight = selectedNodes[selectedNodes.length - 1].y - selectedNodes[0].y;
      const spacing = totalHeight / (selectedNodes.length - 1);
      selectedNodes.forEach((node, i) => {
        if (i > 0 && i < selectedNodes.length - 1) {
          node.y = selectedNodes[0].y + spacing * i;
        }
      });
    }
    get().saveSnapshot();
  })),

  setMockup: (mockup) => set((state) => ({ 
    mockup: { ...state.mockup, ...mockup } 
  })),

  toggle3DMode: () => set((state) => ({ 
    is3DMode: !state.is3DMode 
  })),

  set3DMode: (enabled) => set({ 
    is3DMode: enabled 
  }),

  saveToLocal: () => {
    const { doc } = get();
    localStorage.setItem(`design-${doc.id}`, JSON.stringify(doc));
    localStorage.setItem('studio-autosave', JSON.stringify(doc));
  },

  loadFromLocal: (id) => {
    const saved = localStorage.getItem(`design-${id}`);
    if (saved) {
      set({ doc: JSON.parse(saved) });
    }
  },

  newDesign: (garmentType?) => set({
    doc: createInitialDoc(garmentType),
    history: [],
    redoStack: [],
  }),

  setTitle: (title) => set(produce((state) => {
    state.doc.title = title;
  })),

  initializeFromGarment: (garmentType, garmentColor) => set(produce((state) => {
    state.doc = createInitialDoc(garmentType);
    state.doc.title = `New ${garmentType} Design`;
    state.doc.canvas.garmentType = garmentType;
    state.doc.canvas.garmentColor = garmentColor;
    state.history = [];
    state.redoStack = [];
    state.mockup = { 
      type: 'front', 
      color: garmentColor === 'white' || garmentColor === 'light' ? 'light' : 'dark', 
      opacity: 0.8 
    };
    get().saveSnapshot();
  })),

  updateGarmentColor: (colorId) => set(produce((state) => {
    state.doc.canvas.garmentColor = colorId;
    state.mockup.color = colorId === 'white' || colorId === 'light' ? 'light' : 'dark';
  })),

  // Phase 1 Implementation
  activePrintSurface: 'front',

  switchPrintSurface: (surfaceId) => set(produce((state) => {
    state.doc.canvas.activeSurface = surfaceId;
  })),

  toggleSurfaceVisibility: (surfaceId) => set(produce((state) => {
    const surfaces = state.doc.canvas.printSurfaces || [];
    const surface = surfaces.find(s => s.id === surfaceId);
    if (surface) {
      surface.enabled = !surface.enabled;
    }
  })),

  getPrintSurfaces: () => {
    const { doc } = get();
    return doc.canvas.printSurfaces || [
      {
        id: 'front',
        name: 'Front',
        area: { x: 50, y: 100, width: 300, height: 400 },
        enabled: true,
        nodes: []
      }
    ];
  },

  getPrintSurfaceNodes: (surfaceId) => {
    const { doc } = get();
    return doc.nodes.filter(node => node.surfaceId === surfaceId || (!node.surfaceId && surfaceId === 'front'));
  },

  updateMaterialConfig: (material) => {
    // Store material config in local state or send to backend
    console.log('Material updated:', material);
  },

  getCanvasElement: () => {
    return document.querySelector('canvas') as HTMLCanvasElement;
  },

  // Phase 2: Enhanced loading from app store design
  loadStudioFromAppDesign: async (design: any) => {
    return new Promise((resolve, reject) => {
      try {
        // Initialize with garment type
        const garmentType = design.garmentType || 'tshirt-white';
        get().initializeFromGarment(garmentType, 'white');
        
        // If design has canvas data, load it
        if (design.canvas && design.canvas !== '') {
          try {
            const canvasData = JSON.parse(design.canvas);
            if (canvasData.doc) {
              set(produce((state) => {
                state.doc = {
                  ...state.doc,
                  ...canvasData.doc,
                  title: design.name,
                };
                state.zoom = canvasData.zoom || 1;
                state.panOffset = canvasData.panOffset || { x: 0, y: 0 };
                state.mockup = canvasData.mockup || { 
                  type: 'front', 
                  color: 'light', 
                  opacity: 0.8 
                };
              }));
            }
          } catch (error) {
            console.warn('Failed to parse canvas data:', error);
          }
        }
        
        // Update document name
        set(produce((state) => {
          state.doc.title = design.name;
        }));
        
        // Save snapshot for undo/redo
        get().saveSnapshot();
        
        resolve();
      } catch (error) {
        console.error('Failed to load studio from app design:', error);
        // Fallback to basic initialization
        get().initializeFromGarment(design.garmentType || 'tshirt-white', 'white');
        reject(error);
      }
    });
  },

  // Brush stroke persistence
  addBrushStroke: (strokeData) => set(produce((state) => {
    const strokeNode: BrushStrokeNode = {
      id: `brush-stroke-${Date.now()}`,
      type: 'brush-stroke',
      name: 'Brush Stroke',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      opacity: strokeData.opacity || 1,
      strokeData: {
        color: strokeData.color,
        size: strokeData.size,
        opacity: strokeData.opacity || 1,
        hardness: strokeData.hardness || 1,
        points: strokeData.points || []
      }
    };
    
    // Calculate bounding box
    if (strokeData.points && strokeData.points.length > 0) {
      const xs = strokeData.points.map((p: any) => p.x);
      const ys = strokeData.points.map((p: any) => p.y);
      strokeNode.x = Math.min(...xs) - strokeData.size;
      strokeNode.y = Math.min(...ys) - strokeData.size;
      strokeNode.width = Math.max(...xs) - Math.min(...xs) + strokeData.size * 2;
      strokeNode.height = Math.max(...ys) - Math.min(...ys) + strokeData.size * 2;
    }
    
    state.doc.nodes.push(strokeNode);
    get().saveSnapshot();
  })),

  getBrushStrokes: () => {
    const { doc } = get();
    return doc.nodes.filter(node => node.type === 'brush-stroke') as BrushStrokeNode[];
  },

  clearBrushCanvas: () => {
    // This will be called to notify canvas to clear and redraw from nodes
  },
}));

// Debounced autosave with change detection
let lastSaveState: string | null = null;
let saveTimeout: NodeJS.Timeout | null = null;

const debouncedSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(() => {
    const currentState = JSON.stringify(useStudioStore.getState().doc);
    if (currentState !== lastSaveState) {
      useStudioStore.getState().saveToLocal();
      lastSaveState = currentState;
    }
  }, 2000); // Further reduced for demo stability
};

// Subscribe to store changes for efficient autosave
useStudioStore.subscribe(debouncedSave);