import { create } from 'zustand';
import type { Landmark } from '../types';

interface AppStore {
  // 状态
  selectedLandmark: Landmark | null;
  focusedLandmark: Landmark | null;
  isNightMode: boolean;
  showLabels: boolean;
  isLoading: boolean;
  showWelcome: boolean;
  buildingsLoaded: boolean;
  roadsLoaded: boolean;
  
  // Actions
  setSelectedLandmark: (landmark: Landmark | null) => void;
  setFocusedLandmark: (landmark: Landmark | null) => void;
  toggleNightMode: () => void;
  toggleLabels: () => void;
  setLoading: (loading: boolean) => void;
  setShowWelcome: (show: boolean) => void;
  setBuildingsLoaded: (loaded: boolean) => void;
  setRoadsLoaded: (loaded: boolean) => void;
  resetView: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  selectedLandmark: null,
  focusedLandmark: null,
  isNightMode: false,
  showLabels: true,
  isLoading: true,
  showWelcome: true,
  buildingsLoaded: false,
  roadsLoaded: false,

  setSelectedLandmark: (landmark) => set({ selectedLandmark: landmark }),
  setFocusedLandmark: (landmark) => set({ focusedLandmark: landmark }),
  toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  setLoading: (loading) => set({ isLoading: loading }),
  setShowWelcome: (show) => set({ showWelcome: show }),
  setBuildingsLoaded: (loaded) => {
    set({ buildingsLoaded: loaded });
    // 检查是否全部加载完成
    const state = get();
    if (loaded && state.roadsLoaded) {
      set({ isLoading: false });
    }
  },
  setRoadsLoaded: (loaded) => {
    set({ roadsLoaded: loaded });
    // 检查是否全部加载完成
    const state = get();
    if (loaded && state.buildingsLoaded) {
      set({ isLoading: false });
    }
  },
  resetView: () => set({ selectedLandmark: null, focusedLandmark: null }),
}));
