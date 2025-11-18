
import React, { useState, useCallback } from 'react';
import { SparklesIcon } from './icons';

interface InputFormProps {
    onGenerate: (theme: string, name: string) => void;
    isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
    const [theme, setTheme] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<{ theme?: string; name?: string }>({});

    const validateInput = useCallback((value: string, field: 'theme' | 'name'): string | undefined => {
        const trimmed = value.trim();
        
        if (field === 'theme') {
            if (!trimmed) return 'Theme is required';
            if (trimmed.length < 3) return 'Theme must be at least 3 characters';
            if (trimmed.length > 100) return 'Theme must be less than 100 characters';
            if (!/^[a-zA-Z0-9\s\-'.]+$/.test(trimmed)) {
                return 'Theme contains invalid characters';
            }
        } else if (field === 'name') {
            if (!trimmed) return 'Child name is required';
            if (trimmed.length < 1) return 'Name must be at least 1 character';
            if (trimmed.length > 50) return 'Name must be less than 50 characters';
            if (!/^[a-zA-Z0-9\s\-'.]+$/.test(trimmed)) {
                return 'Name contains invalid characters';
            }
        }
        
        return undefined;
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, field: 'theme' | 'name') => {
        const value = e.target.value;
        
        if (field === 'theme') {
            setTheme(value);
        } else {
            setName(value);
        }
        
        // Clear error for this field when user starts typing
        setErrors(prev => ({ ...prev, [field]: undefined }));
    }, []);

    const handleBlur = useCallback((field: 'theme' | 'name') => {
        const value = field === 'theme' ? theme : name;
        const error = validateInput(value, field);
        setErrors(prev => ({ ...prev, [field]: error }));
    }, [theme, name, validateInput]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        const themeError = validateInput(theme, 'theme');
        const nameError = validateInput(name, 'name');
        
        setErrors({
            theme: themeError,
            name: nameError
        });
        
        if (!themeError && !nameError) {
            onGenerate(theme, name);
        }
    }, [theme, name, validateInput, onGenerate]);

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-rose-100 space-y-4">
            <div className="space-y-2">
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Coloring Book Theme</label>
                <input
                    id="theme"
                    type="text"
                    value={theme}
                    onChange={(e) => handleInputChange(e, 'theme')}
                    onBlur={() => handleBlur('theme')}
                    placeholder="e.g., Space Dinosaurs"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500 bg-white text-gray-900 placeholder-gray-400 ${
                        errors.theme ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading}
                    aria-invalid={errors.theme ? 'true' : 'false'}
                    aria-describedby={errors.theme ? 'theme-error' : 'theme-help'}
                    maxLength={100}
                />
                <p id="theme-help" className="text-xs text-gray-500">Enter a fun theme for the coloring book (minimum 3 characters)</p>
                {errors.theme && (
                    <p id="theme-error" className="text-xs text-red-600 mt-1">{errors.theme}</p>
                )}
            </div>
            <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Child's First Name</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g., Alex"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500 bg-white text-gray-900 placeholder-gray-400 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={isLoading}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : 'name-help'}
                    maxLength={50}
                />
                <p id="name-help" className="text-xs text-gray-500">The child's name will appear on the cover (minimum 1 character)</p>
                {errors.name && (
                    <p id="name-error" className="text-xs text-red-600 mt-1">{errors.name}</p>
                )}
            </div>
            <button
                type="submit"
                disabled={isLoading || !!errors.theme || !!errors.name}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:bg-rose-300 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 ease-in-out shadow-md"
                aria-busy={isLoading ? 'true' : 'false'}
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