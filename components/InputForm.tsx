
import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface InputFormProps {
    onGenerate: (theme: string, name: string) => void;
    isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
    const [theme, setTheme] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(theme, name);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-rose-100 space-y-4">
            <div className="space-y-2">
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Coloring Book Theme</label>
                <input
                    id="theme"
                    type="text"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., Space Dinosaurs"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 bg-white text-gray-900 placeholder-gray-400"
                    required
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Child's First Name</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Alex"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 bg-white text-gray-900 placeholder-gray-400"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:bg-rose-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Magic...
                    </>
                ) : (
                    <>
                        <SparklesIcon />
                        Generate Coloring Book
                    </>
                )}
            </button>
        </form>
    );
};