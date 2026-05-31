import mongoose from 'mongoose';

/**
 * OrderSchema - MongoDB schema for customer orders.
 *
 * Each order document captures a complete snapshot of a transaction at
 * the moment of checkout, including item prices, customer details, and
 * full delivery/dine-in information.
 *
 * Order lifecycle (status field):
 *   Received → Preparing → Baking → Quality Check →
 *   Ready → Out for Delivery → Delivered
 *                     ↘ Cancelled (can be set from Received or Preparing only)
 *
 * Design note: `id` is a frontend-generated string like "ORD-123456" stored
 * alongside Mongo's `_id`. This lets both the frontend and backend look up
 * orders by the user-friendly ID without ObjectId handling.
 */
const OrderSchema = new mongoose.Schema({
  // Frontend-generated order ID (e.g. "ORD-847312") — unique across all orders
  id: {
    type: String,
    required: true,
    unique: true,
  },
  // Reference to the User document who placed this order
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // String version of the user ID — used for quick filtering without ObjectId casting
  customerUid: {
    type: String,
  },
  // Customer email copied at order time (denormalized for display in dashboard)
  customerEmail: {
    type: String,
  },
  // Customer name copied at order time (denormalized for display in dashboard)
  customerName: {
    type: String,
  },
  // Array of CartItem objects — each contains pizza, customization, quantity, and unit price.
  // Using Mixed type because CartItem is a complex nested structure defined on the frontend.
  items: {
    type: [mongoose.Schema.Types.Mixed],
    required: true,
  },
  // Price before tax and delivery (sum of unitPrice × quantity for all items)
  subtotal: {
    type: Number,
    required: true,
  },
  // Delivery fee charged (₹49 standard, ₹0 if order is above ₹500)
  deliveryFee: {
    type: Number,
    required: true,
  },
  // 5% GST applied on (subtotal - discount)
  tax: {
    type: Number,
    required: true,
  },
  // Coupon discount amount in INR
  discount: {
    type: Number,
    required: true,
  },
  // Grand total the customer paid = (subtotal - discount) + tax + deliveryFee
  total: {
    type: Number,
    required: true,
  },
  // Current stage of the order in the kitchen-to-delivery pipeline
  status: {
    type: String,
    enum: ['Received', 'Preparing', 'Baking', 'Quality Check', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Received', // All new orders start here
  },
  // Human-readable timestamp of the last status change (e.g. "14:32:07")
  updatedAt: {
    type: String,
  },
  // Delivery address string OR "Dine-In • Table X" for in-restaurant orders
  deliveryAddress: {
    type: String,
    required: true,
  },
  // Whether the order is home delivery or dine-in
  orderType: {
    type: String,
    enum: ['Delivery', 'DineIn'],
    required: true,
  },
  // Table number for DineIn orders (empty string for Delivery orders)
  tableNumber: {
    type: String,
    default: '',
  },
  // Coupon code used (if any) — stored for analytics and receipts
  couponCode: {
    type: String,
    default: '',
  },
  // Unix millisecond timestamp of when the order was placed
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

/**
 * toJSON transform:
 * Maps _id → id and removes internal Mongo fields to keep the API response clean.
 * Falls back to _id.toString() if the string `id` field was not set.
 */
OrderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret.id || ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const Order = mongoose.model('Order', OrderSchema);
export default Order;
