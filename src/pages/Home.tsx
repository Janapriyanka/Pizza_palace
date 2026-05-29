/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import HeroSection from '../components/HeroSection';
import OffersSection from '../components/OffersSection';
import FeaturedPizzas from '../components/FeaturedPizzas';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <motion.div
      id="home-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-0"
    >
      {/* 1. Hero banner Section */}
      <HeroSection />

      {/* 2. Offers & active Coupon sections */}
      <OffersSection />

      {/* 3. Handcrafted Featured Pizzas */}
      <FeaturedPizzas />

      {/* 4. Why Foodies choose Pizza Palace */}
      <WhyChooseUs />

      {/* 5. Heartfelt Customer Testimonials */}
      <Testimonials />
    </motion.div>
  );
}
