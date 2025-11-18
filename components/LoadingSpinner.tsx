
import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };
    
    const dotSizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };
    
    return (
        <div className="flex justify-center items-center" role="status" aria-label="Loading">
            <div className="relative">
                <div className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full animate-spin border-t-rose-500`}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={`${dotSizeClasses[size]} bg-rose-500 rounded-full animate-ping`}></div>
                </div>
            </div>
            <span className="sr-only">Loading...</span>
        </div>
    );
};
