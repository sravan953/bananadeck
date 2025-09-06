// Fix: Removed unused imports for Modality and Part, which are no longer needed after refactoring.
import { GoogleGenAI, Type } from "@google/genai";
import type { Presentation, Slide, PresentationStyle, UploadedResource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const slideSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'A unique ID for the slide' },
    title: { type: Type.STRING, description: 'The title of the slide' },
    content: {
      type: Type.ARRAY,
      description: 'An array of concise bullet points for the slide content.',
      items: { type: Type.STRING },
    },
    infographicSuggestion: {
        type: Type.STRING,
        description: "A creative suggestion for an infographic to visually represent the slide's content. E.g., 'A timeline of key events' or 'A Venn diagram comparing two concepts'."
    },
  },
  required: ['id', 'title', 'content', 'infographicSuggestion'],
};

// Fix: Added a response schema for the entire presentation to ensure reliable JSON output.
const presentationSchema = {
    type: Type.OBJECT,
    properties: {
        style: {
            type: Type.OBJECT,
            properties: {
                primaryColor: { type: Type.STRING },
                secondaryColor: { type: Type.STRING },
                textColor: { type: Type.STRING },
                font: { type: Type.STRING },
            },
            required: ['primaryColor', 'secondaryColor', 'textColor', 'font'],
        },
        slides: {
            type: Type.ARRAY,
            items: slideSchema,
        },
    },
    required: ['style', 'slides'],
};

export const generateSlideStructure = async (resources: UploadedResource[]): Promise<Presentation> => {
    
    const uploadedFiles = resources.filter(r => r.data && r.mimeType);
    const urls = resources.filter(r => r.url).map(r => r.url);

    const prompt = `You are an expert presentation designer. Your task is to generate a slide deck structure based on the content from the provided documents and URLs.
Your entire response MUST be a single, valid JSON object, without any markdown formatting, comments, or extra text.

The JSON object must have the following structure:
{
  "style": {
    "primaryColor": "string (hex code, e.g., #0F172A)",
    "secondaryColor": "string (hex code, e.g., #334155)",
    "textColor": "string (hex code, e.g., #F1F5F9)",
    "font": "string (Google Font name, e.g., Inter)"
  },
  "slides": [
    {
      "id": "string (unique ID)",
      "title": "string (short, impactful title)",
      "content": ["string", "string", "... (concise bullet points)"],
      "infographicSuggestion": "string (creative idea for a visual, e.g., 'A timeline showing the evolution of AI')"
    }
  ]
}

Analyze the provided documents (and URLs: ${urls.join(', ') || 'None'}) and generate a cohesive presentation with a visual style and 5-7 slides. Do not include any text outside of the JSON object in your response.`;

    try {
        console.log("Attempting to generate slide structure with the following resources:", resources);
        
        // Fix: The previous method of building contentParts caused a TypeScript type inference error.
        // This was because the array was initialized with only a text part, and then inlineData parts were pushed.
        // The fix is to build all parts and create the array at once, allowing TS to correctly infer the union type.
        const fileParts = uploadedFiles.map(file => ({
            inlineData: {
                mimeType: file.mimeType as string,
                data: file.data as string,
            }
        }));
        
        const contentParts = [
            { text: prompt },
            ...fileParts
        ];
        
        console.log(`Sending request to Gemini with ${fileParts.length} documents.`);
        
        // Fix: Updated model from 'gemini-2.5-pro' to 'gemini-2.5-flash' and added config to enforce JSON output.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: contentParts },
            config: {
                responseMimeType: "application/json",
                responseSchema: presentationSchema,
            }
        });

        console.log("Received raw response from Gemini:", response);
        console.log("Extracted text from response:", response.text);
        
        // Fix: Simplified JSON parsing by relying on the model's guaranteed JSON output via responseSchema.
        const jsonText = response.text.trim();
        const parsedPresentation = JSON.parse(jsonText) as Presentation;
        console.log("Successfully parsed presentation structure:", parsedPresentation);
        return parsedPresentation;
    } catch (error) {
        console.error("Error generating slide structure:", error);
        throw new Error("Failed to generate presentation. Please check the console for details.");
    }
};

