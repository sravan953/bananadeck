import React from 'react';
import type { Slide as SlideType, PresentationStyle } from '../types';
import { Slide } from './Slide';
import { Loader } from './Loader';

interface SlideCanvasProps {
  slides: SlideType[];
  presentationStyle: PresentationStyle | null;
  isLoading: boolean;
  loadingMessage: string;
  onExpand: (slide: SlideType) => void;
  isExpandedView: boolean;
  onGoBack: () => void;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({ slides, presentationStyle, isLoading, loadingMessage, onExpand, isExpandedView, onGoBack }) => {
  if (isLoading) {
    return <Loader message={loadingMessage} />;
  }

  if (slides.length === 0 || !presentationStyle) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
        <div className="w-24 h-24 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full opacity-30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.375a6.375 6.375 0 006.375-6.375h.038c.414 0 .828-.163 1.125-.46l3-3.001a1.5 1.5 0 000-2.122l-3.375-3.375a1.5 1.5 0 00-2.122 0l-3.001 3a1.5 1.5 0 00-.46 1.125v.038A6.375 6.375 0 005.625 12H3.375a1.125 1.125 0 00-1.125 1.125v1.5a1.125 1.125 0 001.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125v-1.5a3 3 0 013-3h1.5a3 3 0 013 3v1.5c0 .621.504 1.125 1.125 1.125h2.25a1.125 1.125 0 001.125-1.125v-1.5a1.125 1.125 0 00-1.125-1.125h-2.25a6.375 6.375 0 00-6.375 6.375V18.375z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-300">AI Presentation Architect</h2>
        <p className="mt-2 max-w-md">Your generated slides will appear here. Start by adding some content sources and clicking 'Generate Slides'.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-100">
          {isExpandedView ? "Expanded Concept" : "Generated Slides"}
        </h2>
        {isExpandedView && (
          <button 
            onClick={onGoBack} 
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Main Deck
          </button>
        )}
      </div>
      <div className="flex-grow min-h-0 flex items-center justify-start overflow-x-auto pb-4">
        {slides.map((slide, index) => (
          <Slide key={slide.id} slide={slide} style={presentationStyle} onExpand={onExpand} index={index} />
        ))}
      </div>
    </div>
  );
};