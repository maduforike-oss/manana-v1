import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PanelState {
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  activeRightTab: string;
  setLeftPanelCollapsed: (collapsed: boolean) => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  setActiveRightTab: (tab: string) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}

export const useGlobalPanelState = create<PanelState>()(
  persist(
    (set, get) => ({
      leftPanelCollapsed: false,
      rightPanelCollapsed: false,
      activeRightTab: 'design',
      
      setLeftPanelCollapsed: (collapsed) => set({ leftPanelCollapsed: collapsed }),
      setRightPanelCollapsed: (collapsed) => set({ rightPanelCollapsed: collapsed }),
      setActiveRightTab: (tab) => set({ activeRightTab: tab }),
      
      toggleLeftPanel: () => set(state => ({ 
        leftPanelCollapsed: !state.leftPanelCollapsed 
      })),
      toggleRightPanel: () => set(state => ({ 
        rightPanelCollapsed: !state.rightPanelCollapsed 
      })),
    }),
    {
      name: 'studio-panel-state',
    }
  )
);