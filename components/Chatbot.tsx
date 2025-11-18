
import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { SendIcon, CloseIcon } from './icons';

interface ChatbotProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [connectionError, setConnectionError] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{
                id: 'initial',
                role: 'model',
                text: "Hi there! I'm your creative assistant. Ask me for fun coloring book ideas!"
            }])
        }
    }, [isOpen])

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setConnectionError(false);

        try {
            const responseText = await getChatbotResponse(input);
            
            const modelMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
            };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setConnectionError(true);
            
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "I'm having trouble connecting right now. Please check your internet connection and try again.",
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line in input
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([{
            id: 'initial',
            role: 'model',
            text: "Hi there! I'm your creative assistant. Ask me for fun coloring book ideas!"
        }]);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-80 h-[28rem] bg-white rounded-2xl shadow-2xl flex flex-col z-40 border border-gray-200 animate-fade-in-up">
            <header className="flex items-center justify-between p-4 bg-purple-600 text-white rounded-t-2xl">
                <h3 className="font-bold">Creative Helper</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={clearChat} 
                        className="p-1 hover:bg-purple-700 rounded-full text-xs"
                        title="Clear chat"
                    >
                        🔄
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-purple-700 rounded-full">
                        <CloseIcon />
                    </button>
                </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto bg-purple-50">
                {connectionError && (
                    <div className="mb-3 p-2 bg-yellow-100 text-yellow-800 rounded-lg text-xs text-center">
                        ⚠️ Connection issue. Please check your internet and API settings.
                    </div>
                )}
                
                {messages.map(msg => (
                    <div key={msg.id} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`py-2 px-4 rounded-2xl max-w-[80%] ${
                            msg.role === 'user' 
                                ? 'bg-purple-500 text-white rounded-br-lg' 
                                : 'bg-gray-200 text-gray-800 rounded-bl-lg'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start mb-3">
                        <div className="py-2 px-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-lg">
                           <div className="flex items-center justify-center gap-1">
                             <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                             <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                             <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex flex-col">
                    <div className="flex items-center bg-gray-100 rounded-full">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask for ideas..."
                            className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none rounded-l-full"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSend} 
                            disabled={isLoading || input.trim() === ''} 
                            className="p-2 m-1 rounded-full bg-purple-500 text-white disabled:bg-gray-300 disabled:text-gray-500"
                        >
                            <SendIcon />
                        </button>
                    </div>
                    {inputError && (
                        <p id="input-error" className="text-xs text-red-600 mt-1 text-center">{inputError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 text-center">
                        Press Enter to send ({input.trim().length}/{MAX_MESSAGE_LENGTH})
                    </p>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};