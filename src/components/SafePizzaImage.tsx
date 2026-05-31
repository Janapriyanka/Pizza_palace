/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

interface SafePizzaImageProps {
  src?: string;
  alt?: string;
  className?: string;
  pizzaName?: string;
  loading?: "lazy" | "eager";
  [key: string]: any;
}

export default function SafePizzaImage({ src, alt, className, pizzaName, ...props }: SafePizzaImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset loading states when src is modified
  useEffect(() => {
    setError(false);
    setLoaded(false);

    // If image is already fully loaded from cache, set loaded state immediately
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  const name = pizzaName || alt || 'Delicious Pizza';
  const isVeg = 
    name.toLowerCase().includes('veggie') || 
    name.toLowerCase().includes('cheese') || 
    name.toLowerCase().includes('margherita') || 
    name.toLowerCase().includes('paneer') || 
    name.toLowerCase().includes('garden') || 
    name.toLowerCase().includes('truffle') ||
    (!name.toLowerCase().includes('chicken') && !name.toLowerCase().includes('meat') && !name.toLowerCase().includes('sausage') && !name.toLowerCase().includes('pepperoni'));
  
  // Choose an emoji based on structural concept keywords
  let emoji = '🍕';
  if (name.toLowerCase().includes('cheese') || name.toLowerCase().includes('melty') || name.toLowerCase().includes('comfort')) {
    emoji = '🧀';
  } else if (
    name.toLowerCase().includes('chicken') || 
    name.toLowerCase().includes('meat') || 
    name.toLowerCase().includes('sausage') || 
    name.toLowerCase().includes('pepperoni') || 
    name.toLowerCase().includes('bacon')
  ) {
    emoji = '🍖';
  } else if (name.toLowerCase().includes('spicy') || name.toLowerCase().includes('volcano') || name.toLowerCase().includes('chili')) {
    emoji = '🌶️';
  } else if (name.toLowerCase().includes('truffle') || name.toLowerCase().includes('mushroom')) {
    emoji = '🍄';
  }

  const fallbackMarkup = (
    <div 
      className={`flex flex-col items-center justify-center bg-gradient-to-br ${
        isVeg 
          ? 'from-emerald-500/10 via-emerald-500/5 to-teal-500/10 text-emerald-500' 
          : 'from-orange-500/10 via-orange-500/5 to-red-500/10 text-orange-500'
      } border border-zinc-200/50 dark:border-white/5 rounded-xl shrink-0 overflow-hidden font-sans select-none w-full h-full`}
    >
      <div className="text-xl filter drop-shadow animate-pulse">{emoji}</div>
    </div>
  );

  if (error || !src) {
    return (
      <div className={`shrink-0 ${className || 'w-16 h-16'}`}>
        {fallbackMarkup}
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl ${className || 'w-16 h-16'}`}>
      {/* Visual background placeholder layer loaded until image is complete */}
      {!loaded && (
        <div className="absolute inset-0 w-full h-full z-10">
          {fallbackMarkup}
        </div>
      )}
      
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        referrerPolicy="no-referrer"
        {...props}
      />
    </div>
  );
}
