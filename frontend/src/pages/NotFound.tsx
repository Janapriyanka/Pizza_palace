/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, ChefHat } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <motion.div
      id="not-found-page"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="py-16 md:py-24 bg-zinc-50 dark:bg-zinc-950 min-h-[80vh] flex items-center justify-center text-center transition-colors px-4 text-zinc-700 dark:text-zinc-200"
    >
      <div className="bg-white dark:bg-[#18181b] p-10 max-w-lg rounded-3xl border border-gray-150/45 dark:border-zinc-800 shadow-2xl space-y-6">
        
        {/* Chef head with pizza slice */}
        <div className="relative inline-flex items-center justify-center p-5 bg-orange-100 dark:bg-orange-500/10 text-orange-500 rounded-full">
          <ChefHat className="w-16 h-16 text-orange-500 animate-pulse" />
          <span className="absolute bottom-2 right-2 text-3xl">🫓</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-gray-900 dark:text-white">404</h1>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">We Burnt That Page! 🔥</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed mt-2">
            The pizza slice or administrative dashboard URL you wandered into doesn't exist in our oven directories. Let's get you back to warm dough!
          </p>
        </div>

        {/* Action Link CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          <Link
            id="not-found-go-home-btn"
            to="/"
            className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow shadow-orange-500/10"
          >
            <Home className="w-4 h-4" /> Go to Home
          </Link>

          <Link
            id="not-found-go-menu-btn"
            to="/menu"
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-90 w-full hover:bg-zinc-80 px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-850 dark:text-gray-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition"
          >
            <Compass className="w-4 h-4" /> Explore Active Menu
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
