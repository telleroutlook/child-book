
import React from 'react';
import { CrayonIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md border-b border-rose-100">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center">
                <CrayonIcon />
                <h1 className="text-2xl font-bold text-rose-600 ml-3">
                    AI Coloring Book Creator
                </h1>
            </div>
        </header>
    );
};
