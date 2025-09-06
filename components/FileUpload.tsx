import React, { useState, useCallback, useRef } from 'react';
import type { UploadedResource } from '../types';
import { FileIcon } from './icons/FileIcon';
import { YoutubeIcon } from './icons/YoutubeIcon';

interface FileUploadProps {
  files: UploadedResource[];
  // Fix: Corrected the type of `onFilesChange` to allow for functional updates, which is necessary for asynchronous file reading.
  onFilesChange: React.Dispatch<React.SetStateAction<UploadedResource[]>>;
  onGenerate: () => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange, onGenerate, isLoading }) => {
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddUrl = () => {
    if (url.trim()) {
      const newUrlResource: UploadedResource = {
          id: `url-${Date.now()}`,
          name: url.trim(),
          type: (url.includes('youtube.com') || url.includes('youtu.be')) ? 'youtube' : 'doc',
          url: url.trim()
      }
      onFilesChange([...files, newUrlResource]);
      setUrl('');
    }
  };

  const processFiles = useCallback((fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64Data = dataUrl.split(',')[1];
        const newFileResource: UploadedResource = {
          id: `file-${file.name}-${Date.now()}`,
          name: file.name,
          type: 'doc',
          mimeType: file.type,
          data: base64Data,
        };
        // Use a functional update to ensure we have the latest state
        onFilesChange(prevFiles => [...prevFiles, newFileResource]);
      };
      reader.readAsDataURL(file);
    });
  }, [onFilesChange]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }, [processFiles]);

  const handleDragEvents = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(event);
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(event);
    setIsDragging(false);
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };
  
  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-6 bg-slate-900 border-r border-slate-700 flex flex-col h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">1. Add Content</h2>
      
      {/* File Dropzone */}
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragEvents}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-sky-500 bg-slate-800/50' : 'border-slate-600 hover:border-sky-600'}`}
      >
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
        />
        <p className="text-slate-400">Drag & drop files here, or click to select</p>
        <p className="text-xs text-slate-500 mt-1">PDF, DOCX, TXT supported</p>
      </div>

      <div className="my-6 relative flex items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-sm">OR</span>
          <div className="flex-grow border-t border-slate-700"></div>
      </div>

      {/* URL Input */}
      <div>
        <label htmlFor="content-url" className="block text-sm font-medium text-slate-300 mb-2">Add YouTube URL</label>
        <div className="flex">
          <input
            id="content-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-grow bg-slate-800 border border-slate-600 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
          />
          <button onClick={handleAddUrl} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-r-md transition-colors text-sm">Add</button>
        </div>
      </div>

      <div className="flex-grow min-h-0 overflow-y-auto mt-6">
        {files.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Content Sources</h3>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id} className="flex items-center justify-between bg-slate-800 p-2 rounded-md text-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.type === 'youtube' ? <YoutubeIcon className="w-5 h-5 text-red-500 flex-shrink-0" /> : <FileIcon className="w-5 h-5 text-sky-400 flex-shrink-0" />}
                    <span className="truncate text-slate-300" title={file.name}>{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(file.id)} className="text-slate-500 hover:text-red-400 flex-shrink-0 ml-2">
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
