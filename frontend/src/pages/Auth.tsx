/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, Mail, User, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const { loginUser, registerUser, currentUser } = useApp();
  const navigate = useNavigate();

  // --- TAB TOGGLES ---
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // --- FORM FIELDS ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // --- ACTIONS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email check
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please provide a valid email format (e.g. name@gmail.com).';
    }

    // Password check
    if (!formData.password) {
      errors.password = 'Password input is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (activeTab === 'register') {
      // Name check
      if (!formData.name.trim()) {
        errors.name = 'Full name is required to register.';
      }

      // Password matching
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (activeTab === 'login') {
        await loginUser(formData.email, formData.password);
        navigate('/');
      } else {
        await registerUser(formData.email, formData.password, formData.name);
        navigate('/');
      }

      // Reset local data
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- AUTHENTICATED ALREADY VIEW ---
  if (currentUser.isLoggedIn) {
    return (
      <div className="py-16 bg-zinc-50 dark:bg-[#0c0c0c] min-h-screen flex items-center justify-center transition-colors font-sans">
        <div className="bg-white dark:bg-[#151515] p-8 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md max-w-md w-full text-center space-y-6">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Already Authenticated</h2>
          <p className="text-xs text-gray-400">
            You are logged in as <span className="font-bold text-gray-800 dark:text-gray-200">{currentUser.name}</span> ({currentUser.email}). No authorization needed!
          </p>
          <button
            id="auth-go-home-btn"
            onClick={() => navigate('/menu')}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition hover:-translate-y-0.5 cursor-pointer text-xs uppercase tracking-wider"
          >
            Start Customizing Slices
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      id="auth-page"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="py-16 bg-zinc-50 dark:bg-[#0c0c0c] min-h-screen flex items-center justify-center transition-colors px-4 font-sans"
    >
      <div className="bg-white dark:bg-[#151515] rounded-3xl border border-zinc-200/50 dark:border-white/5 max-w-md w-full overflow-hidden shadow-2xl">
        
        {/* Banner Tabs */}
        <div className="grid grid-cols-2 text-center bg-gray-50 dark:bg-black/30 border-b border-zinc-200/50 dark:border-white/5">
          <button
            id="auth-tab-login"
            onClick={() => {
              setActiveTab('login');
              setFormErrors({});
            }}
            className={`py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white dark:bg-[#151515] border-b-2 border-orange-500 text-orange-500 font-extrabold'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Sign In Account
          </button>
          <button
            id="auth-tab-register"
            onClick={() => {
              setActiveTab('register');
              setFormErrors({});
            }}
            className={`py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-[#151515] border-b-2 border-orange-500 text-orange-500 font-extrabold'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form elements */}
        <div className="p-8">
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {activeTab === 'login' ? 'Welcome Back!' : 'Create Sourdough Account'}
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">
              {activeTab === 'login' 
                ? 'Access your profile to view order history and saved slice combinations.' 
                : 'Join our Pizza loyalty scheme for free delivery tiers!'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field (Register only) */}
            {activeTab === 'register' && (
              <div className="space-y-1">
                <label htmlFor="reg-name-input" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="reg-name-input"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Stanley Hudson"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-900 focus:border-orange-500"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {formErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Address field */}
            <div className="space-y-1">
              <label htmlFor="auth-email-input" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="auth-email-input"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. stanley@pizzapalace.app"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full text-xs pl-10 pr-4 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-90 w-full text-zinc-900 focus:border-orange-500"
                />
              </div>
              {formErrors.email && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {formErrors.email}
                </p>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-1">
              <label htmlFor="auth-password-input" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Password (min. 6 tags)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="auth-password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full text-xs pl-10 pr-10 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-90 w-full text-zinc-900 focus:border-orange-500"
                />
                
                {/* Visibility toggler */}
                <button
                  id="auth-password-vis"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password field (Register only) */}
            {activeTab === 'register' && (
              <div className="space-y-1">
                <label htmlFor="reg-confirm-input" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide">Confirm Security Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="reg-confirm-input"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full text-xs pl-10 pr-10 py-3 bg-zinc-50 dark:bg-black/40 border border-zinc-200/50 dark:border-white/5 rounded-xl focus:outline-none dark:text-white text-zinc-90 w-full text-zinc-900 focus:border-orange-500"
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3.5 bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-500/55 text-white rounded-xl text-xs font-extrabold transition-all duration-300 shadow-md shadow-orange-500/10 active:translate-y-0.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting 
                ? 'Validating Gourmet Keys...' 
                : (activeTab === 'login' ? 'Sign In' : 'Create Crust Account')
              }
            </button>

          </form>

        </div>

      </div>
    </motion.div>
  );
}
