/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pizza, PizzaCustomization } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Star, Plus, Minus, X, Check, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SIZE_MULTIPLIERS, CRUST_PREMIUMS, EXTRA_TOPPING_PRICE, EXTRA_CHEESE_PRICE, AVAILABLE_TOPPINGS } from '../data/pizzaData';

interface PizzaCardProps {
  pizza: Pizza;
}

export default function PizzaCard({ pizza }: PizzaCardProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useApp();
  const [isCustomizing, setIsCustomizing] = useState(false);

  // --- LOCAL STATE FOR CUSTOMIZER ---
  const [selectedSize, setSelectedSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [selectedCrust, setSelectedCrust] = useState<'Classic Crust' | 'Thick Crust' | 'Thin Crust' | 'Cheese Burst'>('Classic Crust');
  const [extraCheese, setExtraCheese] = useState(false);
  const [extraToppings, setExtraToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const favorited = isWishlisted(pizza.id);

  // --- DYNAMIC PRICE ESTIMATE FOR DIALOG ---
  const calculateCurrentPrice = () => {
    const baseP = pizza.price;
    const sizeMultiplier = SIZE_MULTIPLIERS[selectedSize];
    const crustPremium = CRUST_PREMIUMS[selectedCrust];
    const cheesePremium = extraCheese ? EXTRA_CHEESE_PRICE : 0;
    const toppingsPremium = extraToppings.length * EXTRA_TOPPING_PRICE;

    return parseFloat(
      ((baseP * sizeMultiplier) + crustPremium + cheesePremium + toppingsPremium).toFixed(2)
    );
  };

  const itemPriceTotal = calculateCurrentPrice();

  // --- HANLDE TOPPING SELECT ---
  const toggleTopping = (topping: string) => {
    setExtraToppings(prev =>
      prev.includes(topping)
        ? prev.filter(t => t !== topping)
        : [...prev, topping]
    );
  };

  // --- SUBMIT ADD TO CART ---
  const handleAddToCart = () => {
    const customization: PizzaCustomization = {
      size: selectedSize,
      crust: selectedCrust,
      extraCheese,
      extraToppings
    };
    
    addToCart(pizza, customization, quantity);
    
    // Close modal & reset local builder state
    setIsCustomizing(false);
    setQuantity(1);
    setExtraToppings([]);
    setExtraCheese(false);
    setSelectedSize('Medium');
    setSelectedCrust('Classic Crust');
  };

  return (
    <div 
      id={`pizza-card-${pizza.id}`}
      className="group bg-white dark:bg-[#151515] rounded-3xl border border-zinc-200/50 dark:border-white/5 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-orange-500/5 hover:border-orange-500/30 transition-all duration-300 flex flex-col h-full"
    >
      {/* Pizza Thumbnail with Badges */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
        
        {/* Wishlist triggers */}
        <button
          id={`wishlist-toggle-${pizza.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(pizza.id);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/95 dark:bg-[#121214]/95 shadow-md hover:scale-110 active:scale-95 transition-all text-gray-400 hover:text-rose-500 cursor-pointer"
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4.5 h-4.5 ${favorited ? 'fill-rose-500 text-rose-500 animate-bounce' : ''}`} />
        </button>

        {/* Veg / Non-Veg Badge Indicator */}
        <span 
          id={`egg-badge-${pizza.id}`}
          className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
            pizza.isVeg 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${pizza.isVeg ? 'bg-white' : 'bg-white'}`} />
          {pizza.isVeg ? 'Veg' : 'Non-veg'}
        </span>

        {/* Food category */}
        <span className="absolute bottom-4 left-4 bg-zinc-950/80 text-orange-400 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md">
          {pizza.category}
        </span>
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col flex-grow">
        
        {/* Rating Block */}
        <div className="flex items-center gap-1 text-sm mb-2 text-zinc-400">
          <div className="flex items-center text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="ml-1 font-bold text-gray-800 dark:text-gray-100">{pizza.rating}</span>
          </div>
          <span className="text-xs text-gray-400">({pizza.reviewsCount} reviews)</span>
        </div>

        {/* Pizza Headline */}
        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white leading-snug group-hover:text-orange-500 transition-colors mb-2">
          {pizza.name}
        </h3>

        {/* Narrative Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-grow line-clamp-3">
          {pizza.description}
        </p>

        {/* Ingredients Tags preview */}
        <div className="flex flex-wrap gap-1 mb-6">
          {pizza.ingredients.slice(0, 3).map((ing, i) => (
            <span key={i} className="text-[10px] font-semibold bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md">
              {ing}
            </span>
          ))}
          {pizza.ingredients.length > 3 && (
            <span className="text-[9px] font-bold text-orange-500 self-center">
              +{pizza.ingredients.length - 3} more
            </span>
          )}
        </div>

        {/* Interactive Bottom pricing trigger */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-4 mt-auto">
          <div>
            <span className="text-xs text-gray-400">Starting at</span>
            <div className="text-xl font-black text-gray-900 dark:text-white">
              Rs. {pizza.price.toFixed(2)}
            </div>
          </div>
          
          <motion.button
            id={`open-customizer-btn-${pizza.id}`}
            onClick={() => setIsCustomizing(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Order / Customize
          </motion.button>
        </div>

      </div>

      {/* MODAL DIALOG PORTAL FOR ADVANCED SELECTIONS */}
      <AnimatePresence>
        {isCustomizing && (
          <div id={`customizer-modal-${pizza.id}`} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomizing(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Content Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="relative bg-white dark:bg-[#18181b] rounded-3xl border border-gray-100 dark:border-zinc-800/80 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col z-10"
            >
              
              {/* Header block */}
              <div className="sticky top-0 bg-white dark:bg-[#18181b] border-b border-gray-100 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                    Customize Slice
                  </h3>
                </div>
                <button
                  id={`close-customizer-dialog-${pizza.id}`}
                  onClick={() => setIsCustomizing(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-850 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pizza Intro Banner */}
              <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2 aspect-[4/3] rounded-2xl overflow-hidden relative shadow-inner">
                  <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {pizza.isVeg ? (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow">Veg</span>
                  ) : (
                    <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow">Non-veg</span>
                  )}
                </div>
                <div className="md:col-span-3 flex flex-col justify-center">
                  <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{pizza.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{pizza.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">Total recipe ingredients:</span>
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-350">{pizza.ingredients.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Specs Selectors */}
              <div className="p-6 space-y-6">
                
                {/* 1. Size multipliers selector */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-orange-500">
                    1. Select Pizza Size
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Small', 'Medium', 'Large'] as const).map((size) => {
                      const mod = size === 'Small' ? '(-20% base)' : size === 'Medium' ? '(Base standard)' : '(+30% base)';
                      return (
                        <button
                          id={`size-btn-${size}`}
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            selectedSize === size
                              ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-bold shadow-sm'
                              : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-700 dark:text-gray-300 text-sm'
                          }`}
                        >
                          <span className="text-base">{size}</span>
                          <span className="text-[9px] text-gray-400 font-normal">{mod}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Crust selection with premiums */}
                <div className="space-y-3">
                  <span className="block text-xs font-bold uppercase tracking-wider text-orange-500">
                    2. Choose Baking Crust style
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Classic Crust', 'Thick Crust', 'Thin Crust', 'Cheese Burst'] as const).map((crust) => {
                      const premium = CRUST_PREMIUMS[crust];
                      const premiumLabel = premium === 0 ? 'Free' : `+Rs. ${premium.toFixed(2)}`;
                      return (
                        <button
                          id={`crust-btn-${crust.replace(' ', '-')}`}
                          key={crust}
                          onClick={() => setSelectedCrust(crust)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex justify-between items-center ${
                            selectedCrust === crust
                              ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400 font-bold shadow-sm'
                              : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 text-xs'
                          }`}
                        >
                          <span>{crust}</span>
                          <span className="text-[10px] font-semibold bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">
                            {premiumLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Extra Cheese toggle */}
                <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-2xl flex items-center justify-between border border-gray-150/40 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Load Extra Premium Cheese?</span>
                    <span className="text-[11px] text-gray-400">Adds an extra layers of melt-in-your-mouth organic mozzarella</span>
                  </div>
                  <button
                    id="extra-cheese-toggle-btn"
                    onClick={() => setExtraCheese(!extraCheese)}
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      extraCheese
                        ? 'bg-orange-500 text-white'
                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {extraCheese && <Check className="w-3.5 h-3.5" />}
                    {extraCheese ? `Added (+Rs. ${EXTRA_CHEESE_PRICE.toFixed(2)})` : `Add (+Rs. ${EXTRA_CHEESE_PRICE.toFixed(2)})`}
                  </button>
                </div>

                {/* 4. Multi-select Extra Toppings */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="block text-xs font-bold uppercase tracking-wider text-orange-500">
                      3. Additional Gourmet Toppings (+Rs. 1.25 each)
                    </span>
                    <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {extraToppings.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_TOPPINGS.map((topping) => {
                      const isAdded = extraToppings.includes(topping);
                      return (
                        <button
                          id={`topping-btn-${topping.replace(' ', '-')}`}
                          key={topping}
                          onClick={() => toggleTopping(topping)}
                          className={`p-2.5 rounded-xl border text-center text-xs transition-all cursor-pointer inline-flex items-center justify-between ${
                            isAdded
                              ? 'bg-[#121214] dark:bg-orange-500/15 border-orange-500 text-orange-600 dark:text-orange-400 font-bold'
                              : 'bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <span className="truncate">{topping}</span>
                          {isAdded && <Check className="w-3 h-3 text-orange-500 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Sticky bottom Action pricing & adding block */}
              <div className="sticky bottom-0 bg-white dark:bg-[#18181b] w-full border-t border-gray-100 dark:border-zinc-800/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
                
                {/* Quantity adjustments */}
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 p-1.5 rounded-2xl shadow-sm">
                  <button
                    id="decrease-custom-qty-btn"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-gray-900 dark:text-white px-2 text-sm">{quantity}</span>
                  <button
                    id="increase-custom-qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Adding button with price sum */}
                <motion.button
                  id="add-customized-pizza-to-cart-btn"
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                  className="w-full sm:w-auto flex-1 flex items-center justify-between gap-4 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  <span className="text-sm">Add custom pizza to plate</span>
                  <span className="text-base font-extrabold bg-orange-600 px-3 py-1 rounded-xl">
                    Rs. {(itemPriceTotal * quantity).toFixed(2)}
                  </span>
                </motion.button>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
