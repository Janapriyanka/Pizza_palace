/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

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

  if (error || !src) {
    const name = pizzaName || alt || 'Delicious Pizza';
    const isVeg = 
      name.toLowerCase().includes('veggie') || 
      name.toLowerCase().includes('cheese') || 
      name.toLowerCase().includes('margherita') || 
      name.toLowerCase().includes('paneer') || 
      name.toLowerCase().includes('garden') || 
      name.toLowerCase().includes('truffle');
    
    // Choose an emoji based on keywords in Pizza Name or ingredients
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

    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gradient-to-br ${
          isVeg 
            ? 'from-emerald-500/10 via-emerald-500/5 to-teal-500/10 text-emerald-500' 
            : 'from-orange-500/10 via-orange-500/5 to-red-500/10 text-orange-500'
        } border border-zinc-200/50 dark:border-white/5 rounded-xl shrink-0 overflow-hidden font-sans select-none ${className || 'w-16 h-16'}`}
      >
        <div className="text-2xl filter drop-shadow animate-pulse">{emoji}</div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
