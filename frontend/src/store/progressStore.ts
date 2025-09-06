import { create } from 'zustand';
import { ProgressPhase, SlideStructure } from '../types';

interface ProgressState {
  ingestionProgress: number;
  generationProgress: number;
  currentPhase: ProgressPhase;
  slideStructure: SlideStructure[];
  error: string | null;
  
  updateIngestionProgress: (progress: number) => void;
  updateGenerationProgress: (progress: number) => void;
  setPhase: (phase: ProgressPhase) => void;
  setSlideStructure: (structure: SlideStructure[]) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  ingestionProgress: 0,
  generationProgress: 0,
  currentPhase: 'idle' as ProgressPhase,
  slideStructure: [],
  error: null
};

export const useProgressStore = create<ProgressState>((set) => ({
  ...initialState,
  
  updateIngestionProgress: (progress) => set({ ingestionProgress: progress }),
  
  updateGenerationProgress: (progress) => set({ generationProgress: progress }),
  
  setPhase: (phase) => set({ currentPhase: phase }),
  
  setSlideStructure: (structure) => set({ slideStructure: structure }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState)
}));