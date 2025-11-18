
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ImageGrid } from './components/ImageGrid';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Chatbot } from './components/Chatbot';
import { DownloadIcon, SparklesIcon, ChatBubbleIcon, CloseIcon } from './components/icons';
import { generateColoringPages } from './services/geminiService';
import { generatePdf } from './services/pdfService';
import type { GeneratedImage } from './types';

const App: React.FC = () => {
    const [theme, setTheme] = useState<string>('');
    const [childName, setChildName] = useState<string>('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [lastGenerated, setLastGenerated] = useState<{ theme: string; name: string } | null>(null);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccess(null);
    }, []);

    const handleGenerate = useCallback(async (theme: string, name: string) => {
        clearMessages();
        
        const trimmedTheme = theme.trim();
        const trimmedName = name.trim();
        
        if (!trimmedTheme || !trimmedName) {
            setError('Please provide both a theme and a name.');
            return;
        }
        
        if (trimmedName.length < 1 || trimmedName.length > 50) {
            setError('Child name must be between 1 and 50 characters long.');
            return;
        }
        
        if (trimmedTheme.length < 3 || trimmedTheme.length > 100) {
            setError('Theme must be between 3 and 100 characters long.');
            return;
        }
        
        const specialCharRegex = /^[a-zA-Z0-9\s\-'.]+$/;
        if (!specialCharRegex.test(trimmedName)) {
            setError('Child name contains invalid characters. Only letters, numbers, spaces, hyphens, and apostrophes are allowed.');
            return;
        }
        
        if (!specialCharRegex.test(trimmedTheme)) {
            setError('Theme contains invalid characters. Only letters, numbers, spaces, hyphens, and apostrophes are allowed.');
            return;
        }

        setIsLoading(true);
        setGeneratedImages([]);
        setTheme(trimmedTheme);
        setChildName(trimmedName);
        setLastGenerated({ theme: trimmedTheme, name: trimmedName });

        try {
            setLoadingMessage('Getting creative ideas...');
            const pages = await generateColoringPages(theme.trim(), name.trim());
            
            // Staggered loading message updates
            const messages = [
                "Sketching the cover page...",
                "Drawing the first picture...",
                "Adding details to the second page...",
                "Outlining the third illustration...",
                "Inking the fourth design...",
                "Finalizing the last page..."
            ];

            // Process images sequentially to prevent rate limiting and improve UX
            const allImages: GeneratedImage[] = [];
            const failedImages: number[] = [];
            
            for (let index = 0; index < pages.length; index++) {
                setLoadingMessage(messages[index] || `Generating page ${index + 1}...`);
                
                try {
                    const page = pages[index];
                    const result = await page.generationPromise;
                    const response = await result.response;
                    
                    // Extract image data from the response
                    let base64ImageBytes = '';
                    
                    // Try different possible response formats
                    if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
                        // Format: response.candidates[0].content.parts[0].inlineData.data
                        base64ImageBytes = response.candidates[0].content.parts[0].inlineData.data;
                    } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
                        // Sometimes the image data might be in a text field (unlikely but possible)
                        base64ImageBytes = response.candidates[0].content.parts[0].text;
                    } else {
                        // Log the actual response structure for debugging
                        console.log('Full response structure:', JSON.stringify(response, null, 2));
                        throw new Error(`Unexpected response format for page ${index + 1}. Check console for details.`);
                    }
                    
                    if (!base64ImageBytes) {
                        throw new Error(`Failed to get image data for page ${index + 1}`);
                    }
                    
                    allImages.push({
                        src: `data:image/jpeg;base64,${base64ImageBytes}`,
                        alt: page.prompt
                    });
                } catch (pageError) {
                    console.error(`Error generating page ${index + 1}:`, pageError);
                    failedImages.push(index + 1);
                    // Add a placeholder image in case of error
                    allImages.push({
                        src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="%23fef2f2"/><text x="50%" y="45%" font-family="Arial" font-size="20" fill="%23dc2626" text-anchor="middle" dominant-baseline="middle">Image ${index + 1}</text><text x="50%" y="55%" font-family="Arial" font-size="16" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">Failed to load</text></svg>`,
                        alt: `Failed to generate image for: ${pages[index].prompt}`
                    });
                }
            }

            setGeneratedImages(allImages);
            
            if (failedImages.length > 0) {
                const successCount = allImages.length - failedImages.length;
                if (successCount > 0) {
                    setSuccess(`Successfully generated ${successCount} out of ${allImages.length} pages. Pages ${failedImages.join(', ')} failed to load.`);
                } else {
                    setError('Failed to generate all images. Please try again with a different theme.');
                }
            } else {
                setSuccess(`Successfully generated ${allImages.length} pages for "${trimmedTheme}"!`);
            }
        } catch (err) {
            console.error('Generation error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong while creating the images. Please try again.';
            setError(errorMessage);
            
            if (errorMessage.includes('API key')) {
                setError('API key not configured. Please check your environment variables.');
            } else if (errorMessage.includes('rate limit')) {
                setError('Rate limit exceeded. Please wait a moment and try again.');
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, []);

    const handleDownloadPdf = useCallback(() => {
        clearMessages();
        
        if (generatedImages.length === 0) {
            setError('No images available to download. Please generate a coloring book first.');
            return;
        }
        
        try {
            generatePdf(generatedImages, childName);
            setSuccess('PDF downloaded successfully!');
        } catch (error) {
            console.error('PDF download error:', error);
            setError('Failed to download PDF. Please try again.');
        }
    }, [generatedImages, childName, clearMessages]);

    return (
        <div className="min-h-screen bg-rose-50 font-sans text-gray-800 antialiased">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-rose-800 mb-2">Create a Magical Coloring Book</h2>
                    <p className="text-gray-600 mb-8">Enter a theme and your child's name, and let our AI bring your ideas to life!</p>
                </div>
                
                <InputForm onGenerate={handleGenerate} isLoading={isLoading} />

                {error && (
                    <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg" role="alert" aria-live="polite">
                        <div className="flex items-start">
                            <span className="mr-2" aria-hidden="true">⚠️</span>
                            <span>{error}</span>
                            <button 
                                onClick={clearMessages} 
                                className="ml-auto text-red-500 hover:text-red-700"
                                aria-label="Dismiss error"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
                
                {success && (
                    <div className="max-w-3xl mx-auto mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg" role="status" aria-live="polite">
                        <div className="flex items-start">
                            <span className="mr-2" aria-hidden="true">✓</span>
                            <span>{success}</span>
                            <button 
                                onClick={clearMessages} 
                                className="ml-auto text-green-500 hover:text-green-700"
                                aria-label="Dismiss success message"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
                
                {isLoading && (
                    <div className="text-center my-12">
                        <LoadingSpinner />
                        <p className="text-lg text-rose-600 mt-4 animate-pulse">{loadingMessage}</p>
                    </div>
                )}

                {generatedImages.length > 0 && !isLoading && (
                    <div className="mt-12">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-bold text-rose-800">Your Coloring Book is Ready!</h3>
                            <button
                        onClick={handleDownloadPdf}
                        className="mt-4 inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 shadow-lg disabled:bg-green-300 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        aria-label="Download coloring book as PDF"
                    >
                                <DownloadIcon />
                                Download as PDF
                            </button>
                        </div>
                        <ImageGrid images={generatedImages} />
                    </div>
                )}

                {!isLoading && generatedImages.length === 0 && (
                    <div className="text-center text-gray-500 mt-16 p-8 bg-white rounded-xl shadow-sm max-w-2xl mx-auto border border-rose-100">
                        <SparklesIcon className="mx-auto h-16 w-16 text-rose-300" />
                        <p className="mt-4 text-lg">Your wonderful creations will appear here.</p>
                        <p className="text-sm">Try themes like "Jungle Animals on Vacation" or "Magical Unicorns in Space"!</p>
                    </div>
                )}

            </main>
            
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-transform transform hover:scale-110"
                    aria-label={isChatOpen ? "Close Chat" : "Open Chat"}
                >
                    {isChatOpen ? <CloseIcon /> : <ChatBubbleIcon />}
                </button>
            </div>
            
            <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        </div>
    );
};

export default App;
