import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Presentation, Slide, PresentationStyle } from '../types';

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

const presentationSchema = {
    type: Type.OBJECT,
    properties: {
        style: {
            type: Type.OBJECT,
            properties: {
                primaryColor: { type: Type.STRING, description: 'A hex code for the primary color (e.g., slide background). Example: #0F172A' },
                secondaryColor: { type: Type.STRING, description: 'A hex code for the secondary accent color (e.g., borders). Example: #334155' },
                textColor: { type: Type.STRING, description: 'A hex code for the main text color. Example: #F1F5F9' },
                font: { type: Type.STRING, description: 'A recommended Google Font name. Example: Inter' },
            },
            required: ['primaryColor', 'secondaryColor', 'textColor', 'font'],
        },
        slides: {
            type: Type.ARRAY,
            description: 'An array of 5 to 7 slide objects.',
            items: slideSchema,
        },
    },
    required: ['style', 'slides'],
};

export const generateSlideStructure = async (documentSummaries: string): Promise<Presentation> => {
    const prompt = `You are an expert presentation designer, focusing on visual storytelling. Based on the following source materials: ${documentSummaries}, generate a cohesive slide deck structure.
    First, define a visual style theme.
    Then, create an array of 5-7 slides. For each slide, provide:
    1. A short, impactful title.
    2. An array of concise content bullet points.
    3. A creative 'infographicSuggestion' that visually represents the content. This is crucial for the visual design. For example: 'A timeline showing the evolution of AI' or 'A diagram comparing three different algorithms.'
    4. A unique ID string.
    Respond ONLY with a JSON object that matches the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: presentationSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Presentation;
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
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image was generated for the slide.");

    } catch (error) {
        console.error(`Error generating image for slide "${slide.title}":`, error);
        throw new Error(`Failed to generate image for slide: ${slide.title}`);
    }
};
