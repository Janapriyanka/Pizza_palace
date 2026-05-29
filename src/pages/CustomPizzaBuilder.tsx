/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Pizza, PizzaCustomization } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RotateCcw, Trash2, Sliders, Play, Sparkles, Check, ShoppingBag, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface PlacedTopping {
  id: string;
  type: string;
  x: number; // percentage
  y: number; // percentage
  angle: number; // visual tilt
}

const TOPPINGS_PRESETS = [
  { name: 'Pepperoni', emoji: '🔴', color: '#db2777', class: 'bg-rose-600', desc: 'Spicy premium pork slices' },
  { name: 'Mushrooms', emoji: '🍄', color: '#f5f5f4', class: 'bg-stone-300', desc: 'Earthy fresh wild mushrooms' },
  { name: 'Black Olives', emoji: '🫒', color: '#1c1917', class: 'bg-zinc-900', desc: 'Gourmet sliced salty black olives' },
  { name: 'Sweet Corn', emoji: '🌽', color: '#facc15', class: 'bg-yellow-400', desc: 'Sweet golden sweetcorn kernels' },
  { name: 'Jalapenos', emoji: '🌶️', color: '#16a34a', class: 'bg-emerald-600', desc: 'Fiery pickled green slices' },
  { name: 'Pineapple', emoji: '🍍', color: '#fbbf24', class: 'bg-amber-400', desc: 'Sweet juicy caramelized cubes' },
  { name: 'Bell Peppers', emoji: '🫑', color: '#22c55e', class: 'bg-green-500', desc: 'Crisp hand-chopped peppers' },
  { name: 'Red Onions', emoji: '🧅', color: '#a855f7', class: 'bg-purple-500', desc: 'Zesty sharp purple rings' },
  { name: 'Italian Sausage', emoji: '🟤', color: '#78350f', class: 'bg-amber-900', desc: 'Savory rustic fennel sausage chunks' },
  { name: 'BBQ Chicken', emoji: '🍗', color: '#ea580c', class: 'bg-orange-600', desc: 'Smokey slow-roasted BBQ chicken' },
];

const SAUCES = [
  { name: 'Classic Tomato', color: '#dc2626', hoverColor: '#ef4444', desc: 'Rich vine-ripened tomatoes' },
  { name: 'Smoky BBQ', color: '#7c2d12', hoverColor: '#9a3412', desc: 'Sweet hickory fire-roasted sauce' },
  { name: 'Creamy White Garlic', color: '#fef08a', hoverColor: '#fef9c3', desc: 'Luscious buttery garlic cream' },
];

const CRUSTS = [
  { name: 'Classic Crust', premium: 0, desc: 'Golden hand-tossed classic crust' },
  { name: 'Thin Crust', premium: 30, desc: 'Super thin & crispy artisan style (+₹30)' },
  { name: 'Thick Crust', premium: 50, desc: 'Deep dish fluffy dough (+₹50)' },
  { name: 'Cheese Burst', premium: 99, desc: 'Stuffed with warm liquid cheddar (+₹99)' },
];

const SIZES: ('Small' | 'Medium' | 'Large')[] = ['Small', 'Medium', 'Large'];

