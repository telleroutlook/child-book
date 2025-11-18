
import React, { useState, useCallback } from 'react';
import type { GeneratedImage } from '../types';

interface ImageGridProps {
    images: GeneratedImage[];
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
    if (!images || images.length === 0) {
        return null;
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Coloring book pages">
            {images.map((image, index) => (
                <ImageCard key={`${image.alt}-${index}`} image={image} index={index} />
            ))}
        </div>
    );
};

interface ImageCardProps {
    image: GeneratedImage;
    index: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, index }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isImageError, setIsImageError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 2;
    
    const handleImageError = useCallback(() => {
        if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            setIsImageLoaded(false);
            setTimeout(() => {
                setIsImageError(false);
            }, 500 * (retryCount + 1));
        } else {
            setIsImageError(true);
        }
    }, [retryCount]);
    
    const validateImageSrc = useCallback((src: string): boolean => {
        if (!src || typeof src !== 'string') {
            return false;
        }
        
        if (!src.startsWith('data:image/')) {
            console.warn('Invalid image source format');
            return false;
        }
        
        return true;
    }, []);
    
    const isValidSrc = validateImageSrc(image.src);
    
    return (
        <div 
            className="bg-white p-4 rounded-lg shadow-md border border-rose-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-rose-500 focus-within:ring-offset-2" 
            role="listitem"
            tabIndex={0}
        >
            {!isImageLoaded && !isImageError && isValidSrc && (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-md" role="status" aria-label="Loading image">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                    <span className="sr-only">Loading image...</span>
                </div>
            )}
            
            {!isValidSrc && (
                <div className="w-full h-64 flex items-center justify-center bg-red-50 rounded-md border border-red-200">
                    <div className="text-center p-2">
                        <p className="text-red-600 text-sm font-medium">Invalid image data</p>
                        <p className="text-xs text-gray-500 mt-1">Image source is corrupted</p>
                    </div>
                </div>
            )}
            
            {isImageError && (
                <div className="w-full h-64 flex items-center justify-center bg-red-50 rounded-md border border-red-200">
                    <div className="text-center p-2">
                        <p className="text-red-600 text-sm font-medium">Failed to load image</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {retryCount >= MAX_RETRIES ? 'Maximum retries reached' : 'Please try again'}
                        </p>
                    </div>
                </div>
            )}
            
            {isValidSrc && !isImageError && (
                <img 
                    src={image.src} 
                    alt={image.alt || `${index === 0 ? 'Cover' : 'Page'} ${index + 1}`} 
                    className={`w-full h-auto object-cover rounded-md aspect-square transition-opacity duration-300 ${
                        isImageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={handleImageError}
                    loading="lazy"
                />
            )}
            
            <p className="text-xs text-gray-500 mt-2 text-center font-medium">
                {index === 0 ? 'Cover Page' : `Page ${index + 1}`}
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center line-clamp-2" title={image.alt}>
                {image.alt}
            </p>
        </div>
    );
};
