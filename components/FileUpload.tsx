import React, { useState, useCallback, useRef } from 'react';
import type { UploadedFile } from '../types';
import { FileIcon } from './icons/FileIcon';
import { YoutubeIcon } from './icons/YoutubeIcon';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange, onGenerate, isLoading }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({ name: file.name, type: 'file' as const }));
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleAddUrl = () => {
    if (youtubeUrl.trim() && (youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be'))) {
      onFilesChange([...files, { name: youtubeUrl.trim(), type: 'url' }]);
      setYoutubeUrl('');
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({ name: file.name, type: 'file' as const }));
      onFilesChange([...files, ...newFiles]);
      e.dataTransfer.clearData();
    }
  }, [files, onFilesChange]);

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };
  
  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-6 bg-slate-900 border-r border-slate-700 flex flex-col h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">1. Add Content</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${isDragging ? 'border-sky-500 bg-sky-900/20' : 'border-slate-600 hover:border-sky-600'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-slate-400">Drag & drop files here, or click to select</p>
        <p className="text-xs text-slate-500 mt-1">(PDFs, DOCs, etc.)</p>
      </div>

      <div className="my-6">
        <label htmlFor="youtube-url" className="block text-sm font-medium text-slate-300 mb-2">Or add a YouTube URL</label>
        <div className="flex">
          <input
            id="youtube-url"
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-grow bg-slate-800 border border-slate-600 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
          />
          <button onClick={handleAddUrl} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-r-md transition-colors text-sm">Add</button>
        </div>
      </div>

      <div className="flex-grow min-h-0 overflow-y-auto">
        {files.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Content Sources</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-slate-800 p-2 rounded-md text-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.type === 'file' ? <FileIcon className="w-5 h-5 text-sky-400 flex-shrink-0" /> : <YoutubeIcon className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    <span className="truncate text-slate-300" title={file.name}>{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(index)} className="text-slate-500 hover:text-red-400 flex-shrink-0 ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      
      <div className="mt-auto pt-6">
        <button
          onClick={onGenerate}
          disabled={files.length === 0 || isLoading}
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:from-sky-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
        >
          {isLoading ? 'Generating...' : '✨ Generate Slides'}
        </button>
      </div>
    </div>
  );
};