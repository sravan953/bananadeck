import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
    <p className="mt-6 text-lg font-semibold text-slate-300">{message}</p>
    <div className="w-64 mt-4 bg-slate-700 rounded-full h-2.5">
      <div className="bg-sky-500 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
    </div>
  </div>
);