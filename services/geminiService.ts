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

    const prompt = `You are an expert visual presentation designer specializing in infographic-heavy slides. Create a presentation structure that prioritizes VISUAL STORYTELLING over text.

Your response must be a single JSON object matching this structure:
{
  "style": {
    "primaryColor": "#000000",
    "secondaryColor": "#2563EB",
    "textColor": "#FFFFFF",
    "font": "Inter"
  },
  "slides": [
    {
      "id": "string",
      "title": "string (MAX 5 WORDS - catchy, memorable)",
      "content": ["string", "string", "string (MAX 3 POINTS, each MAX 8 WORDS)"],
      "infographicSuggestion": "string (DETAILED visualization description)"
    }
  ]
}

CRITICAL RULES:
1. MINIMAL TEXT: Titles should be 2-5 words. Content points should be 3-8 words each.
2. MAXIMUM 3 bullet points per slide - less is better!
3. VISUAL FIRST: The infographicSuggestion should be DETAILED and specific:
   - Describe the exact type of chart/diagram/visual
   - Mention specific data points or relationships to show
   - Suggest visual metaphors or creative representations
   - Think: "What would make someone understand this WITHOUT reading?"

GOOD infographicSuggestion examples:
- "Circular flow diagram showing 3 interconnected gears labeled 'Data', 'AI', 'Insights' with arrows showing continuous flow"
- "Mountain climb visualization with 5 milestone flags showing project phases, with a figure at 60% completion"
- "Tree diagram where trunk is 'Core Technology' branching into 3 main features, each with 2-3 sub-features as leaves"

Analyze the provided content (URLs: ${urls.join(', ') || 'None'}) and create 5-7 HIGHLY VISUAL slides where the infographic tells the story, not the text.`;

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
        
        // Mark all main deck slides as expandable
        parsedPresentation.slides = parsedPresentation.slides.map(slide => ({
            ...slide,
            isExpandable: true
        }));
        
        console.log("Successfully parsed presentation structure:", parsedPresentation);
        return parsedPresentation;
    } catch (error) {
        console.error("Error generating slide structure:", error);
        throw new Error("Failed to generate presentation. Please check the console for details.");
    }
};

export const expandSlideConcept = async (slide: Slide, presentationStyle: Presentation['style'], expansionType: 'technical' | 'business' | 'examples' | 'questions' = 'technical'): Promise<Slide[]> => {
    const expansionInstructions = {
        technical: "Focus on technical implementation details, architecture, methodologies, and deep technical concepts. Include diagrams for system architecture, data flows, or technical processes.",
        business: "Focus on business impact, ROI, strategic implications, market opportunities, and stakeholder benefits. Include charts for metrics, timelines, or business models.",
        examples: "Provide concrete case studies, real-world applications, success stories, and practical demonstrations. Include comparison charts or before/after visualizations.",
        questions: "Anticipate and answer common questions, address potential concerns, clarify misconceptions, and provide FAQs. Include decision trees or Q&A flowcharts."
    };

    const prompt = `Create a VISUAL EXPANSION of a slide - this is our key innovation! Each expansion tells a deeper visual story.
    
    PARENT SLIDE:
    Title: "${slide.title}"
    Key Points: ${slide.content.join(', ')}
    Parent Visual: "${slide.infographicSuggestion || 'General visualization'}"
    
    EXPANSION TYPE: ${expansionType.toUpperCase()}
    ${expansionInstructions[expansionType]}
    
    Generate 3-4 expansion slides with MINIMAL TEXT and MAXIMUM VISUAL IMPACT:
    
    CRITICAL RULES:
    1. VISUAL STORYTELLING: Each slide's infographic should tell the story
    2. MINIMAL TEXT: Titles max 4 words, content max 3 points of 6 words each
    3. VISUAL CONTINUITY: Reference the parent slide's visual metaphor
       - If parent shows a tree, zoom into branches
       - If parent shows a flow, detail each step
       - If parent shows connections, explore each node
       - ALWAYS use black background (#000000) and blue (#2563EB) as primary visual color
    
    For each slide:
    - id: unique string
    - title: 2-4 word hook
    - content: MAX 3 bullet points, 6 words each
    - infographicSuggestion: DETAILED description including:
      * Exact visualization type (e.g., "Sankey diagram", "Circular timeline")
      * How it connects to parent visual
      * Specific data/elements to show
      * Visual metaphor continuation
    
    GOOD EXPANSION EXAMPLES:
    Parent: "AI Evolution" (timeline visual)
    → Expansion 1: "Neural Networks Deep Dive" (zoomed timeline segment showing neural net evolution)
    → Expansion 2: "Transformer Architecture" (exploded view of one timeline point)
    → Expansion 3: "Real Applications" (timeline branches showing use cases)
    
    Make each expansion slide a visual masterpiece that needs minimal text to understand!`;

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
export const generateSlideImage = async (slide: Omit<Slide, 'id'>, _style: PresentationStyle, options?: { isExpandable?: boolean; isExpanded?: boolean; parentSlide?: string; depth?: number }): Promise<string> => {
    
    const depthContext = options?.isExpanded ? 
        `This is an expanded view (Level ${options.depth}) from "${options.parentSlide}". Include a small "L${options.depth}" badge.` : "";

    const prompt = `Create a stunning, modern infographic slide (SQUARE 1:1 aspect ratio).

    COLORS (ALWAYS USE THESE):
    - Background: #000000 (pure black)
    - Main visuals: #2563EB (vibrant blue) 
    - Text/labels: #FFFFFF (white)
    - Accent variations: #1E40AF (darker blue), #3B82F6 (lighter blue), #60A5FA (sky blue)
    - Subtle highlights: #1F2937 (dark gray) for containers/borders

    SLIDE CONTENT:
    Title: "${slide.title}" (place at top, make it prominent but not overwhelming)
    
    MAIN INFOGRAPHIC INSTRUCTION:
    ${slide.infographicSuggestion}
    
    Data to incorporate (use visually, not as text):
    ${slide.content.map(point => `- ${point}`).join('\n    ')}
    
    STYLE GUIDELINES:
    - Modern, clean, professional
    - Focus 80% on the visual, 20% on text
    - Use creative data visualization
    - Add subtle animations/effects if appropriate (glows, gradients)
    - Keep margins clear (nothing important near edges)
    - Make it visually striking and memorable
    
    ${depthContext}
    
    REMEMBER: The infographic should tell the story at a glance. Someone should understand the key message just by looking at the visual, without reading the text.`;

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