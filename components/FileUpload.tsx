import React, { useState } from 'react';
import type { UploadedResource } from '../types';
import { FileIcon } from './icons/FileIcon';
import { YoutubeIcon } from './icons/YoutubeIcon';

interface FileUploadProps {
  files: UploadedResource[];
  onFilesChange: (files: UploadedResource[]) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, onFilesChange, onGenerate, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleAddUrl = () => {
    if (url.trim()) {
      const type = (url.includes('youtube.com') || url.includes('youtu.be')) ? 'youtube' : 'doc';
      onFilesChange([...files, { url: url.trim(), type: type }]);
      setUrl('');
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };
  
  return (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-6 bg-slate-900 border-r border-slate-700 flex flex-col h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">1. Add Content</h2>
      
      <div className="mb-6">
        <label htmlFor="content-url" className="block text-sm font-medium text-slate-300 mb-2">Add Content URL</label>
        <p className="text-xs text-slate-500 mb-2">Provide public URLs for documents (PDFs, Google Docs) or YouTube videos.</p>
        <div className="flex">
          <input
            id="content-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
            placeholder="https://..."
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
                    {file.type === 'doc' ? <FileIcon className="w-5 h-5 text-sky-400 flex-shrink-0" /> : <YoutubeIcon className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    <span className="truncate text-slate-300" title={file.url}>{file.url}</span>
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