export const expandSlideConcept = async (slide: Slide, presentationStyle: Presentation['style']): Promise<Slide[]> => {
    const prompt = `You are an expert presentation designer, continuing a previous task. A user wants to expand on the following slide:
    Title: "${slide.title}"
    Content: "${slide.content.join(', ')}"
    
    Generate 3-4 new, more detailed slides that dive deeper into this specific topic. Maintain the same professional tone and style.
    For each new slide, provide a unique id, a title, an array of content bullet points, and a creative 'infographicSuggestion' for a visual representation.
    The visual style is defined by: Primary: ${presentationStyle.primaryColor}, Secondary: ${presentationStyle.secondaryColor}, Font: ${presentationStyle.font}.
    Respond ONLY with a JSON object containing an array of these new slides, matching the provided schema.`;

    try {
        // Fix: Updated model from 'gemini-2.5-pro' to the recommended 'gemini-2.5-flash'.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: slideSchema
                }
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Slide[];
    } catch (error) {
        console.error("Error expanding slide concept:", error);
        throw new Error("Failed to expand slide. Please check the console for details.");
    }
};

// Updated to use Gemini 2.5 Flash Image Preview for better infographic generation
export const generateSlideImage = async (slide: Omit<Slide, 'id'>, style: PresentationStyle): Promise<string> => {
    const prompt = `Create a highly visual, professional infographic slide image (16:9 aspect ratio).

    STRICT VISUAL CONSISTENCY REQUIREMENTS:
    
    COLOR PALETTE (MUST USE EXACTLY):
    - Background: ${style.primaryColor} (use as main background color)
    - Accent/Primary Elements: ${style.secondaryColor} (use for key visual elements, charts, highlights)
    - Text/Icons: ${style.textColor} (use for ALL text and line art)
    - DO NOT introduce any other colors unless absolutely necessary for data differentiation
    
    TYPOGRAPHY RULES:
    - Title Font: ${style.font} or similar clean sans-serif, size 48-60pt, weight 600-700
    - Label Font: Same font family, size 14-18pt, weight 400-500
    - Title Position: Top 15% of slide, left-aligned with 60px left margin
    - Maintain consistent font sizes across all slides
    
    LAYOUT STANDARDS:
    - Margins: 60px on all sides
    - Title Area: Top 15% of slide height
    - Content Area: Remaining 85% for infographic
    - Grid: Use invisible 12-column grid for alignment
    - Spacing: Consistent 20px between major elements
    
    VISUAL STYLE RULES:
    - Design Language: Flat design with subtle shadows (0-4px blur, 10% opacity)
    - Icons: Line-based or filled, consistent stroke width (2-3px)
    - Charts: Clean, minimal, no 3D effects
    - Shapes: Rounded corners (8px radius) for containers
    - Lines: 2px stroke for dividers and connectors
    - Transparency: Use ${style.secondaryColor} at 20% opacity for backgrounds of data containers
    
    INFOGRAPHIC CONTENT:
    Title: "${slide.title}"
    
    Visualization Type: ${slide.infographicSuggestion || 'Create a visual diagram, chart, or flowchart'}
    
    Data Points to Visualize:
    ${slide.content.map((point, i) => `${i + 1}. ${point}`).join('\n    ')}
    
    EXECUTION CHECKLIST:
    ✓ Background is exactly ${style.primaryColor}
    ✓ All major visual elements use ${style.secondaryColor}
    ✓ All text and icons are ${style.textColor}
    ✓ Title is prominent and consistently positioned
    ✓ Visual elements align to an invisible grid
    ✓ Design matches previous slides in the deck
    ✓ Focus on data visualization, not text
    ✓ Professional, conference-ready quality
    
    Generate a single slide that maintains perfect visual consistency with other slides while effectively visualizing the data as an infographic.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{ text: prompt }],
        });

        // Extract the generated image from the response
        if (response && response.candidates && response.candidates[0]) {
            const candidate = response.candidates[0];
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    }
                }
            }
        }
        
        throw new Error("No image was generated for the slide.");

    } catch (error) {
        console.error(`Error generating image for slide "${slide.title}":`, error);
        throw new Error(`Failed to generate image for slide: ${slide.title}`);
    }
};