export interface Slide {
  id: string;
  content: string;
  order: number;
  parentId?: string;
  children?: string[];
  metadata?: {
    title?: string;
    concept?: string;
    expanded?: boolean;
  };
}

export interface InputSource {
  id: string;
  type: 'file' | 'url' | 'text';
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  preview?: string;
}

export interface SlideStructure {
  id: string;
  title: string;
  estimatedSlides: number;
  completed: boolean;
}

export type ProgressPhase = 'idle' | 'ingesting' | 'generating' | 'complete';

export interface ProgressState {
  ingestionProgress: number;
  generationProgress: number;
  currentPhase: ProgressPhase;
  slideStructure: SlideStructure[];
}