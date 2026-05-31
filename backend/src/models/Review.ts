import mongoose from 'mongoose';

/**
 * ReviewSchema - MongoDB schema for pizza reviews.
 *
 * Reviews are linked to both an Order and a specific Pizza.
 * When a review is submitted, the server recomputes the pizza's average
 * rating and updates it in the Pizza document (denormalized aggregate).
 *
 * Reviews are currently public — no login required to view them, but
 * a user must have placed an order to logically submit one (enforced
 * by the frontend Cart page review flow, not by this schema itself).
 *
 * Like orders, `id` is a frontend-generated string ("REV-...") stored
 * alongside Mongo's `_id` for consistent lookups.
 */
const ReviewSchema = new mongoose.Schema({
  // Frontend-generated review ID (e.g. "REV-1717123456789ABC") — globally unique
  id: {
    type: String,
    required: true,
    unique: true,
  },
  // The order this review was submitted from — used to verify purchase
  orderId: {
    type: String,
    required: true,
  },
  // UID of the customer who wrote this review (matches User document _id as string)
  customerUid: {
    type: String,
    required: true,
  },
  // Customer display name copied at review time (denormalized for fast display)
  customerName: {
    type: String,
    required: true,
  },
  // Which pizza is being reviewed (string ID, e.g. "p1")
  pizzaId: {
    type: String,
    required: true,
  },
  // Pizza name copied at review time (for display without a join query)
  pizzaName: {
    type: String,
    required: true,
  },
  // Star rating: 1 (poor) to 5 (excellent)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  // The customer's written feedback
  comment: {
    type: String,
    required: true,
  },
  // Unix millisecond timestamp of when the review was submitted
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

/**
 * toJSON transform:
 * Ensures consistent `id` field and removes internal Mongo noise
 * from all API responses that include reviews.
 */
ReviewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret.id || ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const Review = mongoose.model('Review', ReviewSchema);
export default Review;
