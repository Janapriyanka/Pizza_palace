/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Copy, Check, TicketPercent } from 'lucide-react';
import { motion } from 'motion/react';

export default function OffersSection() {
  const { applyCoupon, couponCode } = useApp();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const activeOffers = [
    {
      code: 'PALACE50',
      tagline: '50% DEAR DISCOUNT',
      title: 'Mentor Special Celebration',
      description: 'Get an incredible 50% discount on all custom woodfired orders. Simply click apply!',
      badgeColor: 'bg-red-500 text-white',
      borderLine: 'border-red-500/20 hover:border-red-500/45'
    },
    {
      code: 'PIZZALOVER',
      tagline: '20% MIDWEEK BONANZA',
      title: 'Pizza Connoisseur’s Pick',
      description: 'Save 20% on any signature pizza crust and custom toppings combination. Valid on everything.',
      badgeColor: 'bg-orange-500 text-white',
      borderLine: 'border-orange-500/20 hover:border-orange-500/45'
    },
    {
      code: 'WELCOME10',
      tagline: '10% FIRST ORDER',
      title: 'Welcome to the Palace',
      description: 'First time tasting Pizza Palace? Take an easy 10% discount off your total orders.',
      badgeColor: 'bg-amber-500 text-white',
      borderLine: 'border-amber-500/20 hover:border-amber-500/45'
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section id="offers-promo-section" className="py-20 bg-zinc-50 dark:bg-[#0c0c0c] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <TicketPercent className="w-8 h-8 text-orange-500 mx-auto mb-3 animate-pulse" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight uppercase tracking-tight">
            Special Deals & Active Coupons
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Claim these dynamic discounts instantly to save on your artisan baking order. Apply them here or at your checkout plate.
          </p>
        </div>

        {/* Promo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeOffers.map((offer) => {
            const isApplied = couponCode === offer.code;
            const isCopied = copiedCode === offer.code;

            return (
              <div
                id={`offer-card-${offer.code.toLowerCase()}`}
                key={offer.code}
                className={`relative bg-white dark:bg-[#151515] p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                  isApplied
                    ? 'border-orange-500 shadow-lg shadow-orange-500/10 bg-orange-500/5 dark:bg-orange-500/5'
                    : `border-zinc-200/50 dark:border-white/5 ${offer.borderLine}`
                }`}
              >
                {isApplied && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 bg-orange-500 text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                    <Sparkles className="w-3 h-3 animate-spin" /> Applied Active
                  </span>
                )}

                <div className="space-y-4">
                  <span className={`inline-block font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider ${offer.badgeColor}`}>
                    {offer.tagline}
                  </span>
                  
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>
                </div>

                {/* Promo Coupon copy bar */}
                <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex-1 flex items-center justify-between bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 px-3 py-2 rounded-xl">
                    <code className="font-mono font-bold text-sm text-gray-800 dark:text-gray-200">{offer.code}</code>
                    
                    <button
                      id={`copy-code-${offer.code}`}
                      onClick={() => handleCopyCode(offer.code)}
                      className="text-gray-400 hover:text-orange-500 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                      title="Copy promo code"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    id={`apply-code-${offer.code}`}
                    onClick={() => applyCoupon(offer.code)}
                    disabled={isApplied}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md cursor-pointer shrink-0 ${
                      isApplied
                        ? 'bg-emerald-500 text-white shadow-emerald-500/10 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/10 hover:-translate-y-0.5'
                    }`}
                  >
                    {isApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
