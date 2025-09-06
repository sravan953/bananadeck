import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { SlideCanvas } from './components/SlideCanvas';
import { Loader } from './components/Loader';
import { Slideshow } from './components/Slideshow';
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

  const [isSlideshowVisible, setIsSlideshowVisible] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  const currentSlides = viewMode === ViewMode.EXPANDED_VIEW ? expandedSlides : mainDeck;

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

  // Keyboard navigation for slideshow
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSlideshowVisible) return;

      if (event.key === 'ArrowRight') {
        setSlideshowIndex(prev => (prev + 1) % currentSlides.length);
      } else if (event.key === 'ArrowLeft') {
        setSlideshowIndex(prev => (prev - 1 + currentSlides.length) % currentSlides.length);
      } else if (event.key === 'Escape') {
        setIsSlideshowVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSlideshowVisible, currentSlides.length]);


  const handleGenerate = useCallback(async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setLoadingMessage('Crafting presentation structure...');
    setPresentation(null);
    setViewMode(ViewMode.MAIN_DECK);
    setMainDeck([]);
    setExpandedSlides([]);

    try {
      const result = await generateSlideStructure(files);
      
      setPresentation(result);
      setMainDeck(result.slides); // Show text-based slides first

      // Generate images sequentially, updating the UI for each completed slide.
      for (let i = 0; i < result.slides.length; i++) {
        setLoadingMessage(`Generating slide visual ${i + 1} of ${result.slides.length}...`);
        try {
          const imageUrl = await generateSlideImage(result.slides[i], result.style);
          // Use a functional update to add the new image URL to the correct slide.
          // This ensures the UI updates immediately after each image is ready.
          setMainDeck(currentSlides =>
            currentSlides.map(slide =>
              slide.id === result.slides[i].id ? { ...slide, imageUrl } : slide
            )
          );
        } catch (imageError) {
            console.error(`Failed to generate image for slide ${i + 1}:`, imageError);
            // Optionally, you could update the slide to show an error state here.
        }
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

      // Generate images for the expanded view progressively.
      for (let i = 0; i < newSlides.length; i++) {
          setLoadingMessage(`Generating expanded visual ${i + 1} of ${newSlides.length}...`);
          try {
            const imageUrl = await generateSlideImage(newSlides[i], presentation.style);
             // Use a functional update to add the new image URL to the correct expanded slide.
            setExpandedSlides(currentSlides =>
              currentSlides.map(s =>
                s.id === newSlides[i].id ? { ...s, imageUrl } : s
              )
            );
          } catch (imageError) {
              console.error(`Failed to generate image for expanded slide ${i + 1}:`, imageError);
          }
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

  const handleStartSlideshow = () => {
    if (currentSlides.length > 0) {
      setSlideshowIndex(0);
      setIsSlideshowVisible(true);
    }
  };


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
          onStartSlideshow={handleStartSlideshow}
        />
        {isSlideshowVisible && presentation && (
          <Slideshow 
            slides={currentSlides}
            style={presentation.style}
            currentIndex={slideshowIndex}
            onClose={() => setIsSlideshowVisible(false)}
            onNext={() => setSlideshowIndex(prev => (prev + 1) % currentSlides.length)}
            onPrev={() => setSlideshowIndex(prev => (prev - 1 + currentSlides.length) % currentSlides.length)}
          />
        )}
      </main>
    </div>
  );
};

export default App;