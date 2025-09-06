export interface UploadedResource {
  id: string;
  name: string;
  type: 'doc' | 'youtube';
  
  // For uploaded files
  mimeType?: string;
  data?: string; // base64 encoded string (without the data URL prefix)

  // For URLs
  url?: string;
}

export interface Slide {
  id: string;
  title: string;
  content: string[];
  infographicSuggestion?: string;
  imageUrl?: string;
  isExpandable?: boolean;
  parentSlideId?: string;
  expansionDepth?: number;
  expansionType?: 'technical' | 'business' | 'examples' | 'questions';
}

export interface PresentationStyle {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  font: string;
}

export interface Presentation {
  style: PresentationStyle;
  slides: Slide[];
}

export enum ViewMode {
  MAIN_DECK,
  EXPANDED_VIEW,
}

export interface ExpansionHistory {
  parentSlideId: string;
  parentSlideTitle: string;
  expandedSlides: Slide[];
  expansionType: 'technical' | 'business' | 'examples' | 'questions';
  timestamp: number;
}
