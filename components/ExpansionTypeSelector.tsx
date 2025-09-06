import React from 'react';

interface ExpansionTypeSelectorProps {
  onSelect: (type: 'technical' | 'business' | 'examples' | 'questions') => void;
  onCancel: () => void;
  slideTitle: string;
}

export const ExpansionTypeSelector: React.FC<ExpansionTypeSelectorProps> = ({ onSelect, onCancel, slideTitle }) => {
  const expansionTypes = [
    {
      type: 'technical' as const,
      icon: '🔧',
      title: 'Technical Deep Dive',
      description: 'Architecture, implementation details, and technical concepts'
    },
    {
      type: 'business' as const,
      icon: '💼',
      title: 'Business Impact',
      description: 'ROI, strategic implications, and stakeholder benefits'
    },
    {
      type: 'examples' as const,
      icon: '📊',
      title: 'Real Examples',
      description: 'Case studies, demonstrations, and practical applications'
    },
    {
      type: 'questions' as const,
      icon: '❓',
      title: 'FAQ & Questions',
      description: 'Common questions, concerns, and clarifications'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-slate-100">Choose Expansion Type</h2>
          <p className="text-slate-400 mt-2">How would you like to explore "{slideTitle}"?</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {expansionTypes.map(({ type, icon, title, description }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="group bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">{description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};