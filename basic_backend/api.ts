import express from 'express';
import cors from 'cors';
import { generateSlideStructure, generateSlideImage } from './geminiService';
import type { Presentation } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/generate-presentation', async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    // Generate presentation structure using URLs directly
    const presentation = await generateSlideStructure(urls);

    // Generate images for each slide
    const slidesWithImages = await Promise.all(
      presentation.slides.map(async (slide) => {
        try {
          const imageUrl = await generateSlideImage(slide, presentation.style);
          return { ...slide, imageUrl };
        } catch (error) {
          console.error(`Failed to generate image for slide ${slide.id}:`, error);
          return slide;
        }
      })
    );

    const finalPresentation: Presentation = {
      ...presentation,
      slides: slidesWithImages
    };

    res.json(finalPresentation);
  } catch (error) {
    console.error('Error generating presentation:', error);
    res.status(500).json({ error: 'Failed to generate presentation' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});