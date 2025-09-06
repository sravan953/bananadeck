import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpansionTypeSelectorProps {
  onSelect: (type: 'technical' | 'business' | 'examples' | 'questions') => void;
  onCancel: () => void;
  slideTitle: string;
}

export const ExpansionTypeSelector: React.FC<ExpansionTypeSelectorProps> = ({ onSelect, onCancel, slideTitle }) => {
  const expansionTypes = [
    {
      type: 'technical' as const,
      icon: '⚙️',
      title: 'Technical Deep Dive',
      description: 'Architecture, implementation details, and technical concepts',
      gradient: 'from-blue-600 to-cyan-500',
      shadowColor: 'shadow-blue-500/50',
      delay: 0
    },
    {
      type: 'business' as const,
      icon: '📊',
      title: 'Business Impact',
      description: 'ROI, strategic implications, and stakeholder benefits',
      gradient: 'from-purple-600 to-pink-500',
      shadowColor: 'shadow-purple-500/50',
      delay: 0.1
    },
    {
      type: 'examples' as const,
      icon: '💡',
      title: 'Real Examples',
      description: 'Case studies, demonstrations, and practical applications',
      gradient: 'from-green-600 to-teal-500',
      shadowColor: 'shadow-green-500/50',
      delay: 0.2
    },
    {
      type: 'questions' as const,
      icon: '❓',
      title: 'FAQ & Questions',
      description: 'Common questions, concerns, and clarifications',
      gradient: 'from-orange-600 to-red-500',
      shadowColor: 'shadow-orange-500/50',
      delay: 0.3
    }
  ];

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div 
          className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-gray-800"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient border */}
          <div className="relative p-8 border-b border-gray-800">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
            <div className="relative">
              <motion.h2 
                className="text-3xl font-bold text-white mb-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                How would you like to expand?
              </motion.h2>
              <motion.p 
                className="text-gray-400"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Choose a perspective to explore <span className="text-blue-400 font-semibold">"{slideTitle}"</span>
              </motion.p>
            </div>
          </div>
          
          {/* Options Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {expansionTypes.map(({ type, icon, title, description, gradient, shadowColor, delay }) => (
                <motion.button
                  key={type}
                  onClick={() => onSelect(type)}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + delay }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                  
                  {/* Card content */}
                  <div className={`relative bg-gray-800/50 backdrop-blur border border-gray-700 group-hover:border-gray-600 rounded-2xl p-6 text-left transition-all duration-300 ${shadowColor} group-hover:shadow-xl`}>
                    {/* Icon with animated background */}
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                        whileHover={{ rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span className="text-3xl filter drop-shadow-md">{icon}</span>
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {title}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {description}
                    </p>
                    
                    {/* Hover indicator */}
                    <div className="mt-4 flex items-center gap-2 text-gray-500 group-hover:text-blue-400 transition-colors">
                      <span className="text-xs font-medium">Click to explore</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <motion.div 
            className="p-6 border-t border-gray-800 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};