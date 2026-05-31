/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { OrderTrack, OrderStatus } from '../types';
import { 
  Flame, 
  ChefHat, 
  Truck, 
  MapPin, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Table, 
  DollarSign, 
  ChevronRight,
  ShieldAlert,
  Archive,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OwnerDashboard() {
  const { currentUser, advanceOrderStatus } = useApp();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('active');

  // --- REDIRECT IF NOT OWNER ---
  useEffect(() => {
    if (!currentUser.isLoggedIn || currentUser.role !== 'owner') {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate]);
  // --- LISTEN TO ENGINE ORDERS (REST API SECURED WITH JWT) ---
  useEffect(() => {
    if (!currentUser.isLoggedIn || currentUser.role !== 'owner') return;

    const syncOrders = async () => {
      try {
        const token = localStorage.getItem('pizza_palace_jwt_token');
        const response = await fetch("/api/orders", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const orderList = await response.json();
          orderList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setOrders(orderList);
          setLoading(false);
        }
      } catch (err) {
        console.warn("Owner orders Express sync error:", err);
      }
    };

    syncOrders();
    const interval = setInterval(() => {
      syncOrders();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUser]);  if (!currentUser.isLoggedIn || currentUser.role !== 'owner') {
    return (
      <div className="py-24 bg-zinc-50 dark:bg-[#0c0c0c] min-h-screen flex items-center justify-center transition-colors px-4 font-sans text-center">
        <div className="bg-white dark:bg-[#151515] p-8 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-md max-w-md w-full space-y-6">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-pulse" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Access Restricted</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            This dashboard belongs exclusively to verified Pizza Palace administrative chefs. You are currently logged in as a normal patron. Redirection is in progress...
          </p>
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // --- FILTER ORDERS ---
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') {
      return order.status !== 'Delivered' && order.status !== 'Cancelled';
    }
    if (activeFilter === 'completed') return order.status === 'Delivered';
    if (activeFilter === 'cancelled') return order.status === 'Cancelled';
    return true;
  });

  // --- COMPUTE STATISTICS ---
  const activeCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const deliveryCount = orders.filter(o => o.orderType === 'Delivery' && o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const dineInCount = orders.filter(o => o.orderType === 'DineIn' && o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.total, 0);

  // --- STATUS ACTION GENERATOR ---
  const renderStatusButton = (order: OrderTrack) => {
    const isDineIn = order.orderType === 'DineIn';
    
    // Status Flow: Received -> Preparing -> Baking -> Quality Check -> (Ready if DineIn else Out for Delivery) -> Delivered
    switch (order.status) {
      case 'Received':
        return (
          <button
            id={`owner-status-${order.id}-prep`}
            onClick={() => advanceOrderStatus(order.id, 'Preparing')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <ChefHat className="w-4 h-4" /> Start Preparing
          </button>
        );
      case 'Preparing':
        return (
          <button
            id={`owner-status-${order.id}-bake`}
            onClick={() => advanceOrderStatus(order.id, 'Baking')}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <Flame className="w-4 h-4" /> Fire into Oven (Bake)
          </button>
        );
      case 'Baking':
        return (
          <button
            id={`owner-status-${order.id}-qc`}
            onClick={() => advanceOrderStatus(order.id, 'Quality Check')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <Clock className="w-4 h-4" /> Quality Check inspect
          </button>
        );
      case 'Quality Check':
        if (isDineIn) {
          return (
            <button
              id={`owner-status-${order.id}-ready`}
              onClick={() => advanceOrderStatus(order.id, 'Ready')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Ready for Dine-In
            </button>
          );
        } else {
          return (
            <button
              id={`owner-status-${order.id}-deliver`}
              onClick={() => advanceOrderStatus(order.id, 'Out for Delivery')}
              className="px-4 py-2 bg-teal-550 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer uppercase tracking-wider bg-indigo-600"
            >
              <Truck className="w-4 h-4" /> Send to Deliver
            </button>
          );
        }
      case 'Ready': // Only applicable to Dine-In
        return (
          <button
            id={`owner-status-${order.id}-served`}
            onClick={() => advanceOrderStatus(order.id, 'Delivered')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4" /> Hand Off Served (Complete)
          </button>
        );
      case 'Out for Delivery': // Only applicable to Delivery
        return (
          <button
            id={`owner-status-${order.id}-delivered`}
            onClick={() => advanceOrderStatus(order.id, 'Delivered')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark Delivered (Complete)
          </button>
        );
      case 'Delivered':
        return (
          <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1">
            <CheckCircle2 className="w-4.5 h-4.5" /> Order Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="text-xs font-black text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 uppercase tracking-widest flex items-center gap-1">
            <Ban className="w-4.5 h-4.5" /> Order Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      id="owner-dashboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-12 bg-zinc-50 dark:bg-[#0c0c0c] min-h-screen font-sans transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner header administrative dashboard */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Chefs Room Area</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-1.5 uppercase tracking-tight">
              Palace Kitchen Central
            </h1>
            <p className="text-xs text-gray-400 mt-2 max-w-lg leading-relaxed">
              Verify customer custom recipe formulas, track incoming deliveries vs table plating, & manage live order progress.
            </p>
          </div>
          <div className="text-xs text-slate-100 bg-[#121214] border border-orange-500/20 px-4 py-2.5 rounded-2xl flex items-center gap-1.5 font-bold shadow-md">
            <Flame className="w-4.5 h-4.5 text-orange-550 animate-bounce" />
            <span>Brick Kiln Temperature: 475°C • ONLINE</span>
          </div>
        </div>

        {/* 4 Stat boxes: Active, Delivery tickets, Dine-In plates, Completed revenue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Cooking active tickets</p>
              <h3 className="text-2xl font-black dark:text-white text-zinc-950 mt-1">{activeCount} Orders</h3>
            </div>
            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Incoming Delivery</p>
              <h3 className="text-2xl font-black dark:text-white text-zinc-950 mt-1">{deliveryCount} Tickets</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Dine-In Plates</p>
              <h3 className="text-2xl font-black dark:text-white text-zinc-950 mt-1">{dineInCount} Tables</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
              <Table className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-[#151515] p-6 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Chef Net Completed Revenue</p>
              <h3 className="text-2xl font-black dark:text-white text-zinc-950 mt-1">Rs. {totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-555">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>

        </div>

        {/* Tab filters controls */}
        <div className="flex border-b border-zinc-200/60 dark:border-white/5 mb-8 text-xs font-bold uppercase tracking-wider">
          {(['active', 'all', 'completed', 'cancelled'] as const).map((filter) => (
            <button
              id={`tab-filter-owner-${filter}`}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`pb-4 px-6 relative cursor-pointer ${
                activeFilter === filter 
                  ? 'text-orange-500 font-extrabold' 
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span className="capitalize">{filter} Slices</span>
              {activeFilter === filter && (
                <motion.div
                  layoutId="ownerActiveFilterIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* ORDER LISTING GRID */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-bold text-gray-400">Syncing with Cloud Pizza Database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#151515] py-20 px-8 text-center rounded-3xl border border-dashed border-zinc-200 dark:border-white/5 max-w-xl mx-auto shadow-sm">
            <Archive className="w-12 h-12 text-gray-300 dark:text-zinc-700 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">Active Hearth is Idle</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto mt-2 leading-relaxed">
              There are no orders matching your selected category. Relax, enjoy a hand tossed cheese slice, and await the next ticket!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => {
                const isDineIn = order.orderType === 'DineIn';
                
                // Set order accent color based on status
                let ringAccent = 'border-zinc-200 dark:border-white/5';
                if (order.status === 'Received') ringAccent = 'border-blue-500/70 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20';
                else if (order.status === 'Preparing') ringAccent = 'border-orange-500/70 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/20';
                else if (order.status === 'Baking') ringAccent = 'border-amber-500/70 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20 animate-pulse';
                else if (order.status === 'Ready' || order.status === 'Out for Delivery') ringAccent = 'border-purple-500/70 shadow-lg shadow-purple-500/5 ring-1 ring-purple-500/20';

                return (
                  <motion.div
                    id={`owner-order-card-${order.id}`}
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`bg-white dark:bg-[#151515] p-6 rounded-3xl border flex flex-col justify-between ${ringAccent} transition-all duration-300`}
                  >
                    <div>
                      {/* Ticket top tags */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs font-black text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md uppercase">
                          {order.id}
                        </span>
                        
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          isDineIn 
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400' 
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                        }`}>
                          {isDineIn ? <Table className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                          {isDineIn ? `Table ${order.tableNumber}` : 'Home Transport'}
                        </span>
                      </div>

                      {/* Customer metrics */}
                      <div className="space-y-0.5 border-b border-zinc-100 dark:border-white/5 pb-3.5 mb-3.5">
                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white truncate">
                          {order.customerName}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-medium truncate">
                          {order.customerEmail}
                        </p>
                      </div>

                      {/* Handcrafted pizza Slices detail */}
                      <div className="space-y-4 mb-5">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Recipe Specifications</div>
                        <div className="space-y-3">
                          {order.items.map((item, id) => (
                            <div key={id} className="text-xs text-gray-700 dark:text-zinc-250 border-l-2 border-orange-500/50 pl-3 py-0.5">
                              <div className="font-bold flex items-center gap-1">
                                <span>{item.quantity}x</span>
                                <span className="font-black text-orange-600 dark:text-orange-400">{item.pizza.name}</span>
                                <span className="text-[9px] bg-zinc-100 dark:bg-[#202025] px-1.5 py-0.5 rounded text-gray-500 font-normal uppercase">
                                  {item.customization.size}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                                {item.customization.crust}
                                {item.customization.extraCheese && ' • Extra Mozzarella'}
                                {item.customization.extraToppings.length > 0 && ` • Extra: ${item.customization.extraToppings.join(', ')}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Display destination adress or routing details */}
                      <div className="bg-zinc-50 dark:bg-black/35 p-3 rounded-2xl text-[11px] text-gray-500 dark:text-gray-400 mb-5 flex items-start gap-1.5 font-sans leading-relaxed">
                        <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-800 dark:text-zinc-200">{isDineIn ? 'Plated location' : 'Drop Shipping point'}</p>
                          <p className="mt-0.5">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Calculated values and live Status Actions button panel */}
                    <div className="border-t border-zinc-100 dark:border-white/5 pt-4 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-black block">Bill sum</span>
                        <span className="text-sm font-black text-gray-901 dark:text-white">Rs. {order.total.toFixed(2)}</span>
                      </div>
                      
                      {renderStatusButton(order)}
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </motion.div>
  );
}
