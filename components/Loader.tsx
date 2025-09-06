import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => (
  <motion.div 
    className="flex flex-col items-center justify-center h-full text-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Animated logo/spinner */}
    <div className="relative">
      {/* Outer ring */}
      <motion.div 
        className="w-20 h-20 border-4 border-blue-500/20 rounded-full absolute"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Middle ring */}
      <motion.div 
        className="w-20 h-20 border-4 border-transparent border-t-blue-400 border-r-purple-400 rounded-full absolute"
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner dot */}
      <motion.div 
        className="w-20 h-20 flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg shadow-blue-500/50" />
      </motion.div>
    </div>
    
    {/* Message with typing effect */}
    <motion.p 
      className="mt-8 text-lg font-semibold text-white"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {message}
    </motion.p>
    
    {/* Progress bar with gradient */}
    <motion.div 
      className="w-80 mt-6 bg-gray-800 rounded-full h-2 overflow-hidden relative"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 h-2"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{ width: "200%" }}
      />
    </motion.div>
    
    {/* Floating particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 10
          }}
          animate={{ 
            y: -10,
            x: Math.random() * window.innerWidth
          }}
          transition={{ 
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "linear"
          }}
          style={{ opacity: 0.6 }}
        />
      ))}
    </div>
  </motion.div>
);