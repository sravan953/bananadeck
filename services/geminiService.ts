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
        
        // Fix: Removed explicit Part[] type to allow for type inference.
        const contentParts = [
            { text: prompt }
        ];

        for (const file of uploadedFiles) {
            if (file.data && file.mimeType) {
                contentParts.push({
                    inlineData: {
                        mimeType: file.mimeType,
                        data: file.data,
                    }
                });
            }
        }
        
        console.log(`Sending request to Gemini with ${contentParts.length - 1} documents.`);
        
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

// Fix: Refactored the entire function to use the correct `generateImages` API instead of `generateContent`.
export const generateSlideImage = async (slide: Omit<Slide, 'id'>, style: PresentationStyle): Promise<string> => {
    const prompt = `Generate a single, visually compelling presentation slide image (16:9 aspect ratio) that functions as an infographic. The slide should be professional, clean, and adhere to a consistent visual theme.

    **System-Level Style Mandate (Apply to all slides):**
    - **Theme:** Dark, futuristic, and professional, suitable for a tech conference.
    - **Color Palette:** Use this palette strictly. Background: ${style.primaryColor}. Accent: ${style.secondaryColor}. Text/Data: ${style.textColor}.
    - **Typography:** Use a clean, legible, sans-serif font like '${style.font}' for any necessary text labels. Text should be minimal.
    - **Overall Feel:** Modern, data-driven, and easy to understand at a glance.

    **Slide-Specific Content & Infographic Task:**
    - **Main Title:** The slide must have the title: "${slide.title}"
    - **Infographic Goal:** Create an infographic that visually represents the following concept: "${slide.infographicSuggestion || 'A general visual representation of the key points.'}"
    - **Core Information to Visualize:** The infographic should convey these key points:
      ${slide.content.map(point => `- ${point}`).join('\n      ')}

    **Execution Instructions:**
    - **Prioritize Visuals over Text:** Do NOT just write the bullet points on the slide. Instead, transform them into a visual graphic (e.g., charts, diagrams, icons with labels, flowcharts).
    - **Layout:** The title should be prominent. The infographic should be the central focus.
    - **Final Output:** Generate ONLY the image of the slide. Do not add any extra text, logos, or watermarks. The final output must be a single image.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        
        throw new Error("No image was generated for the slide.");

    } catch (error) {
        console.error(`Error generating image for slide "${slide.title}":`, error);
        throw new Error(`Failed to generate image for slide: ${slide.title}`);
    }
};
