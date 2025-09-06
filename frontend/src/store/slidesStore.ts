import { create } from 'zustand';
import { Slide } from '../types';

interface SlidesState {
  slides: Slide[];
  selectedSlide: string | null;
  slideOrder: string[];
  addSlide: (slide: Slide) => void;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  reorderSlides: (newOrder: string[]) => void;
  selectSlide: (id: string | null) => void;
  expandSlide: (slideId: string) => void;
  addChildSlides: (parentId: string, children: Slide[]) => void;
}

export const useSlidesStore = create<SlidesState>((set) => ({
  slides: [],
  selectedSlide: null,
  slideOrder: [],
  
  addSlide: (slide) => set((state) => ({
    slides: [...state.slides, slide],
    slideOrder: [...state.slideOrder, slide.id]
  })),
  
  updateSlide: (id, updates) => set((state) => ({
    slides: state.slides.map(slide => 
      slide.id === id ? { ...slide, ...updates } : slide
    )
  })),
  
  reorderSlides: (newOrder) => set({ slideOrder: newOrder }),
  
  selectSlide: (id) => set({ selectedSlide: id }),
  
  expandSlide: (slideId) => set((state) => ({
    slides: state.slides.map(slide => 
      slide.id === slideId 
        ? { ...slide, metadata: { ...slide.metadata, expanded: true } }
        : slide
    )
  })),
  
  addChildSlides: (parentId, children) => set((state) => {
    const parent = state.slides.find(s => s.id === parentId);
    if (!parent) return state;
    
    const childIds = children.map(c => c.id);
    const updatedSlides = [
      ...state.slides.map(slide => 
        slide.id === parentId 
          ? { ...slide, children: [...(slide.children || []), ...childIds] }
          : slide
      ),
      ...children
    ];
    
    const parentIndex = state.slideOrder.indexOf(parentId);
    const newOrder = [
      ...state.slideOrder.slice(0, parentIndex + 1),
      ...childIds,
      ...state.slideOrder.slice(parentIndex + 1)
    ];
    
    return {
      slides: updatedSlides,
      slideOrder: newOrder
    };
  })
}));