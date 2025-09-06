import React from 'react';
import { FileIcon } from './icons/FileIcon';
import { PresentationIcon } from './icons/PresentationIcon';
import { ProcessingIcon } from './icons/ProcessingIcon';

export const Placeholder: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full p-8">
      <div className="relative bg-slate-900/50 border border-amber-500/50 rounded-2xl p-8 md:p-12 lg:p-16 shadow-2xl shadow-slate-950/50 w-full max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-4">
          {/* Step 1: Document */}
          <div className="flex flex-col items-center text-center w-40">
            <FileIcon className="w-16 h-16 text-amber-500" />
            <div className="mt-4 bg-slate-800 border border-slate-700 px-3 py-1 rounded-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Initial State
              </h3>
            </div>
             <p className="text-xs text-slate-500 mt-2">The canvas is ready for your ideas.</p>
          </div>
          
          {/* Arrow 1 */}
          <div className="text-slate-600 hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
           <div className="text-slate-600 md:hidden rotate-90">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>


          {/* Step 2: Processing */}
          <div className="flex flex-col items-center text-center w-40">
            <ProcessingIcon className="w-20 h-20 text-amber-500" />
            <div className="mt-4 bg-slate-800 border border-slate-700 px-3 py-1 rounded-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Provide URLs
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-2">Add links for the AI to analyze.</p>
          </div>
          
          {/* Arrow 2 */}
          <div className="text-slate-600 hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="text-slate-600 md:hidden rotate-90">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>

          {/* Step 3: Generated Content */}
          <div className="flex flex-col items-center text-center w-40">
            <PresentationIcon className="w-16 h-16 text-amber-500" />
            <div className="mt-4 bg-slate-800 border border-slate-700 px-3 py-1 rounded-md">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Get Slides
              </h3>
            </div>
             <p className="text-xs text-slate-500 mt-2">Receive your AI-generated presentation.</p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-4 text-center">
            <p className="text-sm text-slate-400">Your generated slides will appear here. Start by adding content URLs and clicking 'Generate Slides'.</p>
        </div>
      </div>
    </div>
  );
};
