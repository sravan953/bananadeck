import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { useEffect, useCallback } from 'react';
import { SlideShapeUtil } from '../SlideShape/SlideShape';

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

interface MainCanvasProps {
  presentation?: Presentation | null;
}

const customShapeUtils = [SlideShapeUtil];

export function MainCanvas({ presentation }: MainCanvasProps) {
  const handleMount = useCallback((editor: Editor) => {
    if (presentation) {
      // Clear existing shapes
      editor.selectAll().deleteShapes(editor.getSelectedShapeIds());
      
      // Create slide shapes in a grid layout
      const slideWidth = 800;
      const slideHeight = 450;
      const spacing = 50;
      const columns = 3;
      
      presentation.slides.forEach((slide, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const x = col * (slideWidth + spacing) + 100;
        const y = row * (slideHeight + spacing) + 100;
        
        editor.createShape({
          type: 'slide',
          x,
          y,
          props: {
            w: slideWidth,
            h: slideHeight,
            title: slide.title,
            content: slide.content,
            imageUrl: slide.imageUrl,
            infographicSuggestion: slide.infographicSuggestion,
          },
        });
      });
      
      // Zoom to fit all slides
      editor.zoomToFit();
    }
  }, [presentation]);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw 
        shapeUtils={customShapeUtils}
        onMount={handleMount}
      />
    </div>
  );
}