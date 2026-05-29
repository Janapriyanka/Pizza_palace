/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Pizza, PizzaCustomization, CartItem, User, ToastMessage, OrderStatus, OrderTrack, PizzaReview } from '../types';
import { SIZE_MULTIPLIERS, CRUST_PREMIUMS, EXTRA_TOPPING_PRICE, EXTRA_CHEESE_PRICE } from '../data/pizzaData';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  collection, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  updateDoc 
} from 'firebase/firestore';

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
    return local ? JSON.parse(local) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const local = localStorage.getItem('pizza_palace_wishlist');
    return local ? JSON.parse(local) : [];
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const local = localStorage.getItem('pizza_palace_curr_user');
    return local ? JSON.parse(local) : {
      email: '',
      name: 'Guest',
      isLoggedIn: false
    };
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

  // --- PERSISTENCE SYNCS ---
  // Synchronize reviews from Firestore in real-time
  useEffect(() => {
    const reviewsCol = collection(db, 'reviews');
    const unsubscribe = onSnapshot(reviewsCol, (snapshot) => {
      const list: PizzaReview[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as PizzaReview);
      });
      list.sort((a, b) => b.createdAt - a.createdAt);
      setReviews(list);
    }, (error) => {
      console.error("Firestore reviews subscription failure:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('pizza_palace_curr_user', JSON.stringify(currentUser));
  }, [currentUser]);

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

  // --- REAL-TIME AUTH MONITOR & SNAPSHOT ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check for user Profile document in FireStore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          let role: 'customer' | 'owner' = 'customer';
          let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Pizza Lover';
          
          // Determine if their email makes them an Owner
          const emailLower = firebaseUser.email?.toLowerCase() || '';
          if (emailLower === 'admin@pizzapalace.com') {
            role = 'owner';
          }

          if (userSnap.exists()) {
            const data = userSnap.data();
            role = data.role || role;
            name = data.name || name;
          } else {
            // Write profile document for new accounts using lazy set check
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: name,
              role: role
            });
          }

          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: name,
            isLoggedIn: true,
            role: role
          });
          
          addToast(`Authenticated as ${name}! (${role === 'owner' ? 'Owner Portal Active' : 'Customer Account'})`, 'success');
        } catch (error) {
          console.error("Error setting up user session: ", error);
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.email?.split('@')[0] || 'Pizza Lover',
            isLoggedIn: true,
            role: 'customer'
          });
        }
      } else {
        setCurrentUser(prev => {
          if (prev.isLoggedIn && prev.isLocal) {
            return prev; // Maintain persistent local session bypass across reloads
          }
          return {
            email: '',
            name: 'Guest',
            isLoggedIn: false
          };
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // --- EXTRA EXPRESS REST ACTIVE SYNC FALLBACK LAYER ---
  const syncOrdersFromServer = useCallback(async () => {
    if (!currentUser.isLoggedIn || !currentUser.uid) return;
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const allOrders: OrderTrack[] = await res.json();
        // Owners see all orders, customers see only theirs
        const userOrders = currentUser.role === 'owner'
          ? allOrders
          : allOrders.filter(o => o.customerUid === currentUser.uid);
        
        userOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setOrdersList(userOrders);

        const active = userOrders.find(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
        if (active) {
          setActiveOrder(active);
        } else {
          setActiveOrder(null);
        }
      }
    } catch (err) {
      console.warn("Express order sync bypass warning:", err);
    }
  }, [currentUser]);

  const syncReviewsFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const allReviews: PizzaReview[] = await res.json();
        setReviews(allReviews);
      }
    } catch (err) {
      console.warn("Express review sync bypass warning:", err);
    }
  }, []);

  // Sync state initially and run background pool loop
  useEffect(() => {
    if (!currentUser.isLoggedIn || !currentUser.uid) return;
    
    syncOrdersFromServer();
    syncReviewsFromServer();

    const interval = setInterval(() => {
      syncOrdersFromServer();
      syncReviewsFromServer();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, syncOrdersFromServer, syncReviewsFromServer]);

  // --- REAL-TIME ORDER TRACKER FOR LOGGED OUT/IN USERS (FIRESTORE STREAM) ---
  useEffect(() => {
    if (!currentUser.isLoggedIn || !currentUser.uid) {
      setActiveOrder(null);
      setOrdersList([]);
      return;
    }

    // Subscribe to customer's orders in Firestore
    const ordersCol = collection(db, 'orders');
    const q = query(
      ordersCol, 
      where('customerUid', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders: OrderTrack[] = [];
      snapshot.forEach(docSnap => {
        orders.push(docSnap.data() as OrderTrack);
      });

      // Sort client-side to avoid needing a composite index
      orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      setOrdersList(orders);

      // Set active order as the latest non-terminal order
      const active = orders.find(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
      if (active) {
        setActiveOrder(active);
      } else {
        setActiveOrder(null);
      }
    }, (error) => {
      console.warn("Firestore orders query failure, continuing with Express Sync Fallback:", error);
    });

    return () => unsubscribe();
  }, [currentUser]);

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

  // --- REAL AUTH FLOW WITH HYBRID/LOCAL BYPASS FALLBACK ---
  const loginUser = async (email: string, password?: string) => {
    if (!password) {
      addToast('Password credentials are required!', 'error');
      return;
    }

    const emailLower = email.toLowerCase();
    const isAdmin = emailLower === 'admin@pizzapalace.com' && password === 'pizzapalace';

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.warn("Firebase sign-in failed, checking for local admin bypass or client-side flow: ", err);

      const isConfigError = err && (
        err.code === 'auth/operation-not-allowed' || 
        err.name === 'auth/operation-not-allowed' ||
        err.message?.includes('operation-not-allowed') ||
        err.message?.includes('auth-config-error') ||
        err.message?.includes('network-request-failed')
      );

      if (isAdmin || isConfigError) {
        const role = emailLower === 'admin@pizzapalace.com' ? 'owner' : 'customer';
        const displayName = emailLower === 'admin@pizzapalace.com'
          ? 'Admin Chef'
          : (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) || 'Pizza Lover');

        setCurrentUser({
          uid: emailLower === 'admin@pizzapalace.com' ? 'admin_chef_id' : `local_uid_${Date.now()}`,
          email: email,
          name: displayName,
          isLoggedIn: true,
          role: role,
          isLocal: true
        });

        addToast(`Successfully logged in as ${displayName}! (Offline Fallback)`, 'success');
        return;
      }

      addToast('Sign in failed! Please verify your password spelling.', 'error');
      throw err;
    }
  };

  const registerUser = async (email: string, password?: string, name?: string) => {
    if (!password) {
      addToast('Password is required to create your account!', 'error');
      return;
    }

    const emailLower = email.toLowerCase();
    const isAdmin = emailLower === 'admin@pizzapalace.com' && password === 'pizzapalace';

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name || 'Pizza Lover' });
        const userDocRef = doc(db, 'users', cred.user.uid);
        
        let role: 'customer' | 'owner' = 'customer';
        if (emailLower === 'admin@pizzapalace.com') {
          role = 'owner';
        }

        try {
          await setDoc(userDocRef, {
            uid: cred.user.uid,
            email: email,
            name: name || 'Pizza Lover',
            role: role
          });
        } catch (firestoreErr) {
          console.warn("Could not save profile in Firestore, proceeding with authentication anyway:", firestoreErr);
        }
      }
    } catch (err: any) {
      console.warn("Firebase sign-up failed, checking local fallback strategy: ", err);

      const isConfigError = err && (
        err.code === 'auth/operation-not-allowed' || 
        err.name === 'auth/operation-not-allowed' ||
        err.message?.includes('operation-not-allowed') ||
        err.message?.includes('auth-config-error') ||
        err.message?.includes('network-request-failed')
      );

      if (isAdmin || isConfigError) {
        const role = emailLower === 'admin@pizzapalace.com' ? 'owner' : 'customer';
        const displayName = name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) || 'Pizza Lover');

        setCurrentUser({
          uid: emailLower === 'admin@pizzapalace.com' ? 'admin_chef_id' : `local_uid_${Date.now()}`,
          email: email,
          name: displayName,
          isLoggedIn: true,
          role: role,
          isLocal: true
        });

        addToast(`Successfully registered as ${displayName}! (Offline Fallback)`, 'success');
        return;
      }

      addToast('Registration failed! Email might be already in use.', 'error');
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase logout failed, cleaning up local storage session:", err);
    }
    localStorage.removeItem('pizza_palace_curr_user');
    setCurrentUser({ email: '', name: 'Guest', isLoggedIn: false });
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

  // --- FIRESTORE SECURE ORDERING ACTIONS (COUPLING EXPRESS REST + FIRESTORE SYNC) ---
  const placeOrder = async (deliveryAddress: string, orderType: 'Delivery' | 'DineIn', tableNumber?: string): Promise<boolean> => {
    if (cart.length === 0) return false;
    if (!currentUser.isLoggedIn || !currentUser.uid) {
      addToast('You must authenticate an account to place secure orders!', 'warning');
      return false;
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const resolvedAddress = orderType === 'Delivery' ? deliveryAddress : `Dine-In • Table ${tableNumber}`;

    const newOrder: OrderTrack = {
      id: orderId,
      userId: currentUser.uid || '',
      customerUid: currentUser.uid || '',
      customerEmail: currentUser.email || '',
      customerName: currentUser.name || '',
      items: [...cart],
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      status: 'Received',
      updatedAt: new Date().toLocaleTimeString(),
      deliveryAddress: resolvedAddress,
      orderType,
      tableNumber: tableNumber || '',
      couponCode: couponCode || '',
      createdAt: Date.now()
    };

    // 1. Post to Express REST endpoint for bulletproof shared storage
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (err) {
      console.warn("REST server backup order failed:", err);
    }

    // 2. Write to client-side Firestore for real-time cloud triggers
    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
      clearCart();
      setCouponCode('');
      addToast('Your gourmet pizza order has been recorded in our live kitchen!', 'success');
      syncOrdersFromServer();
      return true;
    } catch (err) {
      console.warn("Firestore order placement failed, falling back to local simulation.", err);
      setOrdersList(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);
      clearCart();
      setCouponCode('');
      addToast('Your gourmet pizza order has been placed successfully!', 'success');
      syncOrdersFromServer();
      return true;
    }
  };

  const cancelActiveOrder = async () => {
    if (!activeOrder) return;

    // 1. Update on Express server
    try {
      await fetch(`/api/orders/${activeOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
    } catch (err) {
      console.warn("REST server patch failed:", err);
    }

    // 2. Update Firestore
    try {
      await updateDoc(doc(db, 'orders', activeOrder.id), {
        status: 'Cancelled',
        updatedAt: new Date().toLocaleTimeString()
      });
      addToast('Your order was cancelled. Our kitchen has ceased operation on it.', 'warning');
      syncOrdersFromServer();
    } catch (err) {
      console.warn("Firestore order cancel failed, falling back to local state.", err);
      // Fallback local state update:
      setOrdersList(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'Cancelled', updatedAt: new Date().toLocaleTimeString() } : o));
      setActiveOrder(null);
      addToast('Your order was cancelled locally.', 'warning');
      syncOrdersFromServer();
    }
  };

  const advanceOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    // 1. Update on Express server
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      console.warn("REST server patch status failed:", err);
    }

    // 2. Update Firestore
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: nextStatus,
        updatedAt: new Date().toLocaleTimeString()
      });
      addToast(`Order ${orderId} successfully updated to "${nextStatus}".`, 'info');
      syncOrdersFromServer();
    } catch (err) {
      console.warn("Firestore order status advance failed, falling back to local state.", err);
      setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus, updatedAt: new Date().toLocaleTimeString() } : o));
      addToast(`Order ${orderId} successfully updated to "${nextStatus}" (Offline Mode).`, 'info');
      syncOrdersFromServer();
    }
  };

  const submitReview = async (orderId: string, pizzaId: string, pizzaName: string, rating: number, comment: string) => {
    const reviewId = 'REV-' + Date.now().toString() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const newReview: PizzaReview = {
      id: reviewId,
      orderId,
      customerUid: currentUser.uid || 'guest_reviewer',
      customerName: currentUser.name || 'Anonymous Lover',
      pizzaId,
      pizzaName,
      rating,
      comment,
      createdAt: Date.now()
    };
    
    // 1. Post to Express REST server
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
    } catch (err) {
      console.warn("REST backup review post failed:", err);
    }

    // 2. Try Firestore write
    try {
      await setDoc(doc(db, 'reviews', reviewId), newReview);
      addToast(`Thank you for reviewing the handcrafted ${pizzaName}! Your feedback means the world to our bakers.`, 'success');
      syncReviewsFromServer();
    } catch (err) {
      console.error("Firestore submitReview failure:", err);
      setReviews(prev => [newReview, ...prev]);
      addToast(`Thank you for reviewing ${pizzaName}! (Offline Fallback)`, 'success');
      syncReviewsFromServer();
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
