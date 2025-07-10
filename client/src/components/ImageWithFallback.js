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
    if (!src) {
      return fallbackSrc || `${BASE_URL}/api/placeholder/400/300`;
    }
    if (src.startsWith('http')) {
      return src;
    }
    if (src.startsWith('/uploads/')) {
      // Use the React proxy instead of direct backend access
      return src; // This will go through the React dev server proxy
    }
    return src;
  };

  const finalSrc = getImageSrc();

  return (
    <img
      src={finalSrc}
      alt={alt}
      onError={handleImageError}
      {...props}
    />
  );
};

export default ImageWithFallback;