export default function CustomPizzaBuilder() {
  const { addToCart, addToast } = useApp();
  const navigate = useNavigate();

  // Selected configurations
  const [size, setSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [crust, setCrust] = useState<typeof CRUSTS[number]>(CRUSTS[0]);
  const [sauce, setSauce] = useState<typeof SAUCES[number]>(SAUCES[0]);
  const [extraCheese, setExtraCheese] = useState(false);
  const [selectedToppingType, setSelectedToppingType] = useState<string>('Pepperoni');
  
  // Placed toppings array
  const [placedToppings, setPlacedToppings] = useState<PlacedTopping[]>([]);
  
  const pizzaCircleRef = useRef<HTMLDivElement>(null);

  // Live price calculation matching AppContext logic rules:
  // Base Medium price is 249
  const baseP = 249;
  const sizeMultiplers = { Small: 0.8, Medium: 1.0, Large: 1.3 };
  const sizeMult = sizeMultiplers[size];
  const toppingsCount = Array.from(new Set(placedToppings.map(t => t.type))).length;
  
  const calculatedPrice = parseFloat(
    (
      (baseP * sizeMult) + 
      crust.premium + 
      (extraCheese ? 69 : 0) + 
      (toppingsCount * 49)
    ).toFixed(2)
  );

  // Handle stamping topping on the dough
  const handlePizzaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pizzaCircleRef.current) return;
    
    const rect = pizzaCircleRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Convert to percentage coordinates from the center of the pizza
    const pctX = (clickX / rect.width) * 100;
    const pctY = (clickY / rect.height) * 100;
    
    // Check if the click is inside the circular dough area using Pythagorean theorem
    const dx = pctX - 50;
    const dy = pctY - 50;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    
    // Limit placing inside 44% radius of 50% max circle so it stays inside the crust
    if (distanceFromCenter > 43) {
      addToast('Keep your toppings inside the crust boundary!', 'warning');
      return;
    }
    
    const newTopping: PlacedTopping = {
      id: `top-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: selectedToppingType,
      x: pctX,
      y: pctY,
      angle: Math.random() * 360,
    };
    
    setPlacedToppings(prev => [...prev, newTopping]);
  };

  // Automated perfect sprinkle!
  const handleAutoSprinkle = () => {
    const activePreset = TOPPINGS_PRESETS.find(t => t.name === selectedToppingType);
    if (!activePreset) return;

    // Generate 8 randomly distributed toppings inside the valid radius
    const newSprinkled: PlacedTopping[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * 2 * Math.PI;
      // Distance from center between 10% and 38%
      const r = 10 + Math.random() * 28;
      const x = 50 + r * Math.cos(angle);
      const y = 50 + r * Math.sin(angle);
      
      newSprinkled.push({
        id: `top-auto-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 3)}`,
        type: selectedToppingType,
        x,
        y,
        angle: Math.random() * 360,
      });
    }

    setPlacedToppings(prev => [...prev, ...newSprinkled]);
    addToast(`Sprinkled fresh ${selectedToppingType} all over!`, 'success');
  };

  // Undo last topping action
  const handleUndo = () => {
    if (placedToppings.length === 0) return;
    setPlacedToppings(prev => prev.slice(0, -1));
  };

  // Clean whole pizza
  const handleClear = () => {
    setPlacedToppings([]);
    addToast('Crust cleared and ready for your masterpiece.', 'info');
  };

  // Submit to actual AppContext shopping cart
  const handleAddToPlate = () => {
    // Unique ingredients list from placements
    const matchedToppingsList: string[] = Array.from(new Set(placedToppings.map(t => t.type))) as string[];
    
    const customPizzaObject: Pizza = {
      id: `custom-scratch-${Date.now()}`,
      name: `Custom ${crust.name}`,
      description: `A delicious customized pizza built from scratch. Features spicy ${sauce.name} base, gooey ${extraCheese ? 'Double Mozzarella' : 'Mozzarella'} cheese, and artisanal toppings including ${matchedToppingsList.join(', ') || 'No extra toppings'}.`,
      price: baseP, // Set base standard price, unitPrice will compute fully in cart
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      category: 'Signature',
      isVeg: !matchedToppingsList.some(t => ['Pepperoni', 'Italian Sausage', 'BBQ Chicken'].includes(t)),
      rating: 5.0,
      reviewsCount: 1,
      ingredients: [sauce.name, 'Melted Mozzarella', ...matchedToppingsList],
    };

    const customCustomization: PizzaCustomization = {
      size: size,
      crust: crust.name as any,
      extraCheese: extraCheese,
      extraToppings: matchedToppingsList,
    };

    addToCart(customPizzaObject, customCustomization, 1);
    addToast('Your game-built craft masterpiece has been added to your plate!', 'success');
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Back button link */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/menu" id="back-to-menu-from-builder" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors duration-200">
          <ChevronLeft className="w-5 h-5" />
          Back to standard menu
        </Link>
        <span className="text-xs font-mono px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full animate-pulse flex items-center gap-1.5 font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Handcrafted Baking Game
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Game Canvas (Visual representation of pizza) */}
        <div className="lg:col-span-7 flex flex-col items-center bg-white dark:bg-[#121214] border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden min-h-[500px] sm:min-h-[600px] justify-between">
          
          <div className="w-full text-center mb-4">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
              CRAFT & BAKE GAME
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Select toppings below, then tap inside the crust area to stamp them!
            </p>
          </div>

          {/* Interactive Pizza Board Container */}
          <div className="relative w-full flex items-center justify-center py-6">
            
            {/* The absolute styled Board/Pan */}
            <div className="absolute w-[330px] h-[330px] sm:w-[410px] sm:h-[410px] rounded-full border-12 border-dashed border-gray-200 dark:border-zinc-800/80 bg-gray-50 dark:bg-black/20 flex items-center justify-center -z-10 shadow-inner" />
            
            {/* Interactivity Area */}
            <div 
              id="pizza-game-dough-stage"
              ref={pizzaCircleRef}
              onClick={handlePizzaClick}
              className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full cursor-crosshair select-none shadow-2xl transition-transform duration-500 aspect-square overflow-hidden border border-amber-950/20"
              style={{
                background: 'radial-gradient(circle, #fcd34d 0%, #d97706 80%, #92400e 100%)', // wheat dough crust base
                boxShadow: 'inset 0 0 25px rgba(0,0,0,0.3), 0 15px 35px rgba(0,0,0,0.25)',
              }}
            >
              {/* Golden Outer Crust Ring */}
              <div className="absolute inset-2 sm:inset-3 rounded-full border-[10px] border-amber-500/20 pointer-events-none" />

              {/* Dynamic Sauce Layer relative to selected state */}
              <motion.div 
                className="absolute inset-[15px] sm:inset-[22px] rounded-full opacity-90 transition-colors duration-500 pointer-events-none"
                style={{
                  backgroundColor: sauce.color,
                  boxShadow: 'inset 0 0 15px rgba(0,0,0,0.25)',
                }}
                layoutId="sauceLayer"
              />

              {/* Dynamic White melted Mozzarella Cheese layer */}
              <motion.div 
                className="absolute inset-[24px] sm:inset-[32px] rounded-full opacity-80 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, #fffbeb 50%, #fef9c3 85%, #fde047 100%)',
                  borderRadius: '50%',
                  filter: 'blur(3px)',
                }}
                animate={{ scale: extraCheese ? 1.02 : 0.98 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />

              {/* Small toasted spot layers for realism */}
              <div className="absolute top-1/4 left-1/3 w-6 h-4 bg-orange-850/10 rounded-full filter blur-[1px] pointer-events-none" />
              <div className="absolute bottom-1/3 right-1/4 w-8 h-5 bg-orange-900/10 rounded-full filter blur-[1px] pointer-events-none" />
              <div className="absolute top-1/2 right-1/3 w-4 h-3 bg-stone-900/10 rounded-full filter blur-[1px] pointer-events-none" />

              {/* Placed Interactive Toppings Stamped */}
              <AnimatePresence>
                {placedToppings.map((topping) => {
                  const presetObj = TOPPINGS_PRESETS.find(tp => tp.name === topping.type);
                  return (
                    <motion.div
                      key={topping.id}
                      initial={{ scale: 0, opacity: 0, rotate: topping.angle - 45 }}
                      animate={{ scale: 1, opacity: 1, rotate: topping.angle }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 12 }}
                      className="absolute w-8 h-8 flex items-center justify-center select-none pointer-events-none text-xl z-20"
                      style={{
                        left: `${topping.x}%`,
                        top: `${topping.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {/* Realistic graphic representation */}
                      {presetObj?.emoji === '🔴' ? (
                        <div className="w-5 h-5 rounded-full bg-red-600 border border-red-800 shadow-md flex items-center justify-center overflow-hidden">
                          <div className="absolute w-1 h-1 bg-red-900 rounded-full top-1 left-2" />
                          <div className="absolute w-1.2 h-1.2 bg-red-850 rounded-full bottom-1 left-1.5" />
                          <div className="absolute w-0.8 h-0.8 bg-red-900 rounded-full top-2 right-1" />
                        </div>
                      ) : presetObj?.emoji === '🫒' ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-zinc-950 border border-zinc-800 shadow-sm flex items-center justify-center">
                          <div className="w-1 h-1 bg-amber-950 rounded-full" />
                        </div>
                      ) : presetObj?.emoji === '🟤' ? (
                        <div className="w-4 h-4 rounded-full bg-amber-900 border border-amber-950 shadow-sm skew-x-3 rotate-45" />
                      ) : presetObj?.emoji === '⬜' || presetObj?.name === 'Paneer Tikka' ? (
                        <div className="w-4.5 h-4.5 bg-yellow-100 border border-orange-400 rounded shadow-sm rotate-12 flex items-center justify-center">
                          <div className="w-2 h-2 bg-orange-500/20 rounded-full" />
                        </div>
                      ) : (
                        <span className="drop-shadow-md select-none">{presetObj?.emoji}</span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

            </div>
          </div>

          {/* Action Tools and Indicators */}
          <div className="w-full flex justify-between gap-4 border-t border-gray-150 dark:border-zinc-800 pt-5 mt-4">
            <div className="flex gap-2">
              <button
                id="undo-topping-btn"
                onClick={handleUndo}
                disabled={placedToppings.length === 0}
                className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Undo last topping placement"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Undo
              </button>
              
              <button
                id="clear-all-toppings-btn"
                onClick={handleClear}
                disabled={placedToppings.length === 0}
                className="px-3.5 py-2 rounded-xl bg-rose-50/50 hover:bg-rose-50 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-rose-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Remove all toppings"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-gray-400 font-mono">PLACEMENTS</p>
              <p id="toppings-stamped-count" className="text-sm font-black text-orange-500">{placedToppings.length} elements</p>
            </div>
          </div>

        </div>

        {/* Right Side: Options Shelf */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Baking Recipe Configuration Box */}
          <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xl">
            <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              1. Base configuration
            </h2>

            {/* Size Selector */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 dark:text-slate-400 block mb-2">SIZE</label>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((sz) => (
                  <button
                    id={`builder-size-btn-${sz.toLowerCase()}`}
                    key={sz}
                    onClick={() => setSize(sz)}
                    className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      size === sz
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-gray-100 dark:bg-zinc-800/60 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {sz} {sz === 'Small' ? '(0.8x)' : sz === 'Large' ? '(1.3x)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Crust Selector */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 dark:text-slate-400 block mb-2">CRUST STYLE</label>
              <div className="grid grid-cols-2 gap-2">
                {CRUSTS.map((cr) => (
                  <button
                    id={`builder-crust-btn-${cr.name.toLowerCase().replace(' ', '-')}`}
                    key={cr.name}
                    onClick={() => setCrust(cr)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between ${
                      crust.name === cr.name
                        ? 'bg-orange-500/10 border border-orange-500/35 text-orange-500'
                        : 'bg-gray-100 dark:bg-zinc-800/60 border border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span>{cr.name}</span>
                    <span className="text-[10px] opacity-70 block font-normal">{cr.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sauce Selector */}
            <div>
              <label className="text-xs font-bold text-gray-400 dark:text-slate-400 block mb-2">BASE KITCHEN SAUCE</label>
              <div className="grid grid-cols-3 gap-2">
                {SAUCES.map((sc) => (
                  <button
                    id={`builder-sauce-btn-${sc.name.toLowerCase().replace(' ', '-')}`}
                    key={sc.name}
                    onClick={() => setSauce(sc)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      sauce.name === sc.name
                        ? 'bg-orange-500/10 border border-orange-500/35 text-orange-500'
                        : 'bg-gray-100 dark:bg-zinc-800/60 border border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: sc.color }} />
                    <span className="text-[11px] leading-tight font-black">{sc.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Interactive Toppings Dispenser Box */}
          <div className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Play className="w-4 h-4 text-orange-500" />
                2. Select Active Topping
              </h2>
              
              {/* Extra Cheese Upgrade */}
              <button
                id="toggle-extra-cheese-builder-btn"
                onClick={() => setExtraCheese(!extraCheese)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all ${
                  extraCheese 
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500' 
                    : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 border-transparent hover:text-gray-600'
                }`}
              >
                +🧀 Extra Cheese (+₹69)
              </button>
            </div>

            {/* Topping choices grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 lg:grid-cols-2 gap-2 text-center max-h-[300px] overflow-y-auto pr-1">
              {TOPPINGS_PRESETS.map((preset) => {
                const isCurrent = selectedToppingType === preset.name;
                const placedCount = placedToppings.filter(t => t.type === preset.name).length;
                
                return (
                  <button
                    id={`builder-topping-select-${preset.name.toLowerCase().replace(' ', '-')}`}
                    key={preset.name}
                    onClick={() => setSelectedToppingType(preset.name)}
                    className={`p-3 rounded-2xl text-xs flex items-center justify-between transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-500/15 scale-[1.02]'
                        : 'bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 border-transparent text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{preset.emoji}</span>
                      <div className="text-left">
                        <p className="font-extrabold text-[11px] leading-tight">{preset.name}</p>
                        <p className={`text-[9px] opacity-75 ${isCurrent ? 'text-white' : 'text-gray-400'}`}>+₹49 to add</p>
                      </div>
                    </div>
                    {placedCount > 0 && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isCurrent ? 'bg-orange-600 text-white' : 'bg-orange-500/15 text-orange-500'}`}>
                        {placedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active tool helper action */}
            <div className="bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 rounded-2xl p-4 mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center animate-bounce">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase text-orange-500 tracking-wider">Fast-Sprinkler Tool</p>
                  <p className="text-[10px] text-gray-400">Distribute 8x {selectedToppingType} instantly</p>
                </div>
              </div>

              <button
                id="sprinkle-topping-btn"
                onClick={handleAutoSprinkle}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
              >
                Sprinkle
              </button>
            </div>

          </div>

          {/* Pricing Summary Block & Submit */}
          <div className="bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 text-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">Total Price Calculated</span>
              <span id="game-live-price-disp" className="text-2xl font-black text-orange-500">₹{calculatedPrice}</span>
            </div>

            <div className="space-y-1.5 border-t border-zinc-800 pt-3 text-xs text-gray-400 font-mono">
              <div className="flex justify-between">
                <span>Dough Base ({size}) :</span>
                <span>₹{(baseP * sizeMult).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span>{crust.name} premium :</span>
                <span>+₹{crust.premium}</span>
              </div>
              {extraCheese && (
                <div className="flex justify-between">
                  <span>Cheese Upgrade :</span>
                  <span>+₹69</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Unique Toppings Bonus ({toppingsCount}x) :</span>
                <span>+₹{toppingsCount * 49}</span>
              </div>
            </div>

            <button
              id="submit-builder-pizza-to-cart"
              onClick={handleAddToPlate}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Add craft pizza to plate
            </button>

            <span className="text-[10px] text-gray-500 text-center flex items-center gap-1 justify-center">
              <Info className="w-3 h-3" /> Includes 5% live baking GST in cart. Set up with love.
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}
