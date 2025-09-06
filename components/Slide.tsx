import React from 'react';
import { motion } from 'framer-motion';
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
    fontFamily: `'Inter', sans-serif`,
  };

  return (
    <motion.div
      className="relative w-80 h-80 md:w-96 md:h-96 flex-shrink-0 m-4 rounded-xl shadow-2xl flex flex-col cursor-pointer group overflow-hidden"
      style={containerStyle}
      onClick={() => onExpand(slide)}
      aria-label={`Slide ${index + 1}: ${slide.title}`}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient border effect - always visible for loading cards */}
      <motion.div 
        className="absolute inset-0 p-[1px] rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
        initial={{ opacity: slide.imageUrl ? 0 : 0.3 }}
        animate={{ opacity: slide.imageUrl ? 0 : [0.3, 0.5, 0.3] }}
        whileHover={{ opacity: 1 }}
        transition={slide.imageUrl ? { duration: 0.3 } : { duration: 2, repeat: Infinity }}
      >
        <div className="h-full w-full bg-black rounded-xl" />
      </motion.div>

      {/* Main content container */}
      <div className="relative h-full w-full rounded-xl overflow-hidden bg-gray-900">
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, #2563eb 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, #2563eb 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, #2563eb 0%, transparent 50%)",
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Expansion indicator for main deck slides */}
        {isMainDeck && (
          <ExpansionIndicator 
            isExpandable={slide.isExpandable !== false}
            hasBeenExpanded={false}
            expansionCount={0}
            className="z-10"
          />
        )}

        {/* Depth indicator for expanded slides */}
        {slide.expansionDepth && slide.expansionDepth > 0 && (
          <motion.div 
            className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-3 py-1 shadow-lg z-10"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-xs font-bold text-white">Level {slide.expansionDepth}</span>
          </motion.div>
        )}

        {slide.imageUrl ? (
          <motion.img 
            src={slide.imageUrl} 
            alt={slide.title} 
            className="w-full h-full object-contain bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <>
            <div className="relative p-6 flex flex-col h-full w-full">
              <div className="flex justify-between items-start mb-4">
                <motion.h3 
                  className="text-lg md:text-xl font-bold flex-grow pr-4"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {slide.title}
                </motion.h3>
                <motion.span 
                  className="text-sm font-mono opacity-50"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {index + 1}
                </motion.span>
              </div>
              <motion.ul 
                className="list-disc list-inside text-sm md:text-base space-y-2 overflow-y-auto flex-grow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {slide.content.map((point, i) => (
                  <motion.li 
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="text-gray-300"
                  >
                    {point}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
            
            {/* Small loading indicator in corner */}
            <motion.div 
              className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-4 h-4 border-2 border-blue-400/50 rounded-full animate-spin border-t-blue-400" />
              <span className="text-xs text-blue-400">Generating...</span>
            </motion.div>
          </>
        )}
        
        {/* Hover overlay for expand action - always visible on text cards */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent"
          initial={{ opacity: slide.imageUrl ? 0 : 0.7, y: slide.imageUrl ? 20 : 0 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </motion.div>
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              Click to Expand
            </span>
          </div>
        </motion.div>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-xl shadow-[0_0_50px_rgba(37,99,235,0.5)]" />
      </div>
    </motion.div>
  );
};