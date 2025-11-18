
import React from 'react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-rose-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>
                </div>
            </div>
        </div>
    );
};
