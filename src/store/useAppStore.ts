import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Design {
  id: string;
  name: string;
  garmentType: string;
  thumbnail: string;
  canvas: string; // JSON representation of canvas
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  website?: string;
  specialties: string[];
  plan: 'basic' | 'premium';
  designsThisMonth: number;
  maxDesigns: number;
  followers: number;
  following: number;
  socialLinks: Array<{
    platform: 'website' | 'instagram' | 'twitter' | 'linkedin';
    url: string;
  }>;
  featuredDesigns: Array<{
    id: string;
    name: string;
    thumbnail: string;
    garmentType: string;
    likes: number;
    views: number;
  }>;
}

interface AppState {
  // Auth & User
  user: User | null;
  isAuthenticated: boolean;
  
  // Navigation
  activeTab: 'market' | 'community' | 'studio' | 'orders' | 'profile';
  
  // Designs
  designs: Design[];
  currentDesign: Design | null;
  
  // Studio State
  selectedGarment: string | null;
  canvasState: any;
  
  // Actions
  setActiveTab: (tab: AppState['activeTab']) => void;
  setUser: (user: User | null) => void;
  createDesign: (garmentType: string) => boolean;
  saveDesign: (design: Partial<Design>) => void;
  loadDesign: (designId: string) => void;
  deleteDesign: (designId: string) => void;
  setSelectedGarment: (garment: string) => void;
  updateCanvasState: (state: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      activeTab: 'studio',
      designs: [],
      currentDesign: null,
      selectedGarment: null,
      canvasState: null,

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      createDesign: (garmentType) => {
        const state = get();
        if (!state.user) return false;
        
        // Check design limits
        if (state.user.designsThisMonth >= state.user.maxDesigns) {
          return false;
        }
        
        const newDesign: Design = {
          id: `design_${Date.now()}`,
          name: `New ${garmentType} Design`,
          garmentType,
          thumbnail: '',
          canvas: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set({
          designs: [...state.designs, newDesign],
          currentDesign: newDesign,
          selectedGarment: garmentType,
          user: {
            ...state.user,
            designsThisMonth: state.user.designsThisMonth + 1,
          },
        });
        
        return true;
      },
      
      saveDesign: (designData) => {
        const state = get();
        if (!state.currentDesign) return;
        
        const updatedDesign = {
          ...state.currentDesign,
          ...designData,
          updatedAt: new Date(),
        };
        
        set({
          currentDesign: updatedDesign,
          designs: state.designs.map(d => 
            d.id === updatedDesign.id ? updatedDesign : d
          ),
        });
      },
      
      loadDesign: (designId) => {
        const state = get();
        const design = state.designs.find(d => d.id === designId);
        if (design) {
          set({
            currentDesign: design,
            selectedGarment: design.garmentType,
            activeTab: 'studio',
          });
        }
      },
      
      deleteDesign: (designId) => {
        const state = get();
        set({
          designs: state.designs.filter(d => d.id !== designId),
          currentDesign: state.currentDesign?.id === designId ? null : state.currentDesign,
        });
      },
      
      setSelectedGarment: (garment) => set({ selectedGarment: garment }),
      
      updateCanvasState: (canvasState) => set({ canvasState }),
      
      logout: () => set({ user: null, isAuthenticated: false, designs: [], currentDesign: null }),
    }),
    {
      name: 'manana-app-store',
      partialize: (state) => ({
        user: state.user,
        designs: state.designs,
        activeTab: state.activeTab,
      }),
    }
  )
);