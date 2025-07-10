import React from 'react';

const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ImageWithFallback = ({ src, alt, fallbackSrc, ...props }) => {
  const handleImageError = (e) => {
    const fallback = fallbackSrc || `${BASE_URL}/api/placeholder/400/300`;
    if (e.target.src !== fallback) {
      e.target.src = fallback;
    }
  };

  const getImageSrc = () => {
    if (!src) return fallbackSrc || `${BASE_URL}/api/placeholder/400/300`;
    if (src.startsWith('http')) return src;
    if (src.startsWith('/uploads/')) return src;
    return src;
  };

  return <img src={getImageSrc()} alt={alt} onError={handleImageError} {...props} />;
};

export default ImageWithFallback;
