export interface UploadedResource {
  url: string;
  type: 'doc' | 'youtube';
}

export interface Slide {
  id: string;
  title: string;
  content: string[];
  infographicSuggestion?: string;
  imageUrl?: string;
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
