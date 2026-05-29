/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock, Truck, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function HeroSection() {
  return (
    <div id="hero-banner" className="relative overflow-hidden bg-gradient-to-b from-[#0c0c0c] via-zinc-950 to-[#0c0c0c] pt-12 pb-20 md:py-28 transition-colors duration-300">
      
      {/* Background visual graphics */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-96 h-96 bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Narrative / Info Block */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-xs font-bold uppercase tracking-[0.2em] mb-3"
            >
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>New: Truffle Mushroom Series</span>
            </motion.div>
 
            {/* Display Headings */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase text-zinc-900 dark:text-white"
              >
                CRAFTING THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 italic pr-3 pb-1">
                  PERFECT SLICE
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans"
              >
                Experience authentic wood-fired pizzas made with 48-hour fermented dough and the finest imported Italian ingredients. Crafted by hand, baked to blistered perfection.
              </motion.p>
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 w-full"
            >
              <Link
                id="hero-order-now-btn"
                to="/menu"
                className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-500 rounded-lg font-bold text-white shadow-lg shadow-orange-600/10 transition-all duration-300 active:scale-95 text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2 group border border-orange-600 hover:border-orange-500"
              >
                <span>Standard Menu</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                id="hero-build-pizza-game-btn"
                to="/builder"
                className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-100 rounded-lg font-bold transition-all duration-300 active:scale-95 text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <span>Build Own Pizza</span>
              </Link>

              <Link
                id="hero-ai-recommend-center-btn"
                to="/ai-recommender"
                className="w-full sm:w-auto px-6 py-3.5 bg-zinc-950/60 hover:bg-zinc-950 border border-purple-500/40 hover:border-purple-400 text-purple-200 rounded-lg font-bold transition-all duration-300 active:scale-95 text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-transparent pointer-events-none" />
                <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:animate-pulse" />
                <span>AI Chef Table</span>
              </Link>
            </motion.div>

            {/* Micro value-prop indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-900 max-w-lg mx-auto lg:mx-0 text-left"
            >
              <div className="flex gap-2 items-center">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white">20-Min Delivery</h4>
                  <p className="text-[10px] text-gray-400">Piped hot on bikes</p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white">Eco Packing</h4>
                  <p className="text-[10px] text-gray-400">100% biodegradable</p>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white">Zero Preservatives</h4>
                  <p className="text-[10px] text-gray-400">Fresh local cheese</p>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Graphical Woodfired Pizza Hero Image Element */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Circle backdrop lights */}
            <div className="absolute inset-x-0 bottom-0 top-1/4 bg-orange-500/30 rounded-full blur-2xl opacity-40 animate-pulse" />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative max-w-sm sm:max-w-md w-full filter drop-shadow-2xl cursor-grab"
            >
              <div className="overflow-hidden rounded-full border-8 border-white dark:border-zinc-900 shadow-2xl relative z-10">
                <motion.img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80"
                  alt="Featured fresh pizza"
                  className="w-full aspect-square object-cover"
                  referrerPolicy="no-referrer"
                  whileHover={{
                    rotate: 360,
                    transition: {
                      duration: 25,
                      ease: 'linear',
                      repeat: Infinity,
                    }
                  }}
                />
              </div>
              
              {/* Overlay Interactive Badge */}
              <div className="absolute -bottom-4 -left-4 bg-zinc-950 text-white rounded-2xl p-4 shadow-xl border border-zinc-800 z-20 flex items-center gap-3">
                <span className="text-3xl">🍕</span>
                <div>
                  <p className="font-bold text-xs text-orange-400 uppercase tracking-widest">Masterpiece Pizza</p>
                  <p className="font-extrabold text-sm text-white">Starting at Rs. 399</p>
                </div>
              </div>

              {/* Spin alert icon */}
              <div className="absolute -top-4 -right-4 bg-orange-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg font-bold animate-bounce z-20">
                ⭐
              </div>
            </motion.div>

          </div>

        </div>
      </div>

    </div>
  );
}
