import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { SlideCanvas } from './components/SlideCanvas';
import { Loader } from './components/Loader';
import type { UploadedResource, Slide, PresentationStyle, Presentation } from './types';
import { ViewMode } from './types';
import { generateSlideStructure, expandSlideConcept, generateSlideImage } from './services/geminiService';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedResource[]>([]);
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MAIN_DECK);
  const [mainDeck, setMainDeck] = useState<Slide[]>([]);
  const [expandedSlides, setExpandedSlides] = useState<Slide[]>([]);

  useEffect(() => {
    if (presentation) {
      const fontLink = document.createElement('link');
      fontLink.rel = 'stylesheet';
      fontLink.href = `https://fonts.googleapis.com/css2?family=${presentation.style.font.replace(/ /g, '+')}&display=swap`;
      document.head.appendChild(fontLink);
      
      return () => {
        document.head.removeChild(fontLink);
      }
    }
  }, [presentation]);


  const handleGenerate = useCallback(async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setLoadingMessage('Crafting presentation structure...');
    setPresentation(null);
    setViewMode(ViewMode.MAIN_DECK);
    setMainDeck([]);
    setExpandedSlides([]);

    try {
      const documentUrls = files.map(f => f.url);
      const result = await generateSlideStructure(documentUrls);
      
      setPresentation(result);
      setMainDeck(result.slides); // Show text-based slides first

      // Now generate images sequentially and update state
      const slidesWithImages = [...result.slides];
      for (let i = 0; i < slidesWithImages.length; i++) {
        setLoadingMessage(`Generating slide visual ${i + 1} of ${slidesWithImages.length}...`);
        const imageUrl = await generateSlideImage(slidesWithImages[i], result.style);
        slidesWithImages[i] = { ...slidesWithImages[i], imageUrl };
        setMainDeck([...slidesWithImages]);
      }

    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [files]);
  
  const handleExpand = useCallback(async (slide: Slide) => {
    if (!presentation || slide.id === 'placeholder') return;
    setIsLoading(true);
    try {
      setLoadingMessage(`Expanding on "${slide.title}"...`);
      const newSlides = await expandSlideConcept(slide, presentation.style);
      setExpandedSlides(newSlides);
      setViewMode(ViewMode.EXPANDED_VIEW);

      // Now generate images for the expanded view
      const expandedWithImages = [...newSlides];
      for (let i = 0; i < expandedWithImages.length; i++) {
          setLoadingMessage(`Generating expanded visual ${i + 1} of ${expandedWithImages.length}...`);
          const imageUrl = await generateSlideImage(expandedWithImages[i], presentation.style);
          expandedWithImages[i] = { ...expandedWithImages[i], imageUrl };
          setExpandedSlides([...expandedWithImages]);
      }
    } catch (error) {
       console.error(error);
       alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [presentation]);

  const handleGoBack = () => {
    setViewMode(ViewMode.MAIN_DECK);
    setExpandedSlides([]);
  };

  const currentSlides = viewMode === ViewMode.EXPANDED_VIEW ? expandedSlides : mainDeck;

  return (
    <div className="flex flex-col lg:flex-row h-screen font-sans bg-slate-800 text-slate-200">
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />
      <main className="flex-grow h-full min-w-0 relative">
        {isLoading && (
            <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm" role="status" aria-live="polite">
                <Loader message={loadingMessage} />
            </div>
        )}
        <SlideCanvas
          slides={currentSlides}
          presentationStyle={presentation?.style || null}
          isLoading={false}
          loadingMessage={loadingMessage}
          onExpand={handleExpand}
          isExpandedView={viewMode === ViewMode.EXPANDED_VIEW}
          onGoBack={handleGoBack}
        />
      </main>
    </div>
  );
};

export default App;