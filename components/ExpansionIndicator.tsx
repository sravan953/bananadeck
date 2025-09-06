import React from 'react';
import { motion } from 'framer-motion';

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
    <motion.div 
      className={`absolute top-3 right-3 flex items-center gap-2 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
    >
      {/* Main expand indicator with enhanced effects */}
      <div className="relative group">
        <motion.div 
          className="relative bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-md rounded-full p-2.5 border border-blue-400/40 group-hover:from-blue-600/50 group-hover:to-purple-600/50 transition-all duration-300 cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              background: [
                "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(147,51,234,0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Icon */}
          <svg 
            className="w-5 h-5 text-white relative z-10" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          
          {/* Multiple pulse rings for depth effect */}
          <motion.div 
            className="absolute inset-0 rounded-full bg-blue-400"
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute inset-0 rounded-full bg-purple-400"
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
          />
          <motion.div 
            className="absolute inset-0 rounded-full bg-blue-300"
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
          />
        </motion.div>
        
        {/* Enhanced tooltip */}
        <motion.div 
          className="absolute top-full right-0 mt-2 px-4 py-2 bg-gray-900/95 backdrop-blur-md text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl"
          initial={{ y: -5 }}
          whileHover={{ y: 0 }}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">Click to explore deeper</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Expansion count badge with animations */}
      {hasBeenExpanded && expansionCount > 0 && (
        <motion.div 
          className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 backdrop-blur-md rounded-full px-3 py-1.5 border border-emerald-400/40"
          initial={{ scale: 0, x: 10 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: 0.7, type: "spring" }}
        >
          <span className="text-xs text-white font-bold">{expansionCount} expanded</span>
        </motion.div>
      )}
    </motion.div>
  );
};