import React from 'react';
import type { Slide } from '../types';

interface ExpansionBreadcrumbProps {
  parentSlide: Slide | null;
  expansionType?: 'technical' | 'business' | 'examples' | 'questions';
  onGoBack: () => void;
}

export const ExpansionBreadcrumb: React.FC<ExpansionBreadcrumbProps> = ({ 
  parentSlide, 
  expansionType,
  onGoBack 
}) => {
  const getExpansionTypeLabel = (type?: string) => {
    switch (type) {
      case 'technical': return '🔧 Technical';
      case 'business': return '💼 Business';
      case 'examples': return '📊 Examples';
      case 'questions': return '❓ Q&A';
      default: return 'Expansion';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <button 
        onClick={onGoBack}
        className="hover:text-slate-200 transition-colors"
      >
        Main Deck
      </button>
      
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      
      {parentSlide && (
        <>
          <span className="text-slate-300 font-medium">
            {parentSlide.title}
          </span>
          
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          
          <span className="text-blue-400 font-medium">
            {getExpansionTypeLabel(expansionType)}
          </span>
        </>
      )}
    </div>
  );
};