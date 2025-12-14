import { create } from 'zustand';
import { AppMode, PhotoData, HandGesture } from './types';

interface AppState {
  mode: AppMode;
  photos: PhotoData[];
  selectedPhotoIndex: number | null;
  gesture: HandGesture;
  cameraReady: boolean;
  
  // Actions
  setMode: (mode: AppMode) => void;
  addPhoto: (url: string) => void;
  setSelectedPhotoIndex: (index: number | null) => void;
  setGesture: (gesture: Partial<HandGesture>) => void;
  setCameraReady: (ready: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  mode: AppMode.TREE,
  photos: [],
  selectedPhotoIndex: null,
  gesture: {
    isFist: false,
    isOpen: true,
    isPinching: false,
    handX: 0.5,
    handY: 0.5,
  },
  cameraReady: false,

  setMode: (mode) => set({ mode }),
  addPhoto: (url) => set((state) => ({ 
    photos: [...state.photos, { id: Math.random().toString(36).substr(2, 9), url }] 
  })),
  setSelectedPhotoIndex: (index) => set({ selectedPhotoIndex: index }),
  setGesture: (newGesture) => set((state) => ({ 
    gesture: { ...state.gesture, ...newGesture } 
  })),
  setCameraReady: (ready) => set({ cameraReady: ready }),
}));