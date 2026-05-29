/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number; // Base price for small/medium
  image: string;
  category: 'Classic' | 'Signature' | 'Supreme' | 'Veggie';
  isVeg: boolean;
  rating: number;
  reviewsCount: number;
  ingredients: string[];
  isFeatured?: boolean;
}

export interface PizzaCustomization {
  size: 'Small' | 'Medium' | 'Large';
  crust: 'Classic Crust' | 'Thick Crust' | 'Thin Crust' | 'Cheese Burst';
  extraCheese: boolean;
  extraToppings: string[];
}

export interface CartItem {
  id: string; // Dynamic unique ID combining pizzaId + customization hash
  pizza: Pizza;
  customization: PizzaCustomization;
  quantity: number;
  unitPrice: number; // calculated based on size, crust, toppings
}

export interface User {
  email: string;
  name: string;
  isLoggedIn: boolean;
  uid?: string;
  role?: 'customer' | 'owner';
  isLocal?: boolean;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

export type OrderStatus = 'Received' | 'Preparing' | 'Baking' | 'Quality Check' | 'Ready' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface OrderTrack {
  id: string; // Dynamic unique ID or ORD-id
  userId?: string; // Document author ID
  customerUid?: string;
  customerEmail?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  updatedAt: string;
  deliveryAddress: string;
  orderType: 'Delivery' | 'DineIn';
  tableNumber?: string;
  couponCode?: string;
  createdAt?: number;
}

export interface PizzaReview {
  id: string;
  orderId: string;
  customerUid: string;
  customerName: string;
  pizzaId: string;
  pizzaName: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: number;
}

