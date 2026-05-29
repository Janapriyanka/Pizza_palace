/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pizza, PizzaCustomization } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, ChefHat, Flame, BrainCircuit, Play, ShoppingBag, Terminal, Heart, Copy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface GeneratedPizza {
  name: string;
  crust: 'Classic Crust' | 'Thick Crust' | 'Thin Crust' | 'Cheese Burst';
  sauce: 'Classic Tomato' | 'Creamy White Garlic' | 'Smoky BBQ' | 'Fiery Buffalo';
  cheese: 'Mozzarella' | 'Four Cheese Blend' | 'Feta' | 'Vegan Cheese';
  toppings: string[];
  description: string;
  flavorProfile: string;
  complexityScore: number;
  estimatedPrice: number;
}

const PRESET_MOODS = [
  { text: '🌧️ Cozy Rainy Day', mood: 'Melancholy, craving warmth and heavy comforting carbs' },
  { text: '🏋️ Post-Workout Beast', mood: 'Extremely hungry, high protein, savory energy' },
  { text: '🎉 Friday Party Crowd', mood: 'High energy, adventurous, crowd pleaser, bold slices' },
  { text: '📚 Late-Night Coding', mood: 'Tired but focused, craving mental triggers, spicy kick' },
  { text: '🌸 Sunny Sunday Picnic', mood: 'Fresh, healthy, light, sweet-savory veggie energy' },
];

const PRESET_CRAVINGS = [
  { text: '🧀 Cheese Overload', craving: 'Layers of liquid cheese, extra cheesy melty pull' },
  { text: '🌶️ Extreme Spicy", Spicy Kick', craving: 'Hot chilies, jalapenos, tandoori marinades, bold heat' },
  { text: '🍯 Sweet & Savory Fusion', craving: 'Caramelized pineapple, bacon, honey drizzles, ham' },
  { text: '🧄 Garlic & Herbs Delight', craving: 'Earthy herbs, wild mushrooms, rich white garlic butter' },
];

const FUN_LOADING_MESSAGES = [
  'Proofing the neural network dough...',
  'Simmering the secret algorithm sauce...',
  'Melting logical cheese elements...',
  'Slicing vector token pepperonis...',
  'Calculating delicious flavor coordinates...',
  'Whipping up culinary artistry...',
  'Tasting spice matrices in Gemini space...'
];

