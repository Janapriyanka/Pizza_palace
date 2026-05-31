/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Clock, Send, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  const { addToast } = useApp();

  // --- LOCAL FORM FIELD STATES ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Feedback',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORM INPUT VALIDATION ---
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please provide a valid email format.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Feedback message is required.';
    } else if (formData.message.length < 15) {
      errors.message = 'Please write a minimum of 15 characters to explain details.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API database post
    setTimeout(() => {
      setIsSubmitting(false);
      addToast(`Thank you, ${formData.name}! Your message was successfully received by our support palace.`, 'success');
      
      // Reset form fields
      setFormData({
        name: '',
        email: '',
        subject: 'Feedback',
        message: ''
      });
    }, 1500);
  };

  return (
    <motion.div
      id="contact-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="py-16 bg-zinc-50 dark:bg-[#0c0c0c] min-h-screen transition-colors duration-300 font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <Mail className="w-8 h-8 text-orange-500 mx-auto mb-3 animate-pulse" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
            Reach Out To Our Palace
          </h1>
          <p className="text-xs text-gray-400 mt-2">
            Ask about catering parties, report dynamic tracking, provide crust feedback, or coordinate wedding pizzas!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Contact Form validation */}
          <div className="lg:col-span-7 bg-white dark:bg-[#151515] p-6.5 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white mb-6 border-b border-zinc-100 dark:border-white/5 pb-3">
              Send Your Inquiries
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name input */}
                <div className="space-y-1.5Block">
                  <label htmlFor="contact-name" className="block text-xs font-bold text-gray-400 mb-1">Full Name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="e.g. Michael Scarn"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3.5 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-900 focus:border-orange-500"
                  />
                  {formErrors.name && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 shrink-0" /> {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Email input */}
                <div className="space-y-1.5Block">
                  <label htmlFor="contact-email" className="block text-xs font-bold text-gray-400 mb-1">Email Address</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="e.g. scarn@mitchell.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-xs px-3.5 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-900 focus:border-orange-500"
                  />
                  {formErrors.email && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 shrink-0" /> {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject picker dropdown */}
              <div className="space-y-1.5Block">
                <label htmlFor="contact-subject" className="block text-xs font-bold text-gray-400 mb-1">Category Subject</label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3.5 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-900 focus:border-orange-500"
                >
                  <option value="Feedback" className="bg-[#151515]">Recipe Feedback Slices</option>
                  <option value="Catering" className="bg-[#151515]">Event Pizzeria Catering</option>
                  <option value="Support" className="bg-[#151515]">Online Payment or Courier Tracking</option>
                  <option value="Career" className="bg-[#151515]">Chef and Bike Deliverer Recruitment</option>
                </select>
              </div>

              {/* Message box */}
              <div className="space-y-1.5Block">
                <label htmlFor="contact-message" className="block text-xs font-bold text-gray-400 mb-1">Message Detail</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Explain your culinary concerns or requests here (min. 15 characters)..."
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full text-xs px-3.5 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-900 focus:border-orange-500"
                />
                {formErrors.message && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3 h-3 shrink-0" /> {formErrors.message}
                  </p>
                )}
              </div>

              {/* Send message button */}
              <button
                id="contact-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer self-end"
              >
                {isSubmitting ? 'Sending Slices...' : (
                  <>
                    <Send className="w-4 h-4" /> Message Support Palace
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right Panel: Map Placeholder and business details */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Business Contact Cards */}
            <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md space-y-5">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Headquarters Hub Contact</h3>
              
              <div className="space-y-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-gray-900 dark:text-white block">Central Storefront</span>
                    <span className="mt-1 block leading-relaxed">804 Artisan Crust Boulevard, Upper Eastside Oven, NY 10021</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-white/5 pt-4">
                  <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <span className="font-black text-gray-900 dark:text-white block">Telephone Hotline</span>
                    <span className="mt-1 block font-mono text-orange-500 font-bold">+1 (555) 749-9272 (PIZZA)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-zinc-100 dark:border-white/5 pt-4">
                  <Mail className="w-5 h-5 text-orange-500 shrink-0 animation-toggle" />
                  <div>
                    <span className="font-black text-gray-900 dark:text-white block">Electronic Mail Direct</span>
                    <span className="mt-1 block">support@pizzapalace.app</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded maps placeholder with custom styled iframe mock */}
            <div className="bg-white dark:bg-[#151515] p-3 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md">
              <div className="relative aspect-video rounded-2xl bg-zinc-150 dark:bg-black/40 flex flex-col items-center justify-center text-center p-6 border border-zinc-100 dark:border-white/5 overflow-hidden group">
                <div className="absolute inset-x-0 inset-y-0 opacity-15 pointer-events-none text-gray-400 dark:text-zinc-650 bg-radial select-none text-[8px] font-mono leading-none flex flex-wrap break-all pr-4">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <span key={i}>NYMAP GRID CENTRAL LAT 40.7128 LNG -74.0060 CRUST STRECH FIELD HEIGHT 500 DEGREES KILN OVEN STREET </span>
                  ))}
                </div>

                <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-full text-orange-500 mb-2 relative z-10 scale-105">
                  <MapPin className="w-6 h-6 animate-pulse" />
                </div>
                
                <h4 className="font-extrabold text-xs text-gray-900 dark:text-white relative z-10">Baking Center Map</h4>
                <p className="text-[10px] text-gray-400 mt-1 max-w-xs relative z-10">
                  Located near Central Park East, surrounded by organic suppliers. Stop by for counter pick up!
                </p>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-zinc-900 text-[9px] text-amber-400 font-bold px-2 py-0.5 rounded shadow z-10 border border-zinc-800">
                  <Sparkles className="w-3 h-3" /> NYC Central
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
}
