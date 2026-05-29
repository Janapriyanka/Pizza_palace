/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Heart, Utensils, Sparkles, ChefHat, Flame } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  const team = [
    {
      name: 'Pietro “Chef” Romano',
      role: 'Head Pizzaiolo & Co-Founder',
      quote: 'Flour, live water, and local salt is a sacred chemistry. Never rush the dough bubbles.',
      icon: ChefHat
    },
    {
      name: 'Mariella Sacco',
      role: 'Master Pastry & Topping Curator',
      quote: 'A perfect pizza balancing fresh sweet acid tomatoes against creamy fat cheese in high heat.',
      icon: Utensils
    },
    {
      name: 'Luigi Romano',
      role: 'Operations & Biking Logistics',
      quote: 'If the courier box temperature dips below 65°C on transit, our woodfired crust suffers.',
      icon: Flame
    }
  ];

  return (
    <motion.div
      id="about-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="py-16 bg-zinc-50 dark:bg-[#0c0c0c] min-h-screen text-gray-700 dark:text-gray-200 transition-colors duration-300 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Story Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                Cultivating Italian Legacy
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-orange-500/10 text-orange-500 border border-orange-500/10">
                Started in 2026
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight uppercase tracking-tight font-sans">
              Baking Traditional Crusts With Authentic Passion
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-sans">
              Pizza Palace represents more than cheese and marinara sauce. It is a family inheritance dedicated to artisanal yeast baking, organic farm partnerships, and bringing families together. Established in 2026, we've focused on keeping pizza-making clean and traditional from day one.
            </p>
            
            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 leading-relaxed font-sans">
              We stretch each dough utilizing clean double-zero flour, spring mineral water, and sea crystals, fermenting the mixture over 2 full days. Then, we cook the pies on natural oak logs, seared inside our custom stone kilns at staggering temps.
            </p>

            <div className="flex gap-4 font-sans">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                  <Heart className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Baked With Deep Loyalty</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Award className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">Established in 2026</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl rotate-3 scale-95 blur-sm opacity-20" />
            <img
              src="https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80"
              alt="Co-founders baking pizza"
              className="w-full aspect-[4/3] object-cover rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-xl relative z-10"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Business statistics milestones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-[#151515] p-6.5 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm text-center font-sans">
            <h3 className="text-3xl font-black text-orange-500">48-Hours</h3>
            <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 mt-1 uppercase tracking-wider">Flour Yeast Fermentation</p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">No quick additives. Slow proofing means bubbly soft, exceptionally digestible authentic outer crusts.</p>
          </div>

          <div className="bg-white dark:bg-[#151515] p-6.5 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm text-center font-sans">
            <h3 className="text-3xl font-black text-orange-500">500°C HEAT</h3>
            <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 mt-1 uppercase tracking-wider">Mount Vesuvius Brick Kilns</p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">Intense thermal radiation blistering from top, bottom, and side wood logs sears mozzarella moisture perfectly.</p>
          </div>

          <div className="bg-white dark:bg-[#151515] p-6.5 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm text-center font-sans">
            <h3 className="text-3xl font-black text-orange-500">100% Organic</h3>
            <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 mt-1 uppercase tracking-wider">Local Farms Sourced</p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">Zero synthetics inside our sauce. Fresh local organic whole milk curds are shredded manually every single morning.</p>
          </div>
        </div>

        {/* Team Members List */}
        <div className="mt-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500 font-sans">Meet Our Artisans</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mt-2 uppercase tracking-tight font-sans">Our Master Topping Squad</h2>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed font-sans">
              Meet the craft masters holding the wooden paddles and tossing sourdough across the kitchen lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => {
              const MemberIcon = member.icon;
              return (
                <div id={`team-${member.name.replace(' ', '-')}`} key={member.name} className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm flex flex-col items-center text-center group font-sans">
                  <div className="w-20 h-20 rounded-full mb-4 bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center border-4 border-zinc-100 dark:border-white/5 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <MemberIcon className="w-10 h-10" />
                  </div>
                  
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{member.name}</h4>
                  <span className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">{member.role}</span>
                  
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 italic mt-3 min-h-[44px] flex items-center justify-center leading-relaxed">
                    "{member.quote}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
