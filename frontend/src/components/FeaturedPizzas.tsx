/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PIZZAS } from '../data/pizzaData';
import PizzaCard from './PizzaCard';
import { ArrowUpRight } from 'lucide-react';

export default function FeaturedPizzas() {
  // Pull pizzas tagged isFeatured
  const featuredPizzas = PIZZAS.filter(p => p.isFeatured);

  return (
    <section id="featured-pizzas-section" className="py-20 bg-white dark:bg-[#0c0c0c] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Headline */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-16 text-center sm:text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
              Chef’s Recommendations
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white mt-2 uppercase tracking-tight">
              Popular Fan Favorites
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-lg">
              Explore the signature recipes handcrafted by our Pizzaiolo. Piled with premium, slow-cooked fillings.
            </p>
          </div>
          
          <Link
            id="featured-view-all-link"
            to="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer self-center sm:self-end"
          >
            Explore Complete Menu
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Pizza Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPizzas.map((pizza) => (
            <div id={`featured-wrapper-${pizza.id}`} key={pizza.id}>
              <PizzaCard pizza={pizza} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
