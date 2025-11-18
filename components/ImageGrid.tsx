
import React, { useState } from 'react';
import type { GeneratedImage } from '../types';

interface ImageGridProps {
    images: GeneratedImage[];
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
                <ImageCard key={index} image={image} index={index} />
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
    
    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-rose-100 transition-transform transform hover:scale-105 hover:shadow-xl">
            {!isImageLoaded && !isImageError && (
                <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-md">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
            )}
            
            {isImageError ? (
                <div className="w-full h-64 flex items-center justify-center bg-red-50 rounded-md border border-red-200">
                    <div className="text-center p-2">
                        <p className="text-red-500 text-sm">Failed to load image</p>
                        <p className="text-xs text-gray-500 mt-1">Retrying or check network</p>
                    </div>
                </div>
            ) : (
                <img 
                    src={image.src} 
                    alt={image.alt} 
                    className={`w-full h-auto object-cover rounded-md aspect-square ${isImageLoaded ? 'block' : 'hidden'}`}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => setIsImageError(true)}
                />
            )}
            
            <p className="text-xs text-gray-500 mt-2 text-center">
                {index === 0 ? 'Cover Page' : `Page ${index + 1}`}
            </p>
        </div>
    );
};
