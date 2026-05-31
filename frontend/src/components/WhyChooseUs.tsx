/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Bike, Leaf, Zap, HelpCircle } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      id: 'prop-1',
      icon: <Award className="w-8 h-8 text-orange-500" />,
      title: 'Crafted Pizzaiolos',
      description: 'Our chefs are trained in traditional Neapolitan styles, stretching each dough by hand with surgical balance and patience.'
    },
    {
      id: 'prop-2',
      icon: <Bike className="w-8 h-8 text-amber-500" />,
      title: 'Turbo Hot Delivery',
      description: 'We pack your freshly baked pizza in double-layer thermal boxes, maintaining the baking crispness straight to your couch.'
    },
    {
      id: 'prop-3',
      icon: <Leaf className="w-8 h-8 text-emerald-500" />,
      title: '100% Organic Products',
      description: 'From imported San Marzano tomatoes to freshly harvested basil and milk mozzarella, no synthesized preservative touches our stove.'
    },
    {
      id: 'prop-4',
      icon: <Zap className="w-8 h-8 text-red-500" />,
      title: '500°C Brick Stone Ovens',
      description: 'Our wood-fired brick stoves reach optimal high baking temperature, searing our toppings and blistering the crust within 90 seconds.'
    }
  ];

  return (
    <section id="why-choose-us-section" className="py-20 bg-white dark:bg-[#0c0c0c] border-y border-zinc-200/50 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Our Quality Standards
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-905 dark:text-white mt-2 leading-tight uppercase tracking-tight">
            Why Food Lovers Rove To <br />Our Pizza Palace
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Every slice goes through a rigorous process of creation, keeping the pizza hot and full of traditional rustic flavour.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat) => (
            <div
              id={`why-choose-${feat.id}`}
              key={feat.id}
              className="bg-zinc-50 dark:bg-[#151515] p-6.5 rounded-3xl border border-zinc-200/50 dark:border-white/5 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-500/10 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="p-4 bg-orange-50 dark:bg-orange-500/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0">
                {feat.icon}
              </div>
              <h3 className="font-extrabold text-gray-900 dark:text-white mb-2 text-base">
                {feat.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Dynamic numerical counter grid block for project visual polish */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14 pt-10 border-t border-gray-100 dark:border-zinc-800 text-center">
          <div>
            <div className="text-3xl font-black text-orange-500">12+</div>
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Years Active</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-500">80k+</div>
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Happy Eaters</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-500">22+</div>
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Artisan Recipes</div>
          </div>
          <div>
            <div className="text-3xl font-black text-orange-500">20 Mins</div>
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Average Delivery</div>
          </div>
        </div>

      </div>
    </section>
  );
}
