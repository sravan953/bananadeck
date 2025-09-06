import React from 'react';
import type { Slide as SlideType, PresentationStyle } from '../types';
import { ExpansionIndicator } from './ExpansionIndicator';

interface SlideProps {
  slide: SlideType;
  style: PresentationStyle;
  onExpand: (slide: SlideType) => void;
  index: number;
  isMainDeck?: boolean;
}

export const Slide: React.FC<SlideProps> = ({ slide, style, onExpand, index, isMainDeck = false }) => {
  const containerStyle: React.CSSProperties = {
    color: '#FFFFFF',
    border: `1px solid #2563EB`,
    fontFamily: `'Inter', sans-serif`,
    backgroundColor: !slide.imageUrl ? '#000000' : 'transparent',
  };

  return (
    <div
      className="relative w-80 h-48 md:w-96 md:h-56 flex-shrink-0 m-4 rounded-lg shadow-lg flex flex-col cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/20 group overflow-hidden"
      style={containerStyle}
      onClick={() => onExpand(slide)}
      aria-label={`Slide ${index + 1}: ${slide.title}`}
    >
      {/* Expansion indicator for main deck slides */}
      {isMainDeck && (
        <ExpansionIndicator 
          isExpandable={slide.isExpandable !== false}
          hasBeenExpanded={false}
          expansionCount={0}
        />
      )}

      {/* Depth indicator for expanded slides */}
      {slide.expansionDepth && slide.expansionDepth > 0 && (
        <div className="absolute top-2 left-2 bg-slate-700/80 backdrop-blur-sm rounded-full px-3 py-1 border border-slate-600">
          <span className="text-xs font-semibold text-slate-300">Level {slide.expansionDepth}</span>
        </div>
      )}

      {slide.imageUrl ? (
        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover rounded-lg" />
      ) : (
        <>
            <div className="p-6 flex flex-col h-full w-full">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg md:text-xl font-bold mb-2 flex-grow pr-4">{slide.title}</h3>
                    <span className="text-sm font-mono opacity-50">{index + 1}</span>
                </div>
                <ul className="list-disc list-inside text-sm md:text-base space-y-1 overflow-y-auto flex-grow">
                    {slide.content.map((point, i) => (
                    <li key={i}>{point}</li>
                    ))}
                </ul>
            </div>
            {/* Loading indicator */}
            <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center" aria-hidden="true">
                <div className="w-8 h-8 border-2 border-dashed rounded-full animate-spin border-sky-400"></div>
                <p className="text-xs mt-3 text-slate-300">Generating visual...</p>
            </div>
        </>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center">
          <button className="text-xs font-semibold uppercase tracking-wider bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full transition-colors text-white pointer-events-none">
            Expand Concept
          </button>
      </div>
    </div>
  );
};