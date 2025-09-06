import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileIcon } from './icons/FileIcon';
import { PresentationIcon } from './icons/PresentationIcon';
import { ProcessingIcon } from './icons/ProcessingIcon';

export const Placeholder: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center h-full w-full p-8 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(37,99,235,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(37,99,235,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        <motion.div 
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px']
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(37,99,235,0.3) 0%, transparent 50%)`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>

      {/* Scanning lines effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0.1 }}
      >
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          animate={{ y: [-200, window.innerHeight + 200] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* HUD corners */}
      <div className="absolute top-4 left-4 w-20 h-20 border-l-2 border-t-2 border-blue-500/50" />
      <div className="absolute top-4 right-4 w-20 h-20 border-r-2 border-t-2 border-blue-500/50" />
      <div className="absolute bottom-4 left-4 w-20 h-20 border-l-2 border-b-2 border-blue-500/50" />
      <div className="absolute bottom-4 right-4 w-20 h-20 border-r-2 border-b-2 border-blue-500/50" />

      {/* Status indicators */}
      <div className="absolute top-8 left-8 text-xs font-mono text-blue-400">
        <div>SYSTEM: ONLINE</div>
        <div>STATUS: READY</div>
        <div className="text-blue-300/50">{time.toLocaleTimeString()}</div>
      </div>

      <div className="absolute top-8 right-8 text-xs font-mono text-blue-400 text-right">
        <div>AI MODEL: GEMINI-2.5</div>
        <div>MODE: PRESENTATION</div>
        <div className="text-blue-300/50">v1.0.0</div>
      </div>

      {/* Main content with holographic effect */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Holographic frame */}
        <div className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(147,51,234,0.1) 100%)',
            filter: 'blur(40px)'
          }}
        />
        
        <div className="relative bg-black/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-12 shadow-2xl w-full max-w-5xl">
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-2xl p-[1px] overflow-hidden">
            <motion.div
              className="absolute inset-0"
              animate={{
                background: [
                  'linear-gradient(0deg, #2563eb, #9333ea)',
                  'linear-gradient(360deg, #2563eb, #9333ea)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="absolute inset-[1px] bg-black rounded-2xl" />
          </div>

          {/* Arc reactor style element */}
          <motion.div 
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-50" />
              <div className="absolute inset-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
              <div className="absolute inset-3 bg-black rounded-full" />
              <div className="absolute inset-4 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full animate-pulse" />
            </div>
          </motion.div>

          {/* Title with glitch effect */}
          <motion.h1 
            className="text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            AI PRESENTATION ARCHITECT
          </motion.h1>

          {/* Process flow with enhanced sci-fi styling */}
          <div className="flex flex-col lg:flex-row items-center justify-around gap-8 mb-12">
            {/* Step 1 */}
            <motion.div 
              className="flex flex-col items-center text-center relative group"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                {/* Rotating ring */}
                <motion.div 
                  className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                />
                <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-full backdrop-blur-sm border border-blue-500/50 group-hover:border-blue-400 transition-colors">
                  <FileIcon className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 bg-blue-900/30 backdrop-blur border border-blue-500/50 px-4 py-2 rounded-lg">
                <h3 className="text-sm font-bold text-blue-300">INITIALIZE</h3>
              </div>
              <p className="text-xs text-blue-400/70 mt-2 max-w-[150px]">System ready for input</p>
            </motion.div>

            {/* Energy beam connector */}
            <motion.div 
              className="hidden lg:block relative w-32 h-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              className="flex flex-col items-center text-center relative group"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="relative">
                {/* Pulsing rings */}
                <motion.div 
                  className="absolute inset-0 border-2 border-purple-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-full backdrop-blur-sm border border-purple-500/50 group-hover:border-purple-400 transition-colors">
                  <ProcessingIcon className="w-14 h-14 text-purple-400" />
                </div>
              </div>
              <div className="mt-4 bg-purple-900/30 backdrop-blur border border-purple-500/50 px-4 py-2 rounded-lg">
                <h3 className="text-sm font-bold text-purple-300">PROCESS</h3>
              </div>
              <p className="text-xs text-purple-400/70 mt-2 max-w-[150px]">AI analyzing content</p>
            </motion.div>

            {/* Energy beam connector */}
            <motion.div 
              className="hidden lg:block relative w-32 h-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                animate={{ x: [-100, 200] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              className="flex flex-col items-center text-center relative group"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative">
                {/* Holographic effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="w-24 h-24 flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-full backdrop-blur-sm border border-blue-500/50 group-hover:border-blue-400 transition-colors">
                  <PresentationIcon className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <div className="mt-4 bg-blue-900/30 backdrop-blur border border-blue-500/50 px-4 py-2 rounded-lg">
                <h3 className="text-sm font-bold text-blue-300">GENERATE</h3>
              </div>
              <p className="text-xs text-blue-400/70 mt-2 max-w-[150px]">Slides ready to expand</p>
            </motion.div>
          </div>

          {/* Call to action with holographic button */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-sm text-blue-300/70 mb-6 font-mono">
              SYSTEM AWAITING INPUT • ADD CONTENT URLS TO BEGIN SEQUENCE
            </p>
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-50 animate-pulse" />
              <button className="relative px-8 py-3 bg-black border border-blue-500 rounded-lg font-bold text-blue-300 hover:text-white hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-500/50">
                INITIALIZE SYSTEM →
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating HUD elements */}
      <motion.div 
        className="absolute bottom-8 left-8 text-xs font-mono text-blue-400/50"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div>POWER: 100%</div>
        <div>MEMORY: 2.4GB</div>
        <div>CORES: ACTIVE</div>
      </motion.div>
    </div>
  );
};