export default function AIPizzaRecommender() {
  const { addToCart, addToast } = useApp();
  const navigate = useNavigate();

  const [mood, setMood] = useState('');
  const [craving, setCraving] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [result, setResult] = useState<GeneratedPizza | null>(null);
  const [isFallbackUsed, setIsFallbackUsed] = useState(false);

  // Interval rotation for funny loader text
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % FUN_LOADING_MESSAGES.length);
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Dynamic Rule-Based Local Fallback Generator
  // This guarantees perfect execution and delightful responses even if the Gemini key is missing
  const generateRuleBasedPizza = (userMood: string, userCraving: string): GeneratedPizza => {
    const combinedInput = `${userMood} ${userCraving}`.toLowerCase();
    
    let name = "🍕 The Art Brut Gourmet Special";
    let crust: GeneratedPizza['crust'] = "Classic Crust";
    let sauce: GeneratedPizza['sauce'] = "Classic Tomato";
    let cheese: GeneratedPizza['cheese'] = "Mozzarella";
    let toppings: string[] = ["Mushrooms", "Black Olives", "Red Onions"];
    let flavorProfile = "Savory & Rich";
    let score = 4;
    let price = 449;
    let description = "Our chef designed a balanced, savory blend of forest mushrooms and sliced black olives for standard gourmands.";

    if (combinedInput.includes('rain') || combinedInput.includes('cozy') || combinedInput.includes('weather') || combinedInput.includes('comfort')) {
      name = "🔥 The Cozy Fireplace Bake";
      crust = "Thick Crust";
      sauce = "Classic Tomato";
      cheese = "Four Cheese Blend";
      toppings = ["Mushrooms", "Extra Mozzarella", "Sweet Corn"];
      flavorProfile = "Comforting, Cheesy & Rich";
      score = 4;
      price = 499;
      description = "A warm, thick-dish gourmet hug piled high with four comforting cheeses and slow-baked fresh mushrooms.";
    } else if (combinedInput.includes('workout') || combinedInput.includes('protein') || combinedInput.includes('hunger') || combinedInput.includes('gym')) {
      name = "💪 The Muscle Maker Feast";
      crust = "Thick Crust";
      sauce = "Smoky BBQ";
      cheese = "Mozzarella";
      toppings = ["BBQ Chicken", "Italian Sausage", "Pepperoni", "Red Onions"];
      flavorProfile = "Heavy, Smoky & Protein-Loaded";
      score = 5;
      price = 549;
      description = "An absolute heavyweight protein feast loaded with smoky BBQ chicken cubes, dynamic sausage, and double-cured pepperoni.";
    } else if (combinedInput.includes('spicy') || combinedInput.includes('chili') || combinedInput.includes('heat') || combinedInput.includes('kick')) {
      name = "🌋 The Volcano Torch Special";
      crust = "Thin Crust";
      sauce = "Fiery Buffalo";
      cheese = "Mozzarella";
      toppings = ["Jalapenos", "Paneer Tikka", "Red Onions", "Bell Peppers"];
      flavorProfile = "Fiery, Zesty & Spicy";
      score = 5;
      price = 429;
      description = "Triggered by your craving for absolute heat, this crunchy crust is spread with fiery buffalo sauce and piled with pickled jalapenos.";
    } else if (combinedInput.includes('cheese') || combinedInput.includes('creamy') || combinedInput.includes('garlic')) {
      name = "🧀 Creamy Cheese Orbit";
      crust = "Cheese Burst";
      sauce = "Creamy White Garlic";
      cheese = "Four Cheese Blend";
      toppings = ["Extra Mozzarella", "Sweet Corn", "Mushrooms"];
      flavorProfile = "Decadent, Buttery & Garlicky";
      score = 4;
      price = 599;
      description = "Piled with extra mozzarella on top of a Cheese Burst base, elevated by rich, creamy white garlic butter cream.";
    } else if (combinedInput.includes('sweet') || combinedInput.includes('pineapple') || combinedInput.includes('fusion')) {
      name = "🍍 Aloha Fusion Paradise";
      crust = "Thin Crust";
      sauce = "Classic Tomato";
      cheese = "Feta";
      toppings = ["Pineapple", "Black Olives", "Sweet Corn", "Bell Peppers"];
      flavorProfile = "Complex Sweet & Savory";
      score = 3;
      price = 399;
      description = "A delicious controversial favorite. Caramelized golden pineapple paired with tangy feta cheese crumbs.";
    } else if (combinedInput.includes('party') || combinedInput.includes('friday') || combinedInput.includes('adventurous')) {
      name = "🎉 The Friday Night Rave";
      crust = "Cheese Burst";
      sauce = "Smoky BBQ";
      cheese = "Four Cheese Blend";
      toppings = ["Pepperoni", "Jalapenos", "Sweet Corn", "Paneer Tikka"];
      flavorProfile = "Hyper-Gourmet Multi-Textured";
      score = 5;
      price = 569;
      description = "The ultimate bold party driver. Combines spicy tandoori paneer, crisp corn, and double-cured pepperoni on cheese-burst borders.";
    } else if (combinedInput.includes('coding') || combinedInput.includes('late') || combinedInput.includes('study') || combinedInput.includes('night')) {
      name = "💻 The Midnight Stack Trace";
      crust = "Thin Crust";
      sauce = "Fiery Buffalo";
      cheese = "Mozzarella";
      toppings = ["Jalapenos", "Pepperoni", "Sweet Corn"];
      flavorProfile = "Spicy, Tangy & Brain-Boosting";
      score = 4;
      price = 449;
      description = "Keep compilation working! This crispy thin crust provides a mental reboot with spicy pepperoni and pickled jalapenos.";
    }

    return {
      name,
      crust,
      sauce,
      cheese,
      toppings,
      description,
      flavorProfile,
      complexityScore: score,
      estimatedPrice: price
    };
  };

  // Run AI/Gemini Call Proxy
  const handleGeneratePizza = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim() && !craving.trim()) {
      addToast('Please tell us what you represent or crave!', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);
    setIsFallbackUsed(false);

    try {
      const response = await fetch("/api/recommend-pizza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, cravings: craving }),
      });

      if (!response.ok) {
        throw new Error("Proxy error or missing configuration");
      }

      const data = await response.json();
      
      if (data.isFallback) {
        // Fallback inside server response due to missing API key
        throw new Error(data.message || "Server fallback activated");
      }

      setResult(data);
      addToast('Gemini has crafted a special recipe customized just for you!', 'success');
    } catch (err: any) {
      console.warn("Using smart local recipe generator fallback:", err);
      // Wait slightly to show animated transition loader
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const intelligentLocalPizza = generateRuleBasedPizza(mood, craving);
      setResult(intelligentLocalPizza);
      setIsFallbackUsed(true);
      addToast('Our local recipe master formulated a unique specialty just for you!', 'success');
    } finally {
      setLoading(false);
    }
  };

  // Add the generated special straight to cart
  const handleAddToPlate = () => {
    if (!result) return;

    const basePizzaItem: Pizza = {
      id: `ai-recommender-${Date.now()}`,
      name: result.name,
      description: result.description,
      price: result.estimatedPrice,
      image: 'https://images.unsplash.com/photo-1594007654729-407ededc414a?auto=format&fit=crop&w=600&q=80',
      category: 'Signature',
      isVeg: !result.toppings.some(t => ['Pepperoni', 'Italian Sausage', 'BBQ Chicken'].includes(t)),
      rating: 4.9,
      reviewsCount: 12,
      ingredients: [result.sauce, result.cheese, ...result.toppings],
    };

    const targetCustomization: PizzaCustomization = {
      size: 'Medium',
      crust: result.crust,
      extraCheese: result.cheese === 'Four Cheese Blend' || result.toppings.includes('Extra Mozzarella'),
      extraToppings: result.toppings,
    };

    addToCart(basePizzaItem, targetCustomization, 1);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Back Link */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/menu" id="back-to-menu-from-recommender" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white transition-colors duration-200">
          <ChevronLeft className="w-5 h-5" />
          Back to menu list
        </Link>
        <span className="text-xs font-mono px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-full flex items-center gap-1.5 font-bold">
          <BrainCircuit className="w-3.5 h-3.5" /> AI Chef Assistant
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-5 bg-white dark:bg-[#121214] border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xl">
          
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <ChefHat className="text-orange-500 w-6 h-6" />
              AI CHEF'S TABLE
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Describe your current mood or exact flavor cravings. Our AI will craft, name, and size a completely new custom pizza just for you.
            </p>
          </div>

          <form onSubmit={handleGeneratePizza} className="space-y-5">
            
            {/* Mood Entry */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-black text-gray-700 dark:text-slate-200 tracking-wider uppercase">How's your mood today?</label>
                <span className="text-[10px] text-gray-400">Select or describe</span>
              </div>
              
              <textarea
                id="mood-description-input"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g., Exhausted after complex project deployment, listening to rainy jazz music..."
                className="w-full h-20 p-3 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-black/30 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200 resize-none font-sans"
              />

              {/* Preset quick moods selection items */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PRESET_MOODS.map((p) => (
                  <button
                    id={`quick-mood-btn-${p.text.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    key={p.text}
                    type="button"
                    onClick={() => setMood(p.mood)}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-[10px] font-bold text-gray-600 dark:text-slate-300 transition-colors border border-transparent dark:border-white/5 active:scale-95 cursor-pointer"
                  >
                    {p.text.split(' ')[0]} {p.text.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Cravings Entry */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-black text-gray-700 dark:text-slate-200 tracking-wider uppercase">Any explicit cravings?</label>
                <span className="text-[10px] text-gray-400 font-mono">Taste profiles</span>
              </div>
              
              <input
                id="craving-description-input"
                type="text"
                value={craving}
                onChange={(e) => setCraving(e.target.value)}
                placeholder="e.g., sweet pineapple tang mixed with high spicy heat..."
                className="w-full p-3 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-black/30 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors duration-200 font-sans"
              />

              {/* Preset Quick Cravings Choice */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PRESET_CRAVINGS.map((p) => (
                  <button
                    id={`quick-craving-btn-${p.text.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    key={p.text}
                    type="button"
                    onClick={() => setCraving(p.craving)}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 text-[10px] font-bold text-gray-600 dark:text-slate-300 transition-colors border border-transparent dark:border-white/5 active:scale-95 cursor-pointer"
                  >
                    {p.text}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="ai-generate-submit-btn"
              type="submit"
              disabled={loading || (!mood.trim() && !craving.trim())}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-orange-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Consulting Pizza Matrix...' : 'Ask AI Chef to Bake Special'}
            </button>

          </form>

        </div>

        {/* Right Side: Showcase View */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            
            {/* If loading is active */}
            {loading && (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-8 shadow-xl min-h-[380px] flex flex-col items-center justify-center text-center"
              >
                {/* Visual baking ring spinner */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                  <ChefHat className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                
                <h3 className="text-sm font-black uppercase tracking-wider text-orange-500 animate-pulse mb-2">
                  NEURAL OVEN HEATING
                </h3>
                
                <p className="text-xs text-gray-400 font-mono transition-all duration-300">
                  {FUN_LOADING_MESSAGES[loadingMessageIndex]}
                </p>
              </motion.div>
            )}

            {/* If result is ready */}
            {!loading && result && (
              <motion.div
                key="ai-result-panel"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#121214] border border-gray-100 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl relative"
              >
                {/* Chef's signature badge overlay */}
                <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10 shadow flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-white" /> Gemini Special
                </div>

                {/* Glowing neon top stripe */}
                <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500" />

                <div className="p-6 sm:p-8">
                  {/* Category Profile */}
                  <span className="text-[10px] font-mono font-bold tracking-widest text-orange-500 uppercase px-2.5 py-1 bg-orange-500/10 rounded-full border border-orange-500/15">
                    {result.flavorProfile} Flavor
                  </span>

                  {/* Pizza Name Heading */}
                  <h2 id="ai-pizza-generated-name" className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-gray-950 dark:text-white mt-4 leading-tight">
                    {result.name}
                  </h2>

                  <p id="ai-pizza-desc" className="text-xs text-gray-500 dark:text-slate-400 mt-3 leading-relaxed border-l-3 border-orange-500/40 pl-3">
                    {result.description}
                  </p>

                  {/* Blueprint Specifications Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-b border-gray-100 dark:border-zinc-800/80 py-5 my-6">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">CRUST</p>
                      <p className="text-xs font-black text-gray-800 dark:text-white mt-1">{result.crust}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">SAUCE</p>
                      <p className="text-xs font-black text-gray-800 dark:text-white mt-1">{result.sauce}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">CHEESE</p>
                      <p className="text-xs font-black text-gray-800 dark:text-white mt-1">{result.cheese}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">COMPLEXITY</p>
                      <div className="flex items-center gap-1 mt-1 text-amber-550">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Flame key={index} className={`w-3.5 h-3.5 ${index < result.complexityScore ? 'fill-orange-500 text-orange-500' : 'text-zinc-300 dark:text-zinc-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Toppings listing drawer */}
                  <div className="mb-6">
                    <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-2">INGREDIENT COMPILATION</p>
                    <div className="flex flex-wrap gap-2">
                      {result.toppings.map((tp) => (
                        <span key={tp} className="px-3 py-1.5 bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-white/5 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-300">
                          🍕 {tp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Price display bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-black/30 p-4 border border-gray-150/50 dark:border-zinc-800/65 rounded-2xl">
                    <div className="text-left w-full sm:w-auto">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">LIVE PRICE ESTIMATE</p>
                      <p className="text-xl font-extrabold text-orange-500 tracking-tight mt-0.5">₹{result.estimatedPrice}</p>
                    </div>

                    <button
                      id="ai-add-to-plate-btn"
                      onClick={handleAddToPlate}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-orange-500/15 cursor-pointer active:translate-y-0.5 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4 animate-bounce" />
                      Add AI Creation to Plate
                    </button>
                  </div>

                  {/* Safe debug tag panel if local formulation fallback happened */}
                  {isFallbackUsed && (
                    <div className="mt-5 border border-zinc-800/40 rounded-xl p-3 bg-zinc-950 text-white/70 flex gap-2.5 items-center">
                      <Terminal className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-[10px] font-mono select-all leading-tight">
                        <strong>[System fallback active]:</strong> Formulated local Chef module. Live and secure.
                      </span>
                    </div>
                  )}

                </div>
              </motion.div>
            )}

            {/* If empty stage */}
            {!loading && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-transparent border-4 border-dashed border-gray-200 dark:border-zinc-800/80 rounded-3xl p-12 shadow-inner min-h-[420px] flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 bg-orange-500/5 rounded-full border border-orange-500/15 flex items-center justify-center text-orange-500 mb-4 shadow animate-pulse">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-gray-700 dark:text-zinc-300">
                  AWAITING CHEF INPUT
                </h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1.5 leading-relaxed">
                  Enter your mood constraints or flavor matrices on the left and tap "Ask AI Chef" to witness real culinary creation!
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
