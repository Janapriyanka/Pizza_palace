/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const feed = [
    {
      id: 'fb-1',
      name: 'Jessica Reynolds',
      role: 'Local Food Critic',
      rating: 5,
      feedback: 'The Classic Margherita blew me away. The crust has that beautiful authentic Neapolitan woodfired blistering, while the tomato sauce tastes fresh, sweet, and pure. Best pizza in NYC!',
      initials: 'JR'
    },
    {
      id: 'fb-2',
      name: 'David K. Chen',
      role: 'Tech Lead & Pizza Fanatic',
      rating: 5,
      feedback: 'Being a developer means eating a lot of takeout pizza. Finding Pizza Palace was a game changer. The ability to customize crust, size, and add dynamic toppings, and getting it hot in 20 minutes is next level!',
      initials: 'DC'
    },
    {
      id: 'fb-3',
      name: 'Elena Rostova',
      role: 'Lifestyle Blogger',
      rating: 5,
      feedback: 'I ordered the Truffle Mushroom Fusion and customized it with thin crust. It arrived looking gorgeous and tasted extremely professional. They use real premium oil and fresh parmesan.',
      initials: 'ER'
    }
  ];

  return (
    <section id="testimonials-block-section" className="py-20 bg-zinc-50 dark:bg-[#0c0c0c] border-t border-zinc-200/50 dark:border-white/5 transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
            Our Happy Diners
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 uppercase tracking-tight">
            What Our Patrons Say
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            Read through authentic reviews from neighborhood customers, blog columnists, and pizza enthusiasts.
          </p>
        </div>

        {/* Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feed.map((patron) => (
            <div
              id={`testimonial-${patron.id}`}
              key={patron.id}
              className="bg-white dark:bg-[#151515] p-8 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-500/10 transition-all duration-300 flex flex-col justify-between relative group"
            >
              
              {/* Decorative Quotation accent */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-orange-500/10 group-hover:text-orange-500/20 transition-colors duration-300 pointer-events-none" />

              <div className="space-y-4">
                {/* Score Stars */}
                <div className="flex text-amber-400">
                  {Array.from({ length: patron.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Narrative text */}
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                  "{patron.feedback}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3.5 mt-6 pt-4 border-t border-gray-55/60 dark:border-zinc-800/80">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-extrabold text-sm flex items-center justify-center shadow-inner shrink-0">
                  {patron.initials}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                    {patron.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">{patron.role}</p>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
