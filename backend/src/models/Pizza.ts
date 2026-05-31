import mongoose from 'mongoose';

/**
 * PizzaSchema - MongoDB schema for menu items (pizzas).
 *
 * This schema drives both the public menu catalogue and
 * the owner's admin dashboard. Key design decisions:
 *
 * - `id` field:  The frontend uses string IDs (e.g. 'p1', 'p2'). The toJSON
 *   transform maps Mongo's ObjectId `_id` → `id` automatically so the frontend
 *   never needs to handle ObjectIds.
 * - `rating` / `reviewsCount`: Denormalized aggregates updated every time
 *   a new review is submitted (see POST /api/reviews in server.ts).
 *   This avoids expensive aggregation queries on every menu load.
 * - `isFeatured`: Controls which pizzas appear in the homepage "Featured" carousel.
 * - `isAvailable`: Soft-toggle — the owner can mark a pizza unavailable instead
 *   of deleting it (useful for seasonal items).
 */
const PizzaSchema = new mongoose.Schema({
  // Human-readable display name shown on menu cards
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // Rich description used on the menu card hover + detail views
  description: {
    type: String,
    required: true,
  },
  // Base price in Indian Rupees (INR). Size multipliers are applied on the frontend.
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  // URL of the pizza hero image (currently sourced from Unsplash)
  image: {
    type: String,
    required: true,
  },
  // Category used for menu filter tabs
  category: {
    type: String,
    required: true,
    enum: ['Classic', 'Signature', 'Supreme', 'Veggie'],
  },
  // Vegetarian flag — renders green/red dot indicator on cards
  isVeg: {
    type: Boolean,
    default: false,
  },
  // Average rating (1–5 stars), recomputed after every review submission
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
  },
  // Total number of reviews — shown as "(N reviews)" beside stars
  reviewsCount: {
    type: Number,
    default: 0,
  },
  // List of top ingredients shown as chips on the menu card
  ingredients: {
    type: [String],
    default: [],
  },
  // When true this pizza appears in the Homepage Hero Featured section
  isFeatured: {
    type: Boolean,
    default: false,
  },
  // When false this pizza is hidden from the menu without being deleted
  isAvailable: {
    type: Boolean,
    default: true,
  },
  // Creation timestamp for sorting / analytics
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * toJSON transform:
 * Converts the MongoDB `_id` ObjectId to a plain string `id` field
 * and removes internal Mongo fields (__v, _id) so the frontend
 * always receives clean, predictable JSON objects.
 */
PizzaSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString(); // Map ObjectId → string id
    delete ret._id;              // Remove raw ObjectId
    delete ret.__v;              // Remove Mongoose version key
  }
});

export const Pizza = mongoose.model('Pizza', PizzaSchema);
export default Pizza;
