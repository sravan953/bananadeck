import React, { useState } from 'react';
import { MainCanvas } from './components/Canvas/MainCanvas';
import { UrlInput } from './components/UrlInput/UrlInput';

interface Presentation {
  style: {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    font: string;
  };
  slides: Array<{
    id: string;
    title: string;
    content: string[];
    infographicSuggestion?: string;
    imageUrl?: string;
  }>;
}

function App() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlsSubmit = async (urls: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate presentation');
      }

      const data = await response.json();
      setPresentation(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate presentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MainCanvas presentation={presentation} />
      {!presentation && <UrlInput onUrlsSubmit={handleUrlsSubmit} />}
    </div>
  );
}

export default App;