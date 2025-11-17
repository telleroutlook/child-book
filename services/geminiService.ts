
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
let chatInstance: Chat | null = null;

const imageGenerationConfig = {
    numberOfImages: 1,
    outputMimeType: 'image/jpeg',
    aspectRatio: '1:1' as const,
};

const PROMPT_STYLE = "simple, cute cartoon style for a child's coloring book, very thick and clean black outlines, black and white, no color, no shading, minimal background.";

export const generateColoringPages = async (theme: string, childName: string) => {
    // Generate 5 distinct subjects related to the theme
    const subjectPrompt = `List 5 distinct and simple subjects for a children's coloring book about "${theme}". Examples: a single character, an object, a simple scene. Just the list, comma separated.`;
    
    const subjectResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: subjectPrompt,
    });

    const subjects = subjectResponse.text.split(',').map(s => s.trim()).slice(0, 5);

    const coverPrompt = `Coloring book cover for a child named "${childName}". The theme is "${theme}". The title should say "${childName}'s Coloring Book". ${PROMPT_STYLE}`;
    
    const pagePrompts = subjects.map(subject => 
        `Coloring book page featuring a ${subject}. The theme is "${theme}". ${PROMPT_STYLE}`
    );

    const allPrompts = [coverPrompt, ...pagePrompts];

    return allPrompts.map(prompt => ({
        prompt,
        generationPromise: ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: imageGenerationConfig,
        }),
    }));
};

export const getChatbotResponse = async (message: string): Promise<string> => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a friendly and creative helper for a children's coloring book app. Keep your answers short, fun, and kid-friendly."
            }
        });
    }

    try {
        const result = await chatInstance.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Chatbot error:", error);
        return "Oops! I'm having a little trouble thinking right now. Please try again in a moment!";
    }
};
