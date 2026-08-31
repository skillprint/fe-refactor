import React, { useState, useEffect, ImgHTMLAttributes } from 'react';

interface FallbackImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function FallbackImage({ 
  src, 
  fallbackSrc = '/assets/logos/skillprint-favicon-customer.svg',
  ...props 
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  return (
    <img
      {...props}
      src={hasError ? fallbackSrc : imgSrc}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}
