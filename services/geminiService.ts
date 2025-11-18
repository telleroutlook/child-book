
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the correct environment variable name as defined in vite.config.ts
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// For image generation
const imageModel = genAI.getGenerativeModel({ model: "imagen-4.0-generate-001" });

// For text generation and chat
const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const imageGenerationConfig = {
    numberOfImages: 1,
    outputMimeType: 'image/jpeg' as const,
    aspectRatio: '1:1' as const,
};

const PROMPT_STYLE = "simple, cute cartoon style for a child's coloring book, very thick and clean black outlines, black and white, no color, no shading, minimal background.";

export const generateColoringPages = async (theme: string, childName: string) => {
    // Validate inputs
    if (!theme || !childName) {
        throw new Error("Both theme and child name are required");
    }

    // Generate 5 distinct subjects related to the theme
    const subjectPrompt = `List 5 distinct and simple subjects for a children's coloring book about "${theme}". Examples: a single character, an object, a simple scene. Just the list, comma separated.`;
    
    try {
        const subjectResult = await textModel.generateContent(subjectPrompt);
        const subjectResponse = await subjectResult.response;
        const subjectsText = subjectResponse.text();
        
        if (!subjectsText) {
            throw new Error("Failed to generate subjects for the theme");
        }

        const subjects = subjectsText.split(',').map(s => s.trim()).slice(0, 5);
        
        // Ensure we have exactly 5 subjects
        if (subjects.length < 5) {
            // Generate additional subjects if needed
            const additionalCount = 5 - subjects.length;
            const additionalPrompt = `List ${additionalCount} more distinct subjects for a children's coloring book about "${theme}". Just the list, comma separated.`;
            const additionalResult = await textModel.generateContent(additionalPrompt);
            const additionalResponse = await additionalResult.response;
            const additionalSubjects = additionalResponse.text().split(',').map(s => s.trim()).slice(0, additionalCount);
            subjects.push(...additionalSubjects);
        }

        const coverPrompt = `Coloring book cover for a child named "${childName}". The theme is "${theme}". The title should say "${childName}'s Coloring Book". ${PROMPT_STYLE}`;
        
        const pagePrompts = subjects.map(subject => 
            `Coloring book page featuring a ${subject}. The theme is "${theme}". ${PROMPT_STYLE}`
        );

        const allPrompts = [coverPrompt, ...pagePrompts];

        // Generate images sequentially to avoid rate limiting
        const imagePromises = allPrompts.map(prompt => ({
            prompt,
            generationPromise: imageModel.generateContent([
                { text: prompt }
            ])
        }));

        return imagePromises;
    } catch (error) {
        console.error("Error generating coloring pages:", error);
        throw new Error("Failed to generate coloring book content. Please try again with a different theme.");
    }
};

let chatHistory: Array<{ role: string; parts: Array<{ text: string }> }> = [];

export const getChatbotResponse = async (message: string): Promise<string> => {
    try {
        // Initialize chat with the text model
        const chat = textModel.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        // Update chat history
        chatHistory.push({ role: "user", parts: [{ text: message }] });
        chatHistory.push({ role: "model", parts: [{ text: text }] });
        
        // Limit history to prevent context overflow
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }

        return text;
    } catch (error) {
        console.error("Chatbot error:", error);
        return "Oops! I'm having a little trouble thinking right now. Please try again in a moment!";
    }
};
