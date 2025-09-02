import { create } from 'zustand';
import { StudioState, StudioGarment, StudioNode, SafeArea } from './types';

const createInitialGarment = (): StudioGarment => ({
  slug: 't-shirt',
  color: 'white',
  view: 'front',
  size: 'M',
  mmToPx: 3.543
});

const createInitialSafe = (): SafeArea => ({
  wPx: Math.round(280 * 3.543),
  hPx: Math.round(380 * 3.543)
});

export const useStudioStore = create<StudioState>((set, get) => ({
  garment: createInitialGarment(),
  safe: createInitialSafe(),
  nodes: [],
  selectedIds: [],
  grid: {
    enabled: true,
    step: 12,
    snap: true
  },
  guides: {
    x: [],
    y: []
  },
  history: ['{"nodes":[],"selectedIds":[]}'],
  histIndex: 0,

  loadGarment: (garment) => {
    set((state) => {
      const newGarment = { ...state.garment, ...garment };
      const newSafe = {
        wPx: Math.round(280 * newGarment.mmToPx),
        hPx: Math.round(380 * newGarment.mmToPx)
      };
      return {
        garment: newGarment,
        safe: newSafe
      };
    });
  },

  setNodes: (nodes) => {
    set({ nodes, selectedIds: [] });
    get().pushHistory();
  },

  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
      selectedIds: [node.id]
    }));
    get().pushHistory();
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map(node => 
        node.id === id ? { ...node, ...updates } : node
      )
    }));
    get().pushHistory();
  },

  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter(node => node.id !== id),
      selectedIds: state.selectedIds.filter(sid => sid !== id)
    }));
    get().pushHistory();
  },

  selectNode: (id) => {
    set({ selectedIds: [id] });
  },

  selectNodes: (ids) => {
    set({ selectedIds: ids });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  pushHistory: () => {
    const state = get();
    const snapshot = JSON.stringify({
      nodes: state.nodes,
      selectedIds: state.selectedIds
    });
    
    set((prevState) => {
      const newHistory = prevState.history.slice(0, prevState.histIndex + 1);
      newHistory.push(snapshot);
      
      // Limit history to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return {
        history: newHistory,
        histIndex: newHistory.length - 1
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.histIndex <= 0) return;
    
    const prevSnapshot = state.history[state.histIndex - 1];
    const data = JSON.parse(prevSnapshot);
    
    set({
      nodes: data.nodes,
      selectedIds: data.selectedIds,
      histIndex: state.histIndex - 1
    });
  },

  redo: () => {
    const state = get();
    if (state.histIndex >= state.history.length - 1) return;
    
    const nextSnapshot = state.history[state.histIndex + 1];
    const data = JSON.parse(nextSnapshot);
    
    set({
      nodes: data.nodes,
      selectedIds: data.selectedIds,
      histIndex: state.histIndex + 1
    });
  },

  setGrid: (gridUpdates) => {
    set((state) => ({
      grid: { ...state.grid, ...gridUpdates }
    }));
  },

  addGuide: (axis, position) => {
    set((state) => ({
      guides: {
        ...state.guides,
        [axis]: [...state.guides[axis], position].sort((a, b) => a - b)
      }
    }));
  },

  removeGuide: (axis, position) => {
    set((state) => ({
      guides: {
        ...state.guides,
        [axis]: state.guides[axis].filter(p => Math.abs(p - position) > 1)
      }
    }));
  }
}));

// Auto-save every 5 seconds
const AUTOSAVE_KEY = 'studio:current';
let saveTimeout: NodeJS.Timeout;

useStudioStore.subscribe((state) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const data = {
      garment: state.garment,
      nodes: state.nodes,
      selectedIds: state.selectedIds,
      grid: state.grid,
      guides: state.guides
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
  }, 5000);
});

// Load autosaved data on init
const loadAutosave = () => {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      useStudioStore.setState({
        garment: data.garment || createInitialGarment(),
        nodes: data.nodes || [],
        selectedIds: data.selectedIds || [],
        grid: data.grid || { enabled: true, step: 12, snap: true },
        guides: data.guides || { x: [], y: [] }
      });
    }
  } catch (e) {
    console.warn('Failed to load autosaved studio data:', e);
  }
};

// Load on first run
if (typeof window !== 'undefined') {
  loadAutosave();
}