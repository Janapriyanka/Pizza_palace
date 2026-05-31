/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';

// Page Imports
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import OwnerDashboard from './pages/OwnerDashboard';
import CustomPizzaBuilder from './pages/CustomPizzaBuilder';
import AIPizzaRecommender from './pages/AIPizzaRecommender';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div id="pizzapalace-app-wrapper">
      <AppProvider>
        <Router>
          
          {/* Main layout container with grid structured views */}
          <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-[#0c0c0c] text-zinc-900 dark:text-slate-100 transition-colors duration-300 font-sans antialiased">
            
            {/* Global Sticky Header */}
            <Navbar />

            {/* Main scrollable body viewport */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/owner" element={<OwnerDashboard />} />
                <Route path="/builder" element={<CustomPizzaBuilder />} />
                <Route path="/ai-recommender" element={<AIPizzaRecommender />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Global Page Footer */}
            <Footer />

            {/* Live animated alerts overlay block */}
            <Toast />

          </div>

        </Router>
      </AppProvider>
    </div>
  );
}
