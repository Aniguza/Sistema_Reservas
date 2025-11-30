import React, { useState } from 'react';

/**
 * Componente de imagen optimizada con lazy loading
 * @param {string} src - URL de la imagen
 * @param {string} alt - Texto alternativo
 * @param {string} className - Clases CSS
 * @param {string} placeholder - Color o imagen de placeholder
 */
export const OptimizedImage = ({
    src,
    alt,
    className = '',
    placeholder = '#f3f4f6',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative ${className}`} style={{ backgroundColor: placeholder }}>
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse bg-gray-300 w-full h-full"></div>
                </div>
            )}

            {hasError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <p className="text-gray-500 text-sm">Error al cargar imagen</p>
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    {...props}
                />
            )}
        </div>
    );
};
