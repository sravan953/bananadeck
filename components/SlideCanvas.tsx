import React from 'react';
import type { Slide as SlideType, PresentationStyle } from '../types';
import { Slide } from './Slide';
import { Loader } from './Loader';
import { Placeholder } from './Placeholder';
import { ExpansionBreadcrumb } from './ExpansionBreadcrumb';

interface SlideCanvasProps {
  slides: SlideType[];
  presentationStyle: PresentationStyle | null;
  isLoading: boolean;
  loadingMessage: string;
  onExpand: (slide: SlideType) => void;
  isExpandedView: boolean;
  onGoBack: () => void;
  onStartSlideshow: () => void;
  parentSlide?: SlideType | null;
  expansionType?: 'technical' | 'business' | 'examples' | 'questions';
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({ 
  slides, 
  presentationStyle, 
  isLoading, 
  loadingMessage, 
  onExpand, 
  isExpandedView, 
  onGoBack, 
  onStartSlideshow,
  parentSlide,
  expansionType
}) => {
  if (isLoading) {
    return <Loader message={loadingMessage} />;
  }

  if (slides.length === 0 || !presentationStyle) {
    return <Placeholder />;
  }

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col">
      <div className="flex flex-col gap-2 mb-4">
        {/* Breadcrumb for expanded view */}
        {isExpandedView && (
          <ExpansionBreadcrumb 
            parentSlide={parentSlide || null}
            expansionType={expansionType}
            onGoBack={onGoBack}
          />
        )}
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-slate-100">
            {isExpandedView ? "Expanded Concept" : "Generated Slides"}
          </h2>
          <div className="flex items-center gap-4">
            {isExpandedView && (
              <button 
                onClick={onGoBack} 
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Main Deck
              </button>
            )}
            {slides.length > 0 && (
              <button 
                onClick={onStartSlideshow} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                aria-label="Start slideshow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Slideshow
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-grow min-h-0 flex items-center justify-start overflow-x-auto pb-4">
        {slides.map((slide, index) => (
          <Slide 
            key={slide.id} 
            slide={slide} 
            style={presentationStyle} 
            onExpand={onExpand} 
            index={index} 
            isMainDeck={!isExpandedView}
          />
        ))}
      </div>
    </div>
  );
};