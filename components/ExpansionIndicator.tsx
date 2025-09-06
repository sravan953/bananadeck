import React from 'react';

interface ExpansionIndicatorProps {
  isExpandable?: boolean;
  hasBeenExpanded?: boolean;
  expansionCount?: number;
  className?: string;
}

export const ExpansionIndicator: React.FC<ExpansionIndicatorProps> = ({ 
  isExpandable = true, 
  hasBeenExpanded = false,
  expansionCount = 0,
  className = '' 
}) => {
  if (!isExpandable) return null;

  return (
    <div className={`absolute top-2 right-2 flex items-center gap-2 ${className}`}>
      {/* Main expand indicator */}
      <div className="relative group">
        <div className="bg-blue-600/20 backdrop-blur-sm rounded-full p-2 border border-blue-500/30 group-hover:bg-blue-600/30 transition-all duration-300">
          <svg 
            className="w-5 h-5 text-blue-400 group-hover:text-blue-200 transition-colors" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          
          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute top-full right-0 mt-2 px-3 py-1 bg-slate-800 text-blue-100 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Click to expand concept
        </div>
      </div>

      {/* Expansion count badge */}
      {hasBeenExpanded && expansionCount > 0 && (
        <div className="bg-emerald-500/20 backdrop-blur-sm rounded-full px-2 py-1 border border-emerald-400/30">
          <span className="text-xs text-emerald-300 font-semibold">{expansionCount} expansions</span>
        </div>
      )}
    </div>
  );
};