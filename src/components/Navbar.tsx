/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Pizza as PizzaIcon, ShoppingCart, Heart, Sun, Moon, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { cartCount, wishlist, currentUser, logoutUser, theme, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const activeStyle = ({ isActive }: { isActive: boolean }) =>
    `relative text-xs font-black uppercase tracking-widest transition-all duration-300 py-2 ${
      isActive
        ? 'text-orange-500'
        : 'text-gray-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-white'
    }`;

  const baseItems = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'Craft Builder', path: '/builder' },
    { label: 'AI Choice', path: '/ai-recommender' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const navItems = currentUser.isLoggedIn && currentUser.role === 'owner'
    ? [...baseItems, { label: 'Owner Portal', path: '/owner' }]
    : baseItems;

  return (
    <nav 
      id="main-navbar" 
      className="sticky top-0 z-40 bg-zinc-50/90 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <Link id="navbar-logo-link" to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:rotate-12 transition-transform duration-300 text-white select-none">
              <PizzaIcon className="w-5.5 h-5.5" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">
              Pizza<span className="text-orange-500">Palace</span>
            </span>
          </Link>

          {/* Desktop Nav Routing Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-8 ml-8">
            {navItems.map((item) => (
              <NavLink id={`nav-link-${item.label.toLowerCase().replace(' ', '-')}`} key={item.label} to={item.path} className={activeStyle}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right Nav Utilities */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>

            {/* Wishlist Icon Counter */}
            <Link
              id="navbar-wishlist-link"
              to="/menu?filter=wishlist"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors relative"
              title="Your Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md scale-90">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Icon Counter Badge */}
            <Link
              id="navbar-cart-link"
              to="/cart"
              className="p-2.5 rounded-full bg-orange-50 dark:bg-white/5 border border-transparent dark:border-white/5 hover:bg-orange-100 dark:hover:bg-white/10 text-orange-600 dark:text-orange-500 transition-all duration-300 relative group"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-orange-500 transition-colors" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 12 }}
                  key={cartCount}
                  className="absolute -top-2 -right-2 bg-orange-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-[#0c0c0c] z-10"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* User Auth Link */}
            {currentUser.isLoggedIn ? (
              <div className="flex items-center gap-3 border-l border-gray-200 dark:border-white/10 pl-4">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Welcome,</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{currentUser.name}</span>
                </div>
                <button
                  id="navbar-logout-btn"
                  onClick={logoutUser}
                  className="p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <Link
                id="navbar-login-link"
                to="/auth"
                className="px-6 py-2 border border-orange-500/50 rounded-full text-xs font-bold text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 uppercase tracking-widest"
              >
                Log In
              </Link>
            )}

          </div>

          {/* Mobile responsive toggle button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              id="mobile-theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>

            <Link
              id="mobile-cart-btn"
              to="/cart"
              className="p-2 rounded-full text-orange-600 dark:text-orange-400 relative"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 12 }}
                  key={`mobile-${cartCount}`}
                  className="absolute top-0 right-0 bg-red-600 text-white font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            <button
              id="mobile-menu-hamburger-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Slide Down Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white/95 dark:bg-[#121214]/95 border-b border-gray-100 dark:border-gray-800/80 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-3">
              {navItems.map((item) => (
                <NavLink
                  id={`mobile-nav-link-${item.label.toLowerCase().replace(' ', '-')}`}
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                      isActive
                        ? 'bg-orange-500/10 text-orange-500'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-850'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3 flex flex-col gap-3">
                <Link
                  id="mobile-wishlist-link"
                  to="/menu?filter=wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 text-base font-semibold"
                >
                  <Heart className={`w-5 h-5 text-rose-500 fill-rose-500/20`} />
                  Favorites ({wishlist.length})
                </Link>

                {currentUser.isLoggedIn ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Authenticated user</p>
                      <p className="text-sm font-bold text-gray-800 dark:text-white">{currentUser.name}</p>
                    </div>
                    <button
                      id="mobile-logout-btn"
                      onClick={() => {
                        logoutUser();
                        setIsOpen(false);
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    id="mobile-signin-link"
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl"
                  >
                    <User className="w-5 h-5" />
                    Sign In to Account
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
