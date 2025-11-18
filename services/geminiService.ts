
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use the correct environment variable name as defined in vite.config.ts
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please check your .env file.");
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>'"&]/g, '');
};

const PROMPT_STYLE = "simple, cute cartoon style for a child's coloring book, very thick and clean black outlines, black and white, no color, no shading, minimal background.";

export const generateColoringPages = async (theme: string, childName: string) => {
    // Validate inputs
    if (!theme || !childName) {
        throw new Error("Both theme and child name are required");
    }
    
    const sanitizedTheme = sanitizeInput(theme);
    const sanitizedChildName = sanitizeInput(childName);
    
    if (!sanitizedTheme || !sanitizedChildName) {
        throw new Error("Invalid input: theme and child name cannot be empty after sanitization");
    }
    
    if (sanitizedTheme.length < 3 || sanitizedTheme.length > 100) {
        throw new Error("Theme must be between 3 and 100 characters");
    }
    
    if (sanitizedChildName.length < 1 || sanitizedChildName.length > 50) {
        throw new Error("Child name must be between 1 and 50 characters");
    }

    // Generate 5 distinct subjects related to the theme
    const subjectPrompt = `List 5 distinct and simple subjects for a children's coloring book about "${sanitizedTheme}". Examples: a single character, an object, a simple scene. Just the list, comma separated.`;
    
    try {
        const subjectResult = await textModel.generateContent(subjectPrompt);
        const subjectResponse = await subjectResult.response;
        const subjectsText = subjectResponse.text();
        
        if (!subjectsText) {
            throw new Error("Failed to generate subjects for the theme");
        }

        let subjects = subjectText.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 5);
        
        // Ensure we have exactly 5 subjects
        if (subjects.length < 5) {
            // Generate additional subjects if needed
            const additionalCount = 5 - subjects.length;
            const additionalPrompt = `List ${additionalCount} more distinct subjects for a children's coloring book about "${sanitizedTheme}". Just the list, comma separated.`;
            const additionalResult = await textModel.generateContent(additionalPrompt);
            const additionalResponse = await additionalResult.response;
            const additionalSubjects = additionalResponse.text().split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, additionalCount);
            subjects = [...subjects, ...additionalSubjects];
        }
        
        // Fallback to generic subjects if still not enough
        if (subjects.length < 5) {
            const genericSubjects = [
                `${sanitizedTheme} character`,
                `${sanitizedTheme} scene`,
                `${sanitizedTheme} object`,
                `${sanitizedTheme} adventure`,
                `${sanitizedTheme} friend`
            ];
            subjects = [...subjects, ...genericSubjects].slice(0, 5);
        }

        const coverPrompt = `Coloring book cover for a child named "${sanitizedChildName}". The theme is "${sanitizedTheme}". The title should say "${sanitizedChildName}'s Coloring Book". ${PROMPT_STYLE}`;
        
        const pagePrompts = subjects.map(subject => 
            `Coloring book page featuring a ${subject}. The theme is "${sanitizedTheme}". ${PROMPT_STYLE}`
        );

        const allPrompts = [coverPrompt, ...pagePrompts];

        // Generate images sequentially to avoid rate limiting
        const imagePromises = allPrompts.map(prompt => ({
            prompt,
            generationPromise: imageModel.generateContent([
                { text: prompt }
            ], imageGenerationConfig)
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
        const sanitizedMessage = sanitizeInput(message);
        
        if (!sanitizedMessage || sanitizedMessage.length > 500) {
            return "Please enter a message between 1 and 500 characters.";
        }
        
        // Initialize chat with the text model
        const chat = textModel.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(sanitizedMessage);
        const response = await result.response;
        const text = response.text();
        
        // Update chat history
        chatHistory.push({ role: "user", parts: [{ text: sanitizedMessage }] });
        chatHistory.push({ role: "model", parts: [{ text: text }] });
        
        // Limit history to prevent context overflow
        if (chatHistory.length > 20) {
            chatHistory = chatHistory.slice(-20);
        }

        return text;
    } catch (error) {
        console.error("Chatbot error:", error);
        
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return "I'm not properly configured. Please check the API key settings.";
            }
            if (error.message.includes('network')) {
                return "I can't connect right now. Please check your internet connection.";
            }
            if (error.message.includes('safety')) {
                return "I can't respond to that. Please ask something else.";
            }
        }
        
        return "Oops! I'm having a little trouble thinking right now. Please try again in a moment!";
    }
};

export const clearChatHistory = (): void => {
    chatHistory = [];
};
