/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PIZZAS, CATEGORIES } from '../data/pizzaData';
import { useApp } from '../context/AppContext';
import PizzaCard from '../components/PizzaCard';
import { Search, SlidersHorizontal, Heart, Sparkles, Frown, UtensilsCrossed } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Menu() {
  const { wishlist } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- QUERY DECORATORS ---
  const initialCategoryParam = searchParams.get('category') || 'All';
  const initialFilterParam = searchParams.get('filter') || '';

  // --- STORES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryParam);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(initialFilterParam === 'wishlist');
  const [sortBy, setSortBy] = useState<'rating' | 'priceAsc' | 'priceDesc' | 'none'>('none');

  // Keep state synchronized when url search params modify (e.g. user clicks Navbar Wishlist button)
  useEffect(() => {
    const filter = searchParams.get('filter');
    const cat = searchParams.get('category');
    if (filter === 'wishlist') {
      setShowOnlyFavorites(true);
      setSelectedCategory('All');
    } else {
      setShowOnlyFavorites(false);
    }
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Handle category adjustment from URL
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setShowOnlyFavorites(false);
    
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    newParams.delete('filter'); // clear wishlist state
    setSearchParams(newParams);
  };

  const handleToggleFavoritesFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (!showOnlyFavorites) {
      setShowOnlyFavorites(true);
      setSelectedCategory('All');
      newParams.set('filter', 'wishlist');
      newParams.delete('category');
    } else {
      setShowOnlyFavorites(false);
      newParams.delete('filter');
    }
    setSearchParams(newParams);
  };

  // --- FILTERING AND SORTING SCHEMES ---
  const filteredPizzas = PIZZAS.filter((pizza) => {
    // 1. Search Query matching
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      pizza.name.toLowerCase().includes(query) ||
      pizza.description.toLowerCase().includes(query) ||
      pizza.ingredients.some(ing => ing.toLowerCase().includes(query));

    // 2. Category matching
    const matchesCategory = selectedCategory === 'All' || pizza.category === selectedCategory;

    // 3. Favorites wishlist matching
    const matchesFavorites = !showOnlyFavorites || wishlist.includes(pizza.id);

    return matchesSearch && matchesCategory && matchesFavorites;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating; // High to Low
    }
    if (sortBy === 'priceAsc') {
      return a.price - b.price; // Low to High
    }
    if (sortBy === 'priceDesc') {
      return b.price - a.price; // High to Low
    }
    return 0; // Default ordering
  });

  return (
    <motion.div
      id="menu-page-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="py-10 bg-zinc-50 dark:bg-[#0c0c0c] min-h-screen transition-colors duration-300 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Head Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <UtensilsCrossed className="w-8 h-8 text-orange-500 mx-auto mb-3 animate-pulse" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
            Our Culinary Pizza Craft
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            Every pizza custom made, cooked in a 500°C brick kiln. Filter, sort, and add your favorite slices to start your feast!
          </p>
        </div>

        {/* Searching & Sliders Tool Segment */}
        <div className="bg-white dark:bg-[#151515] border border-zinc-200/50 dark:border-white/5 p-5 rounded-3xl shadow-md gap-4 flex flex-col md:flex-row md:items-center justify-between mb-8">
          
          {/* Dynamic Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="menu-search-input"
              type="text"
              placeholder="Search by name, category, toppings (mushrooms, pepperoni, chicken)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-2xl text-xs focus:outline-none focus:border-orange-500 dark:text-white transition-all text-gray-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sorting List dropdown */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-black/40 px-3 py-2 rounded-2xl border border-zinc-200/50 dark:border-white/5 font-medium">
              <SlidersHorizontal className="w-4 h-4 text-orange-500 shrink-0" />
              <select
                id="menu-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-gray-700 dark:text-gray-300 font-bold focus:outline-none cursor-pointer pr-4"
              >
                <option value="none" className="bg-white dark:bg-[#151515]">Sort: Default</option>
                <option value="rating" className="bg-white dark:bg-[#151515]">Sort: Rating</option>
                <option value="priceAsc" className="bg-white dark:bg-[#151515]">Sort: Price Low-High</option>
                <option value="priceDesc" className="bg-white dark:bg-[#151515]">Sort: Price High-Low</option>
              </select>
            </div>

            {/* View Favorites button */}
            <button
              id="menu-filter-favorites-btn"
              onClick={handleToggleFavoritesFilter}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                showOnlyFavorites
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                  : 'bg-zinc-50 dark:bg-black/40 border-zinc-200/50 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${showOnlyFavorites ? 'fill-white' : 'text-rose-500'}`} />
              Favorites ({wishlist.length})
            </button>
          </div>

        </div>

        {/* Dynamic Category Filtering Chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              id={`category-filter-btn-${cat.toLowerCase()}`}
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                selectedCategory === cat && !showOnlyFavorites
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15 scale-105'
                  : 'bg-white dark:bg-[#151515] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic Active Header Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span>
              {showOnlyFavorites ? '💖 Saved Favorites' : `${selectedCategory} Slices`}
            </span>
            <span className="text-[10px] font-black bg-gray-200 dark:bg-zinc-800 px-2.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{filteredPizzas.length} matches</span>
          </h2>
          {sortBy !== 'none' && (
            <span className="text-xs text-orange-500 font-bold active:animate-ping">Sorting applied!</span>
          )}
        </div>

        {/* Result grid or empty screen */}
        <AnimatePresence mode="popLayout">
          {filteredPizzas.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredPizzas.map((pizza) => (
                <motion.div
                  id={`menu-item-card-wrapper-${pizza.id}`}
                  key={pizza.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PizzaCard pizza={pizza} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#18181b] p-12 text-center rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 max-w-md mx-auto"
            >
              <Frown className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-extrabold text-gray-800 dark:text-white">
                No Pizza Slices Found
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                We couldn't find any results match your filter/search parameters. Try adjusting keywords or clearing tags!
              </p>
              
              <button
                id="menu-reset-filters-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setShowOnlyFavorites(false);
                  setSortBy('none');
                }}
                className="mt-6 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
