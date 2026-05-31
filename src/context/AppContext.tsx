/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Pizza, PizzaCustomization, CartItem, User, ToastMessage, OrderStatus, OrderTrack, PizzaReview } from '../types';
import { SIZE_MULTIPLIERS, CRUST_PREMIUMS, EXTRA_TOPPING_PRICE, EXTRA_CHEESE_PRICE } from '../data/pizzaData';

interface AppContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  addToCart: (pizza: Pizza, customization: PizzaCustomization, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  wishlist: string[];
  toggleWishlist: (pizzaId: string) => void;
  isWishlisted: (pizzaId: string) => boolean;

  currentUser: User;
  loginUser: (email: string, password?: string) => Promise<void>;
  registerUser: (email: string, password?: string, name?: string) => Promise<void>;
  logoutUser: () => Promise<void>;

  couponCode: string;
  discountPercentage: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  removeToast: (id: string) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  ordersList: OrderTrack[];
  activeOrder: OrderTrack | null;
  placeOrder: (deliveryAddress: string, orderType: 'Delivery' | 'DineIn', tableNumber?: string) => Promise<boolean>;
  cancelActiveOrder: () => Promise<void>;
  advanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  reviews: PizzaReview[];
  submitReview: (orderId: string, pizzaId: string, pizzaName: string, rating: number, comment: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const VALID_COUPONS: Record<string, number> = {
  'PALACE50': 50, // 50% discount
  'PIZZALOVER': 20, // 20% discount
  'WELCOME10': 10, // 10% discount
  'FREETAX': 15, // 15% discount
};

export function AppProvider({ children }: { children: ReactNode }) {
  // --- STATE INITIALIZATION ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('pizza_palace_cart');
    if (local) {
      try {
        const parsed: CartItem[] = JSON.parse(local);
        return parsed.map((item: CartItem) => {
          if (item.pizza.id.startsWith('ai-recommender-')) {
            return {
              ...item,
              unitPrice: item.pizza.price
            };
          }
          return item;
        });
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const local = localStorage.getItem('pizza_palace_wishlist');
    return local ? JSON.parse(local) : [];
  });

  const [currentUser, setCurrentUser] = useState<User>({
    email: '',
    name: 'Guest',
    isLoggedIn: false
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const local = localStorage.getItem('pizza_palace_theme');
    return (local as 'light' | 'dark') || 'dark';
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    return localStorage.getItem('pizza_palace_coupon') || '';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeOrder, setActiveOrder] = useState<OrderTrack | null>(null);
  const [ordersList, setOrdersList] = useState<OrderTrack[]>([]);
  const [reviews, setReviews] = useState<PizzaReview[]>([]);

  // --- TOAST SERVICE ---
  const addToast = useCallback((text: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    // Strict requirement: Limit toast queue length to exactly one at all times to prevent multiple popups
    setToasts([{ id, text, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- JWT SESSION RESTORATION ON STARTUP ---
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('pizza_palace_jwt_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setCurrentUser({
                uid: data.user._id || data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role,
                isLoggedIn: true
              });
              addToast(`Welcome back, ${data.user.name}!`, 'success');
              return;
            }
          }
        } catch (err) {
          console.warn("Failed to verify existing session token:", err);
        }
        // Clean up invalid or expired tokens
        localStorage.removeItem('pizza_palace_jwt_token');
      }
      
      setCurrentUser({
        email: '',
        name: 'Guest',
        isLoggedIn: false
      });
    };

    initializeAuth();
  }, [addToast]);

  // --- PERSISTENCE SYNCS ---
  useEffect(() => {
    localStorage.setItem('pizza_palace_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pizza_palace_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('pizza_palace_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#0c0c0c'; // Pitch black
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#fcfcfd'; // Warm white
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pizza_palace_coupon', couponCode);
  }, [couponCode]);

  // --- EXPRESS API SYNC LAYER ---
  const syncOrdersFromServer = useCallback(async () => {
    if (!currentUser.isLoggedIn) return;
    try {
      const token = localStorage.getItem('pizza_palace_jwt_token');
      const res = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const allOrders: OrderTrack[] = await res.json();
        
        // Ensure accurate order sorting
        allOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrdersList(allOrders);

        const active = allOrders.find(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
        if (active) {
          setActiveOrder(active);
        } else {
          setActiveOrder(null);
        }
      }
    } catch (err) {
      console.warn("Express order sync failure:", err);
    }
  }, [currentUser]);

  const syncReviewsFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const allReviews: PizzaReview[] = await res.json();
        allReviews.sort((a, b) => b.createdAt - a.createdAt);
        setReviews(allReviews);
      }
    } catch (err) {
      console.warn("Express review sync failure:", err);
    }
  }, []);

  // Sync state initially and run background pool loop
  useEffect(() => {
    // Reviews are loaded for everyone
    syncReviewsFromServer();
    
    // Orders are loaded only for authenticated users
    if (currentUser.isLoggedIn) {
      syncOrdersFromServer();
    } else {
      setOrdersList([]);
      setActiveOrder(null);
    }

    const interval = setInterval(() => {
      syncReviewsFromServer();
      if (currentUser.isLoggedIn) {
        syncOrdersFromServer();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUser, syncOrdersFromServer, syncReviewsFromServer]);

  // --- CART FUNCTIONALITIES ---
  const addToCart = (pizza: Pizza, customization: PizzaCustomization, quantity: number) => {
    const customizationKey = `${customization.size}-${customization.crust}-${customization.extraCheese}-${customization.extraToppings.sort().join(',')}`;
    const cartItemId = `${pizza.id}-${customizationKey}`;

    const baseP = pizza.price;
    const sizeMultiplier = SIZE_MULTIPLIERS[customization.size];
    const crustPremium = CRUST_PREMIUMS[customization.crust];
    const cheesePremium = customization.extraCheese ? EXTRA_CHEESE_PRICE : 0;
    const toppingsPremium = customization.extraToppings.length * EXTRA_TOPPING_PRICE;

    let calculatedUnitPrice = parseFloat(
      ((baseP * sizeMultiplier) + crustPremium + cheesePremium + toppingsPremium).toFixed(2)
    );

    if (pizza.id.startsWith('ai-recommender-')) {
      calculatedUnitPrice = baseP;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === cartItemId);
      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += quantity;
        addToast(`Increased "${pizza.name}" quantity to ${updatedCart[existingIndex].quantity}!`, 'success');
        return updatedCart;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          pizza,
          customization,
          quantity,
          unitPrice: calculatedUnitPrice
        };
        addToast(`"${pizza.name}" (${customization.size}) added to your cart!`, 'success');
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    const item = cart.find(i => i.id === cartItemId);
    if (item) {
      setCart(prev => prev.filter(i => i.id !== cartItemId));
      addToast(`"${item.pizza.name}" removed from cart.`, 'warning');
    }
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- WISHLIST / FAVORITES ---
  const toggleWishlist = (pizzaId: string) => {
    setWishlist(prev => {
      if (prev.includes(pizzaId)) {
        addToast('Removed pizza from your favorites.', 'info');
        return prev.filter(id => id !== pizzaId);
      } else {
        addToast('Added pizza to your favorites ❤️', 'success');
        return [...prev, pizzaId];
      }
    });
  };

  const isWishlisted = (pizzaId: string) => wishlist.includes(pizzaId);

  // --- MERN REST AUTHENTICATION FLOWS ---
  const loginUser = async (email: string, password?: string) => {
    if (!password) {
      addToast('Password credentials are required!', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('pizza_palace_jwt_token', data.token);
        setCurrentUser(data.user);
        addToast(`Successfully logged in as ${data.user.name}!`, 'success');
      } else {
        throw new Error(data.message || 'Login failed.');
      }
    } catch (err: any) {
      addToast(err.message || 'Sign in failed! Please verify credentials.', 'error');
      throw err;
    }
  };

  const registerUser = async (email: string, password?: string, name?: string) => {
    if (!password) {
      addToast('Password is required to create your account!', 'error');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('pizza_palace_jwt_token', data.token);
        setCurrentUser(data.user);
        addToast(`Crust account registered! Welcome, ${data.user.name}!`, 'success');
      } else {
        throw new Error(data.message || 'Registration failed.');
      }
    } catch (err: any) {
      addToast(err.message || 'Registration failed! Email might be already in use.', 'error');
      throw err;
    }
  };

  const logoutUser = async () => {
    localStorage.removeItem('pizza_palace_jwt_token');
    setCurrentUser({ email: '', name: 'Guest', isLoggedIn: false });
    setOrdersList([]);
    setActiveOrder(null);
    addToast('Logged out successfully.', 'info');
  };

  // --- COUPON DISCOUNT SYSTEM ---
  const discountPercentage = VALID_COUPONS[couponCode] || 0;

  const applyCoupon = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode in VALID_COUPONS) {
      setCouponCode(cleanCode);
      const discountVal = VALID_COUPONS[cleanCode];
      addToast(`Promo code "${cleanCode}" applied! ${discountVal}% Discount`, 'success');
      return { success: true, message: `Promo code applied successfully! Enjoy ${discountVal}% off` };
    } else {
      addToast('Invalid promo code. Please check spelling!', 'error');
      return { success: false, message: 'Invalid promo code. Try PALACE50, PIZZALOVER, or WELCOME10!' };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    addToast('Coupon code removed.', 'info');
  };

  // --- CALCULATIONS FOR INDIAN RUPEES ---
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = parseFloat(cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0).toFixed(2));
  const discount = parseFloat(((subtotal * discountPercentage) / 100).toFixed(2));
  const taxableAmount = parseFloat((subtotal - discount).toFixed(2));
  const tax = parseFloat((taxableAmount * 0.05).toFixed(2)); // Balanced 5% Food GST
  const deliveryFee = cartCount > 0 ? (taxableAmount > 500 ? 0 : 49) : 0; // Free delivery above 500 rupees, else 49 rupees
  const total = parseFloat((taxableAmount + tax + deliveryFee).toFixed(2));

  // --- THEME ---
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- SECURE ORDERING ACTIONS (SECURED BY JWT HEADER) ---
  const placeOrder = async (deliveryAddress: string, orderType: 'Delivery' | 'DineIn', tableNumber?: string): Promise<boolean> => {
    if (cart.length === 0) return false;
    if (!currentUser.isLoggedIn) {
      addToast('You must authenticate an account to place secure orders!', 'warning');
      return false;
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const resolvedAddress = orderType === 'Delivery' ? deliveryAddress : `Dine-In • Table ${tableNumber}`;

    const newOrder = {
      id: orderId,
      customerEmail: currentUser.email,
      customerName: currentUser.name,
      items: [...cart],
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      status: 'Received',
      deliveryAddress: resolvedAddress,
      orderType,
      tableNumber: tableNumber || '',
      couponCode: couponCode || '',
    };

    try {
      const token = localStorage.getItem('pizza_palace_jwt_token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOrder)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        clearCart();
        setCouponCode('');
        addToast('Your gourmet pizza order has been recorded in our live kitchen!', 'success');
        syncOrdersFromServer();
        return true;
      } else {
        throw new Error(data.message || 'Failed to place order.');
      }
    } catch (err: any) {
      addToast(err.message || 'Order placement failed. Please try again.', 'error');
      return false;
    }
  };

  const cancelActiveOrder = async () => {
    if (!activeOrder) return;

    try {
      const token = localStorage.getItem('pizza_palace_jwt_token');
      const res = await fetch(`/api/orders/${activeOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      const data = await res.json();
      if (res.ok) {
        addToast('Your order was cancelled successfully.', 'warning');
        syncOrdersFromServer();
      } else {
        throw new Error(data.error || 'Failed to cancel order.');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel active order.', 'error');
    }
  };

  const advanceOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const token = localStorage.getItem('pizza_palace_jwt_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const data = await res.json();
      if (res.ok) {
        addToast(`Order ${orderId} successfully updated to "${nextStatus}".`, 'info');
        syncOrdersFromServer();
      } else {
        throw new Error(data.error || 'Failed to advance status.');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to advance order status.', 'error');
    }
  };

  const submitReview = async (orderId: string, pizzaId: string, pizzaName: string, rating: number, comment: string) => {
    const reviewId = 'REV-' + Date.now().toString() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const newReview = {
      id: reviewId,
      orderId,
      customerUid: currentUser.uid || 'guest_reviewer',
      customerName: currentUser.name || 'Anonymous Lover',
      pizzaId,
      pizzaName,
      rating,
      comment,
    };
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`Thank you for reviewing "${pizzaName}"! Your feedback is highly appreciated.`, 'success');
        syncReviewsFromServer();
      } else {
        throw new Error(data.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      addToast(err.message || 'Review submission failed.', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        tax,
        deliveryFee,
        discount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        isWishlisted,
        currentUser,
        loginUser,
        registerUser,
        logoutUser,
        couponCode,
        discountPercentage,
        applyCoupon,
        removeCoupon,
        toasts,
        addToast,
        removeToast,
        theme,
        toggleTheme,
        ordersList,
        activeOrder,
        placeOrder,
        cancelActiveOrder,
        advanceOrderStatus,
        reviews,
        submitReview
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
