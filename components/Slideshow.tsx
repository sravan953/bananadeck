import React from 'react';
import type { Slide, PresentationStyle } from '../types';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface SlideshowProps {
  slides: Slide[];
  style: PresentationStyle;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Slideshow: React.FC<SlideshowProps> = ({ slides, style, currentIndex, onClose, onNext, onPrev }) => {
  const currentSlide = slides[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-lg flex flex-col items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slideshow-title"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4">
        <h2 id="slideshow-title" className="text-lg font-semibold text-slate-200" style={{ fontFamily: `'Inter', sans-serif` }}>
          {currentSlide?.title}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
          aria-label="Close slideshow"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full h-full flex items-center justify-center">
        {/* Previous Button */}
        <button
          onClick={onPrev}
          className="absolute left-4 p-3 rounded-full text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>

        {/* Slide Image */}
        <div className="w-full max-w-4xl aspect-square bg-slate-900 rounded-lg shadow-2xl shadow-black/50 flex items-center justify-center">
            {currentSlide?.imageUrl ? (
                <img 
                    src={currentSlide.imageUrl} 
                    alt={currentSlide.title} 
                    className="w-full h-full object-contain rounded-lg"
                />
            ) : (
                <div className="text-slate-400 text-center">
                    <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-sky-400 mx-auto"></div>
                    <p className="mt-4">Generating visual...</p>
                </div>
            )}
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="absolute right-4 p-3 rounded-full text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-slate-300 font-mono text-sm">
        {currentIndex + 1} / {slides.length}
      </div>
    </div>
  );
};