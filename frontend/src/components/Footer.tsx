/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Pizza, Phone, Mail, MapPin, Clock, Heart, Award } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div id="main-footer-wrapper" className="bg-[#0c0c0c] text-gray-300">
      
      {/* IMMERSIVE HEADER MARQUEE */}
      <div id="footer-marquee" className="bg-orange-600/10 border-y border-white/5 py-4 w-full">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-around gap-4 text-center md:text-left select-none">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> 24/7 SUPPORT AVAILABLE
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> 150+ LOCATIONS NATIONWIDE
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> FRESH INGREDIENTS DAILY
          </div>
        </div>
      </div>

      <footer 
        id="main-footer" 
        className="bg-[#0c0c0c] border-t border-white/5 pt-16 pb-8 transition-colors duration-300"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand/Identity Segment */}
          <div className="space-y-4">
            <Link id="footer-logo-link" to="/" className="flex items-center gap-2">
              <div className="bg-orange-500 text-white p-1.5 rounded-xl">
                <Pizza className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Pizza Palace
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crafting premium wood-fired, slow-fermented crust pizzas topped with fresh organic ingredients since 2026. Taste the passion in every slice.
            </p>
            <div className="flex gap-4 pt-2">
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
                <a
                  key={social}
                  href={`#${social}`}
                  id={`footer-social-${social.toLowerCase()}`}
                  className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-orange-500 transition-colors flex items-center justify-center text-gray-400 hover:text-white"
                  title={`Follow us on ${social}`}
                >
                  <span className="text-xs font-bold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Business Hours Schedulers */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg tracking-wide border-l-2 border-orange-500 pl-3">
              Operating Hours
            </h3>
            <div className="space-y-3.5 text-sm text-gray-400">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Mon - Thu:</span>
                <span>11:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Friday:</span>
                <span className="text-orange-400">11:00 AM - 11:30 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Saturday:</span>
                <span className="text-orange-400">10:00 AM - 11:30 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300">Sunday:</span>
                <span>10:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-400/90 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Woodfired ovens heat up in 15 mins!</span>
              </div>
            </div>
          </div>

          {/* Navigation Directory */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg tracking-wide border-l-2 border-orange-500 pl-3">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link id="footer-menu-link" to="/menu" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  Our Culinary Menu
                </Link>
              </li>
              <li>
                <Link id="footer-about-link" to="/about" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  Our Legacy Story
                </Link>
              </li>
              <li>
                <Link id="footer-contact-link" to="/contact" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  Get in Touch
                </Link>
              </li>
              <li>
                <Link id="footer-auth-link" to="/auth" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  My Profile Account
                </Link>
              </li>
              <li>
                <Link id="footer-cart-link" to="/cart" className="text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5">
                  Checkout Cart Page
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Contact & Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg tracking-wide border-l-2 border-orange-500 pl-3">
              Reach Our Palace
            </h3>
            <div className="space-y-3.5 text-sm text-gray-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <span>XYZ Street, Sector 60, XYZ City, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                <span>+91 98765 XXXXX / 011-XYZ-PIZZA</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                <span>contact@xyzpizzapalace.com</span>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs border-t border-zinc-900 mt-2 text-gray-500">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Voted #1 Chennai Wood-fired Pizzeria!</span>
              </div>
            </div>
          </div>

        </div>

        {/* Closing Segment */}
        <div className="mt-12 pt-8 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} Pizza Palace, LLC. All rights served. Crafted with organic materials.</p>
          <div className="flex items-center gap-5">
            <span className="hover:text-gray-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms of Baking</span>
            <span className="hover:text-gray-300 cursor-pointer">Cookie Settings</span>
          </div>
        </div>

      </div>
    </footer>
    </div>
  );
}
