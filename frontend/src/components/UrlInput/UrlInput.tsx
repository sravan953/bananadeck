import React, { useState } from 'react';

interface UrlInputProps {
  onUrlsSubmit: (urls: string[]) => void;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onUrlsSubmit }) => {
  const [urls, setUrls] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urlList.length > 0) {
      onUrlsSubmit(urlList);
      setIsLoading(true);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4 w-96">
      <h3 className="text-lg font-semibold mb-2">Generate Presentation from URLs</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Enter URLs (one per line)..."
          className="w-full h-32 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || urls.trim().length === 0}
          className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Presentation'}
        </button>
      </form>
    </div>
  );
};