/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft, Ticket, Check, MapPin, Bike, Timer, ChevronRight, Phone, Flame, RotateCw, X, Table, Star, Clock, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderStatus } from '../types';

function PizzaFeedbackItemRow({
  item,
  order,
  reviews,
  submitReview
}: {
  key?: any;
  item: any;
  order: any;
  reviews: any[];
  submitReview: (orderId: string, pizzaId: string, pizzaName: string, rating: number, comment: string) => void;
}) {
  const existingReview = reviews.find(
    r => r.orderId === order.id && r.pizzaId === item.pizza.id
  );

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.length < 10) return;
    setIsSubmitting(true);
    setTimeout(() => {
      submitReview(order.id, item.pizza.id, item.pizza.name, rating, comment);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="py-4 border-t border-zinc-100 dark:border-white/5 font-sans">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-sm text-gray-800 dark:text-zinc-100 flex items-center gap-1.5">
            {item.pizza.name} <span className="text-[10px] uppercase font-bold text-orange-500">({item.customization.size})</span>
          </h4>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
            {item.customization.crust} 
            {item.customization.extraCheese ? ' • Extra Mozzarella' : ''}
            {item.customization.extraToppings.length > 0 ? ` • Toppings: ${item.customization.extraToppings.join(', ')}` : ''}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-gray-400 font-bold block">{item.quantity} Portions</span>
          <div className="text-xs font-black text-gray-950 dark:text-slate-200">Rs. {(item.unitPrice * item.quantity).toFixed(2)}</div>
        </div>
      </div>

      {existingReview ? (
        <div className="mt-3.5 p-3.5 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/15 rounded-2xl flex flex-col gap-1.5 shadow-inner">
          <div className="flex items-center gap-1.5 justify-between">
            <span className="text-[9px] text-emerald-600 dark:text-emerald-450 font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Pizzeria Review
            </span>
            <div className="flex text-amber-500 gap-0.5">
              {Array.from({ length: 5 }).map((_, sIdx) => (
                <Star
                  key={sIdx}
                  className={`w-3.5 h-3.5 ${
                    sIdx < existingReview.rating
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-zinc-300 dark:text-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-800 dark:text-zinc-200 font-semibold italic">
            "{existingReview.comment || 'Crisp and bubbling hot!'}"
          </p>
        </div>
      ) : order.status === 'Delivered' ? (
        <form onSubmit={handleSubmitReview} className="mt-4 bg-zinc-100/50 dark:bg-black/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-white/5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Rate Sourdough Flavor
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const starVal = index + 1;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(starVal)}
                    className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4.5 h-4.5 transition-all ${
                        starVal <= rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-gray-300 dark:text-neutral-800'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              required
              minLength={10}
              placeholder="Tell our brick chefs what you liked! Was the cheese melt premium? crust crispy? (min. 10 chars)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-white dark:bg-[#09090a] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none dark:text-white text-zinc-900 focus:border-orange-500 leading-normal font-sans"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || comment.length < 10}
              className="px-4.5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm"
            >
              Post Baked Review
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3.5 px-3.5 py-2.5 bg-amber-500/5 border border-dashed border-amber-500/10 rounded-xl text-[10px] text-[#cca044] font-bold flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Feedback rating option unlocks immediately upon successful delivery plating!
        </div>
      )}
    </div>
  );
}

export default function Cart() {
  const {
    cart,
    cartCount,
    subtotal,
    tax,
    deliveryFee,
    discount,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
    couponCode,
    discountPercentage,
    applyCoupon,
    removeCoupon,
    activeOrder,
    placeOrder,
    cancelActiveOrder,
    advanceOrderStatus,
    ordersList,
    reviews,
    submitReview,
    currentUser
  } = useApp();

  // --- LOCAL INPUTS ---
  const [couponInput, setCouponInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [addressError, setAddressError] = useState('');
  const [simulatedCheckoutStep, setSimulatedCheckoutStep] = useState<'review' | 'details'>('review');
  const [orderType, setOrderType] = useState<'Delivery' | 'DineIn'>('Delivery');
  const [tableNumber, setTableNumber] = useState('5');
  const [isPlacing, setIsPlacing] = useState(false);

  const [activeTab, setActiveTab] = useState<'plate' | 'history' | 'live'>(() => {
    return activeOrder ? 'live' : 'plate';
  });

  const [selectedLiveOrderId, setSelectedLiveOrderId] = useState<string | null>(null);
  const liveOrdersList = ordersList.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');

  // Auto-focus active order whenever one becomes live
  useEffect(() => {
    if (liveOrdersList.length > 0) {
      setActiveTab('live');
      if (!selectedLiveOrderId || !liveOrdersList.some(o => o.id === selectedLiveOrderId)) {
        setSelectedLiveOrderId(liveOrdersList[0].id);
      }
    } else {
      setSelectedLiveOrderId(null);
    }
  }, [ordersList]);

  // --- COUPON ACTIONS ---
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput);
    setCouponInput('');
  };

  // --- PLACE ORDER TRIGGER ---
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderType === 'Delivery' && (!addressInput.trim() || addressInput.length < 10)) {
      setAddressError('Please provide a complete shipping address (minimum 10 characters).');
      return;
    }
    setAddressError('');
    setIsPlacing(true);
    
    try {
      const success = await placeOrder(addressInput, orderType, tableNumber);
      if (success) {
        // Reset steps
        setSimulatedCheckoutStep('review');
        setAddressInput('');
        setActiveTab('live');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlacing(false);
    }
  };

  // --- SPEED SIMULATOR WRITER ---
  const handleSpeedUpSimulator = () => {
    const targetOrder = liveOrdersList.find(o => o.id === selectedLiveOrderId) || activeOrder;
    if (!targetOrder) return;
    const stages: OrderStatus[] = ['Received', 'Preparing', 'Baking', 'Quality Check', 'Ready', 'Out for Delivery', 'Delivered'];
    const currentIndex = stages.indexOf(targetOrder.status);
    if (currentIndex !== -1 && currentIndex < stages.length - 1) {
      const nextStatus = stages[currentIndex + 1];
      advanceOrderStatus(targetOrder.id, nextStatus);
    }
  };

  // --- UNIFIED TABS DEFINITION & SELECTIONS ---

  // --- REGULAR SHOPPING CART DISPLAY ---
  return (
    <motion.div
      id="shopping-cart-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="py-12 bg-zinc-50 dark:bg-[#0c0c0c] min-h-screen transition-colors duration-300 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-zinc-200 dark:border-white/10 mb-8 overflow-x-auto gap-2">
          <button
            id="tab-btn-plate"
            onClick={() => setActiveTab('plate')}
            className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'plate'
                ? 'border-orange-500 text-orange-500 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-gray-350 font-bold'
            }`}
          >
            🛒 My Culinary Plate ({cartCount})
          </button>
          
          {activeOrder ? (
            <button
              id="tab-btn-live"
              onClick={() => setActiveTab('live')}
              className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'live'
                  ? 'border-emerald-500 text-emerald-500 font-extrabold'
                  : 'border-transparent text-[#cca044] hover:text-gray-300 font-bold'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              🔥 Live Cooking Tracker ({activeOrder.status})
            </button>
          ) : (
            <button
              id="tab-btn-live-empty"
              onClick={() => setActiveTab('live')}
              className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'live'
                  ? 'border-orange-500 text-orange-500 font-extrabold'
                  : 'border-transparent text-gray-400 hover:text-gray-300 font-bold'
              }`}
            >
              🔥 Live Kitchen Tracker
            </button>
          )}

          <button
            id="tab-btn-history"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-orange-500 text-orange-500 font-extrabold'
                : 'border-transparent text-gray-400 hover:text-gray-350 font-bold'
            }`}
          >
            📜 Historic Orders & Reviews ({ordersList.length})
          </button>
        </div>

        {activeTab === 'plate' ? (
          <>
            {/* Header summary */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Your Culinary Plate</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-1.5 uppercase tracking-tight">
              Confirm Order Slices
            </h1>
            <p className="text-xs text-gray-400 mt-2 max-w-lg leading-relaxed">
              Check recipe parameters, apply coupons, and checkout to stream live woodfired baking tracker!
            </p>
          </div>
          {cart.length > 0 && (
            <button
              id="clear-entire-cart-btn"
              onClick={clearCart}
              className="text-xs font-bold text-gray-400 hover:text-rose-500 self-start md:self-end transition-colors cursor-pointer"
            >
              Clear Entire Plate
            </button>
          )}
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 1. Left Column: list of cart products */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white dark:bg-[#151515] rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md overflow-hidden">
                <div className="p-6 divide-y divide-zinc-100 dark:divide-white/5">
                  {cart.map((item) => (
                    <div
                      id={`cart-row-item-${item.id}`}
                      key={item.id}
                      className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 group"
                    >
                      {/* Image + customizations and ingredients */}
                      <div className="flex gap-4 items-start sm:items-center">
                        <img
                          src={item.pizza.image}
                          alt={item.pizza.name}
                          className="w-16 h-16 object-cover rounded-xl border border-zinc-200/50 dark:border-white/5 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{item.pizza.name}</h4>
                            <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-0.5 rounded-full font-black uppercase">
                              {item.customization.size}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-gray-400 mt-0.5 font-medium leading-relaxed">
                            Crust: <span className="text-zinc-600 dark:text-zinc-350 font-bold">{item.customization.crust}</span>
                            {item.customization.extraCheese && ' • Extra Mozzarella'}
                            {item.customization.extraToppings.length > 0 && ` • Extra: ${item.customization.extraToppings.join(', ')}`}
                          </p>
                        </div>
                      </div>

                      {/* Adjuster controls, unit value, and removal button */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-white/5">
                        {/* Adjuster */}
                        <div className="flex items-center bg-gray-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 p-1 rounded-xl">
                          <button
                            id={`decrease-qty-${item.id}`}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-400 hover:text-orange-500 cursor-pointer text-xs"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-gray-800 dark:text-white px-2.5">{item.quantity}</span>
                          <button
                            id={`increase-qty-${item.id}`}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-400 hover:text-orange-500 cursor-pointer text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Calculated pricing */}
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">Rs. {item.unitPrice.toFixed(2)} each</span>
                          <span className="text-sm font-black text-gray-950 dark:text-white">
                            Rs. {(item.unitPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {/* Remove button */}
                        <button
                          id={`remove-item-${item.id}`}
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Left Back navigation CTA link button */}
              <Link
                id="cart-return-to-menu-link"
                to="/menu"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-500 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Browse more pizza flavors
              </Link>
            </div>

            {/* 2. Right Column: Totals and check-out flows */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Promo validation tab */}
              <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-3 uppercase tracking-tight">
                  Promo Coupon Code
                </h3>
                
                {couponCode ? (
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl flex items-center justify-between border border-emerald-500/20 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Code: {couponCode} ({discountPercentage}% Save)</span>
                    </div>
                    <button
                      id="remove-coupon-btn"
                      onClick={removeCoupon}
                      className="text-emerald-700 dark:text-emerald-350 hover:text-rose-500 text-xs font-black cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      id="cart-coupon-input"
                      type="text"
                      placeholder="e.g. PALACE50"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2.5 text-xs bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-gray-850 uppercase font-mono"
                    />
                    <button
                      id="cart-apply-coupon-btn"
                      type="submit"
                      className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black cursor-pointer shadow shadow-orange-500/10 uppercase tracking-widest"
                    >
                      Apply
                    </button>
                  </form>
                )}
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">Available: PALACE50 (50%), PIZZALOVER (20%), WELCOME10 (10%)</p>
              </div>

              {/* Pricing sum receipt */}
              <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Receipt Invoice</h3>
                <div className="space-y-3.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Recipe Subtotal</span>
                    <span className="font-semibold text-gray-805 dark:text-zinc-200">Rs. {subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>Promo Discount ({discountPercentage}%)</span>
                      <span>-Rs. {discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>5% GST Food Tax</span>
                    <span className="font-semibold text-gray-805 dark:text-zinc-200">Rs. {tax.toFixed(2)}</span>
                  </div>

                  {orderType === 'Delivery' ? (
                    <div className="flex justify-between">
                      <span>Courier Delivery Charge</span>
                      <span className="font-semibold text-gray-805 dark:text-zinc-200">
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-500 font-bold">FREE Delivery</span>
                        ) : (
                          `Rs. ${deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-500 font-bold">
                      <span>Baking Dine-In Plating</span>
                      <span>FREE Serves</span>
                    </div>
                  )}

                  {orderType === 'Delivery' && deliveryFee > 0 && (
                    <p className="text-[9px] text-[#cca044] bg-amber-500/10 p-2.5 rounded-lg leading-relaxed font-semibold border border-amber-500/20">
                      Tip: Spend Rs. {(500 - (subtotal - discount)).toFixed(2)} more to unlock completely FREE delivery!
                    </p>
                  )}

                  <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-4 border-t border-zinc-100 dark:border-white/5">
                    <span>Final Total</span>
                    <span className="text-orange-500 text-lg">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout forms togglers */}
                {simulatedCheckoutStep === 'review' ? (
                  <button
                    id="cart-proceed-checkout-btn"
                    onClick={() => setSimulatedCheckoutStep('details')}
                    className="w-full mt-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-2xl transition-all duration-300 shadow-md shadow-orange-500/15 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    Proceed to Serving Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <form onSubmit={handleCheckoutSubmit} className="mt-6 space-y-4 border-t border-zinc-100 dark:border-white/5 pt-5 font-sans">
                    
                    {/* Choose dining option */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Serving Type</label>
                      <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-black/30 p-1 rounded-xl border border-zinc-100 dark:border-white/5 text-xs text-center font-bold">
                        <button
                          id="serving-type-delivery-btn"
                          type="button"
                          onClick={() => {
                            setOrderType('Delivery');
                            setAddressError('');
                          }}
                          className={`py-2 rounded-lg cursor-pointer transition-all ${orderType === 'Delivery' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400'}`}
                        >
                          Delivery Room
                        </button>
                        <button
                          id="serving-type-dinein-btn"
                          type="button"
                          onClick={() => {
                            setOrderType('DineIn');
                            setAddressError('');
                          }}
                          className={`py-2 rounded-lg cursor-pointer transition-all ${orderType === 'DineIn' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-400'}`}
                        >
                          Dine-In Table
                        </button>
                      </div>
                    </div>

                    {orderType === 'Delivery' ? (
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-xs text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 shrink-0" /> Shipping Details
                        </h4>
                        <label htmlFor="delivery-address-ta" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Complete Delivery Address</label>
                        <textarea
                          id="delivery-address-ta"
                          rows={3}
                          required
                          placeholder="e.g. 504 Apartment 4B, Woodfired Street, Bangalore, Karnataka 560001"
                          value={addressInput}
                          onChange={(e) => {
                            setAddressInput(e.target.value);
                            if (e.target.value.length >= 10) setAddressError('');
                          }}
                          className="w-full text-xs px-3 py-2.5 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-950 focus:border-orange-500 leading-relaxed"
                        />
                        {addressError && (
                          <p className="text-[10px] text-rose-500 font-bold leading-normal">{addressError}</p>
                        )}
                      </div>
                                       ) : (
                      <div className="space-y-4">
                        <h4 className="font-extrabold text-xs text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Table className="w-4 h-4 shrink-0" /> Dine-In Plating
                        </h4>
                        
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                            Select Table (Dining Hall Map)
                          </label>
                          
                          {/* Live Kitchen Stage Accent */}
                          <div className="relative w-full overflow-hidden bg-neutral-900 dark:bg-black p-3.5 rounded-2xl border border-zinc-800/80 mb-5 flex flex-col items-center">
                            {/* Screen/Kitchen curved display line with orange drop glow */}
                            <div className="absolute top-0 w-4/5 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.6)]" />
                            <div className="text-[10px] font-black text-amber-500/80 tracking-widest uppercase text-center mt-1">
                              🍕 WOODFIRED BRICK OVEN STAGE 🍕
                            </div>
                            <div className="text-[8px] text-zinc-500 font-medium">Chef's Live View Stream & Plating Line</div>
                          </div>

                          {/* Seating Grid map (4 Rows x 5 Columns = 20 Tables) */}
                          <div className="grid grid-cols-5 gap-4.5 p-4 bg-zinc-100/50 dark:bg-[#0c0c0e] rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-inner">
                            {Array.from({ length: 20 }, (_, idx) => {
                              const tNum = String(idx + 1);
                              const isOccupied = ['3', '6', '11', '14', '18'].includes(tNum);
                              const isSelected = tableNumber === tNum;

                              let btnClass = '';
                              if (isOccupied) {
                                btnClass = 'bg-zinc-200/50 dark:bg-zinc-900/60 border border-dashed border-red-500/20 text-zinc-400 dark:text-zinc-650 cursor-not-allowed';
                              } else if (isSelected) {
                                btnClass = 'bg-orange-500 text-white font-black border border-orange-400 shadow-md shadow-orange-500/25 ring-2 ring-orange-500/30 scale-105';
                              } else {
                                btnClass = 'bg-white dark:bg-[#1a1a1c] border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 dark:hover:border-orange-500 text-zinc-700 dark:text-zinc-300 hover:scale-105 font-bold';
                              }

                              return (
                                <button
                                  id={`theater-table-btn-${tNum}`}
                                  key={tNum}
                                  type="button"
                                  disabled={isOccupied}
                                  onClick={() => setTableNumber(tNum)}
                                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 text-xs relative group ${btnClass}`}
                                >
                                  {/* Table top circle display */}
                                  <span className="text-[10px] font-mono select-none">T{tNum}</span>
                                  
                                  {/* Miniature visual seats around table */}
                                  <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover:opacity-75" />
                                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover:opacity-75" />
                                  <span className="absolute -left-1 w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover:opacity-75" />
                                  <span className="absolute -right-1 w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover:opacity-75" />
                                </button>
                              );
                            })}
                          </div>

                          {/* Seating Map Legend */}
                          <div className="flex justify-center gap-4 mt-3 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-md bg-white dark:bg-[#1a1a1c] border border-zinc-300 dark:border-zinc-800" />
                              <span>Free</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-md bg-zinc-200/50 dark:bg-zinc-900/60 border border-dashed border-red-500/20" />
                              <span>Occupied</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-md bg-orange-500" />
                              <span>Chosen</span>
                            </div>
                          </div>
                        </div>

                        {/* Summary card container of the chosen table */}
                        <div className="bg-orange-500/5 border border-orange-500/10 p-3.5 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🍹</span>
                            <div>
                              <p className="text-xs font-black text-gray-901 dark:text-white uppercase tracking-wider">
                                Table Number {tableNumber} Selected
                              </p>
                              <p className="text-[9px] text-zinc-500">
                                Accommodates up to 4 diners • Instant Kitchen Plating
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-md uppercase">
                            Available
                          </span>
                        </div>

                        <p className="text-[9px] text-[#cca044] leading-relaxed bg-amber-500/10 p-2.5 rounded-xl font-bold border border-amber-500/15">
                          Dine-In orders will prepare in our brick kitchen and be served directly to your designated table inside our luxury dining hall.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        id="cart-back-review-btn"
                        type="button"
                        onClick={() => setSimulatedCheckoutStep('review')}
                        className="flex-1 py-3 text-xs font-bold bg-gray-50 hover:bg-gray-100 dark:bg-black/30 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer border border-transparent dark:border-white/5 uppercase tracking-wider"
                      >
                        Back
                      </button>
                      
                      <button
                        id="cart-submit-order-checkout-btn"
                        type="submit"
                        disabled={isPlacing}
                        className="flex-[2] py-3 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/40 text-white rounded-xl transition-all duration-300 shadow shadow-emerald-500/10 cursor-pointer uppercase tracking-wider"
                      >
                        {isPlacing ? 'Baking Invoice...' : `Confirm Order (Rs. ${total.toFixed(2)})`}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#151515] p-12 text-center rounded-3xl border border-dashed border-zinc-200/50 dark:border-white/5 max-w-lg mx-auto shadow-sm">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-gray-901 dark:text-white uppercase tracking-tight">Your Pizza Plate is Empty</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-sm mx-auto">
              You haven't added any handcrafted pizza slices to your plate yet. Open our baking catalog and design your perfect slice!
            </p>
            <Link
              id="empty-cart-return-menu-btn"
              to="/menu"
              className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-orange-500/10 uppercase tracking-widest"
            >
              <ShoppingBag className="w-4 h-4" />
              Claim Your First Slice
            </Link>
          </div>
        )}
          </>
        ) : activeTab === 'live' ? (
          (() => {
            const currentSelectedOrder = liveOrdersList.find(o => o.id === selectedLiveOrderId) || activeOrder;
            if (!currentSelectedOrder) {
              return (
                <div className="bg-white dark:bg-[#151515] p-12 text-center rounded-3xl border border-dashed border-zinc-200/50 dark:border-white/5 max-w-lg mx-auto shadow-sm">
                  <div className="text-5xl mb-4">🍽️</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">No Active Kitchen Stream</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-sm mx-auto">
                    No active gourmet pizza order is ticking. Explore our baking catalog, design your perfect sourdough pizza, and checkout!
                  </p>
                  <button
                    onClick={() => setActiveTab('plate')}
                    className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl uppercase tracking-widest cursor-pointer shadow-md shadow-orange-500/10"
                  >
                    Go to My Culinary Plate
                  </button>
                </div>
              );
            }

            const isDineIn = currentSelectedOrder.orderType === 'DineIn';
            const stages = isDineIn
              ? ['Received', 'Preparing', 'Baking', 'Quality Check', 'Ready', 'Delivered']
              : ['Received', 'Preparing', 'Baking', 'Quality Check', 'Out for Delivery', 'Delivered'];
            const activeIndex = stages.indexOf(currentSelectedOrder.status);

            return (
              <div id="active-order-tracker" className="max-w-4xl mx-auto">
                {/* Switcher tabs if multiple active orders */}
                {liveOrdersList.length > 1 && (
                  <div className="flex border border-zinc-200 dark:border-white/5 bg-zinc-104/50 dark:bg-black/30 p-2 rounded-2xl gap-2 mb-6 items-center shrink-0 overflow-x-auto">
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2 shrink-0">Active Oven Streams:</span>
                    {liveOrdersList.map(lo => (
                      <button
                        key={lo.id}
                        onClick={() => setSelectedLiveOrderId(lo.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                          selectedLiveOrderId === lo.id
                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/15'
                            : 'bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-white/5 text-gray-600 dark:text-zinc-400 hover:text-orange-500'
                        }`}
                      >
                        {lo.id} ({lo.status})
                      </button>
                    ))}
                  </div>
                )}

                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-8 animate-fade-in">
                  <div className="absolute right-0 bottom-0 pointer-events-none opacity-10">
                    {isDineIn ? (
                      <Table className="w-64 h-64 translate-x-5 translate-y-5" />
                    ) : (
                      <Bike className="w-64 h-64 translate-x-5 translate-y-5" />
                    )}
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-amber-100 font-mono">
                        {isDineIn ? 'Live Dine-In Cooking Stream' : 'Live Delivery Transit Stream'}
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-black mt-2">
                        {currentSelectedOrder.status === 'Ready' || currentSelectedOrder.status === 'Delivered' ? 'Your Feast is Ready!' : 'Cooking Your Order!'}
                      </h1>
                      <p className="text-xs text-orange-50 mt-1 opacity-90">
                        OrderId: <span className="font-mono font-bold">{currentSelectedOrder.id}</span> • Placed {currentSelectedOrder.updatedAt}
                      </p>
                    </div>
                    
                    {currentSelectedOrder.status !== 'Delivered' && (
                      <button
                        id="speed-prep-sim-btn"
                        onClick={handleSpeedUpSimulator}
                        className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 text-orange-400 hover:text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow cursor-pointer self-start md:self-auto shrink-0 uppercase tracking-wider"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        Speed Up Cooking db
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  <div className="lg:col-span-8 space-y-6">
                    
                    <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md">
                      <h3 className="font-extrabold text-gray-901 dark:text-white text-base mb-6 border-b border-zinc-100 dark:border-white/5 pb-3 uppercase tracking-tight">
                        Progress Pipeline
                      </h3>

                      <div className="relative font-sans">
                        <div className="absolute left-6.5 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-white/5" />
                        
                        <div className="space-y-6 relative z-10">
                          {stages.map((st, i) => {
                            const isCompleted = i < activeIndex;
                            const isActive = i === activeIndex;

                            let titleColor = 'text-gray-400 dark:text-gray-500';
                            let desc = '';
                            let dotStyle = 'bg-gray-100 dark:bg-black/40 border-gray-200 dark:border-white/5 text-gray-400';

                            if (isActive) {
                              titleColor = 'text-orange-500 font-extrabold';
                              dotStyle = 'bg-orange-500 border-orange-400 text-white ring-4 ring-orange-500/20';
                            } else if (isCompleted) {
                              titleColor = 'text-emerald-500 dark:text-emerald-400 font-bold';
                              dotStyle = 'bg-emerald-500 border-emerald-400 text-white';
                            }

                            switch(st) {
                              case 'Received': desc = 'We have acknowledged your payment and fired up our oven.'; break;
                              case 'Preparing': desc = 'Chef is preparing the premium sourdough foundation.'; break;
                              case 'Baking': desc = 'Loaded into the lava brick stone kiln at intense heat.'; break;
                              case 'Quality Check': desc = 'Checking cheese melt ratios and crust bubbling.'; break;
                              case 'Ready': desc = 'Your gourmet pizza table serves are plated and hot!'; break;
                              case 'Out for Delivery': desc = 'Dispatched with hot thermal bags on courier motorcycle.'; break;
                              case 'Delivered': desc = isDineIn ? 'Served fresh to your table! Enjoy!' : 'Delicious hot pizza arrived! Bon appétit!'; break;
                            }

                            return (
                              <div id={`tracking-stage-${st.replace(' ', '-')}`} key={st} className="flex gap-4">
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${dotStyle}`}>
                                  {isCompleted ? <Check className="w-4.5 h-4.5" /> : (i + 1)}
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className={`text-sm ${titleColor}`}>{st}</h4>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">{desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md">
                      <h3 className="font-extrabold text-sm text-gray-901 dark:text-white mb-4 uppercase tracking-tight">
                        Baking Ingredients Listing
                      </h3>
                      <div className="divide-y divide-zinc-100 dark:divide-white/5">
                        {currentSelectedOrder.items.map((item) => (
                          <div id={`active-item-${item.id}`} key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                                {item.pizza.name} <span className="text-[11px] text-orange-500">({item.customization.size})</span>
                              </h4>
                              <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">
                                {item.customization.crust} 
                                {item.customization.extraCheese ? ', Extra Cheese' : ''}
                                {item.customization.extraToppings.length > 0 ? `, Top: ${item.customization.extraToppings.join(', ')}` : ''}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs text-gray-400 font-bold">{item.quantity}x</span>
                              <div className="text-sm font-bold text-gray-950 dark:text-white">Rs. {(item.unitPrice * item.quantity).toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md">
                      <h3 className="font-extrabold text-gray-901 dark:text-white text-sm mb-4 uppercase tracking-tight">
                        Restaurant Parameters
                      </h3>
                      <div className="space-y-4 font-sans">
                        <div className="flex items-start gap-2.5 text-xs text-gray-550 dark:text-gray-400">
                          {isDineIn ? (
                            <Table className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                          ) : (
                            <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-extrabold text-gray-901 dark:text-white">
                              {isDineIn ? 'Plated Table Number' : 'Delivery Address'}
                            </p>
                            <p className="mt-1 leading-relaxed text-zinc-500 dark:text-zinc-400">{currentSelectedOrder.deliveryAddress}</p>
                          </div>
                        </div>

                        {!isDineIn && (
                          <div className="flex items-start gap-2.5 text-xs text-gray-550 dark:text-gray-400 border-t border-zinc-100 dark:border-white/5 pt-4">
                            <Phone className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-extrabold text-gray-901 dark:text-white">Assigned Courier</p>
                              <p className="mt-1 font-mono text-[11px] text-orange-500 font-bold">Courier Mario S. (+91 98302-38491)</p>
                            </div>
                          </div>
                        )}

                        {currentSelectedOrder.status !== 'Delivered' ? (
                          <div className="flex items-center gap-2 text-xs text-amber-500 font-bold bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 font-mono">
                            <Timer className="w-4.5 h-4.5 shrink-0 animate-pulse" />
                            <span>Estimate: 12-18 mins remaining</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
                              <Check className="w-4.5 h-4.5 shrink-0" />
                              <span>Delicious hot slice served! Enjoy!</span>
                            </div>
                            <button
                              id="tracker-goto-history-btn"
                              onClick={() => {
                                clearCart();
                                setActiveTab('history');
                              }}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all cursor-pointer text-center block"
                            >
                              📜 Review Past Slices Now
                            </button>
                          </div>
                        )}

                        <button
                          id="cancel-active-order-btn"
                          onClick={cancelActiveOrder}
                          className="w-full py-2.5 border border-rose-500/30 text-rose-500 hover:bg-rose-500/5 hover:border-rose-500 text-xs font-bold rounded-2xl transition-all cursor-pointer uppercase tracking-wider font-sans"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md">
                      <h3 className="font-extrabold text-sm text-gray-901 dark:text-white mb-4 uppercase tracking-tight">Paid Summary</h3>
                      <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400 font-sans">
                        <div className="flex justify-between">
                          <span>Slices Subtotal</span>
                          <span>Rs. {currentSelectedOrder.subtotal.toFixed(2)}</span>
                        </div>
                        {currentSelectedOrder.discount > 0 && (
                          <div className="flex justify-between text-rose-500 font-bold">
                            <span>Applied Promo Code</span>
                            <span>-Rs. {currentSelectedOrder.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>5% GST Food Tax</span>
                          <span>Rs. {currentSelectedOrder.tax.toFixed(2)}</span>
                        </div>
                        {!isDineIn && (
                          <div className="flex justify-between">
                            <span>Biking Courier Fee</span>
                            <span>{currentSelectedOrder.deliveryFee === 0 ? 'FREE' : `Rs. ${currentSelectedOrder.deliveryFee.toFixed(2)}`}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white pt-3 border-t border-zinc-100 dark:border-white/5">
                          <span>Total Charged</span>
                          <span className="text-orange-500 font-black">Rs. {currentSelectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })()
        ) : (
          /* History & reviews tracking tab */
          (!currentUser.isLoggedIn) ? (
            <div className="bg-white dark:bg-[#151515] py-16 px-10 text-center rounded-3xl border border-zinc-200/50 dark:border-white/5 max-w-lg mx-auto shadow-md font-sans">
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-lg font-extrabold text-gray-901 dark:text-white uppercase tracking-wider">Authentication Required</h3>
              <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">
                Please sign in to unlock your persistent order history. We secure your woodfired baking logs so you can review pizzas!
              </p>
              <Link
                id="history-signin-btn"
                to="/auth"
                className="mt-6 inline-flex items-center gap-1.5 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl uppercase tracking-widest cursor-pointer shadow-lg shadow-orange-500/10 pointer-events-auto"
              >
                Gain Account Access
              </Link>
            </div>
          ) : (ordersList.length === 0) ? (
            <div className="bg-white dark:bg-[#151515] py-16 px-12 text-center rounded-3xl border border-dashed border-zinc-200/50 dark:border-white/5 max-w-xl mx-auto font-sans">
              <div className="text-5xl mb-4 text-[#cca044]">📜</div>
              <h3 className="text-lg font-black text-gray-910 dark:text-white uppercase tracking-wider">No Historic Baking Decoded</h3>
              <p className="text-xs text-gray-400 mt-2.5 max-w-sm mx-auto leading-relaxed">
                You haven't ordered any brick oven pizza slices yet! Checkout items on your Plate, speed up cooking to "Delivered" state, then write gourmet stars reviews here.
              </p>
              <Link
                id="history-order-now-btn"
                to="/menu"
                className="mt-6 inline-flex items-center gap-1.5 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/10 uppercase tracking-widest cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Claim Your First Slice
              </Link>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 font-sans">
              <div className="border-b border-zinc-205 dark:border-white/5 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500 flex items-center gap-1">
                  <ShieldCheck className="w-4.5 h-4.5" /> Past Cooking Records ({ordersList.length})
                </span>
                <p className="text-[10px] text-gray-400 mt-1">
                  Verified customer logs and baking chef star feedbacks.
                </p>
              </div>

              <div className="space-y-6">
                {ordersList.map((order) => {
                  return (
                    <div
                      id={`order-history-card-${order.id}`}
                      key={order.id}
                      className="bg-white dark:bg-[#131315] border border-zinc-200/50 dark:border-white/5 p-6 rounded-3xl shadow-md space-y-4 hover:border-zinc-300 dark:hover:border-white/10 transition-all text-gray-900 dark:text-gray-100"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-100 dark:border-white/5 pb-3.5 gap-2">
                        <div>
                          <span className="text-[10px] bg-orange-500/10 text-orange-655 dark:text-orange-400 font-black px-2.5 py-1 rounded-md uppercase tracking-wide font-sans">
                            ORDER {order.id}
                          </span>
                          <p className="text-[10px] text-gray-405 mt-1.5 font-mono font-bold">
                            Ticked on {order.updatedAt || 'Recent'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            order.status === 'Delivered' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : order.status === 'Cancelled' 
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-450' 
                              : 'bg-amber-500/10 text-[#cca044]'
                          }`}>
                            ● {order.status}
                          </span>
                          <span className="text-[10px] bg-zinc-100 dark:bg-black/40 border border-zinc-200/40 dark:border-white/10 px-2.5 py-1 rounded-md font-bold dark:text-zinc-205 uppercase tracking-wider font-mono">
                            {order.orderType === 'DineIn' ? '🍽️ Dine-In Table' : '🛵 Courier Map'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                        <strong className="text-gray-901 dark:text-white uppercase tracking-tight text-[10px]">Parameters:</strong> {order.deliveryAddress}
                      </p>

                      <div className="mt-4">
                        <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-550 uppercase tracking-widest mb-2 font-mono">Baking Ingredients Summary</h4>
                        <div className="divide-y divide-zinc-100 dark:divide-white/5">
                          {order.items.map((item: any) => (
                            <PizzaFeedbackItemRow
                              key={item.id}
                              item={item}
                              order={order}
                              reviews={reviews}
                              submitReview={submitReview}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 dark:border-white/5 pt-3.5 flex justify-between items-center bg-gray-50/50 dark:bg-black/10 -mx-6 -mb-6 px-6 py-4.5 rounded-b-3xl text-xs font-semibold">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Invoice Billed (Rs Symbol)</span>
                        <span className="text-orange-500 font-extrabold text-sm">Rs. {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

      </div>
    </motion.div>
  );
}
