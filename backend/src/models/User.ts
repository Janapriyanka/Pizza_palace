import mongoose from 'mongoose';

/**
 * UserSchema - MongoDB schema for platform users.
 *
 * Three roles exist:
 *  - 'customer' (default): can browse, order, and review.
 *  - 'owner':  full admin access — manages menu, tracks all orders.
 *  - 'admin':  same as owner (legacy alias kept for compatibility).
 *
 * Passwords are stored as bcrypt hashes (never plain text).
 * The `email` field is auto-lowercased + trimmed to prevent duplicates from casing.
 */
const UserSchema = new mongoose.Schema({
  // Display name shown in UI and receipts
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // Unique identifier used for login — stored lowercase to avoid case collisions
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  // bcryptjs-hashed password. NEVER store plain-text passwords here.
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  // Controls access level across the entire platform
  role: {
    type: String,
    enum: ['customer', 'owner', 'admin'],
    default: 'customer', // New registrations always start as regular customers
  },
  // Auto-stamped when the document is first created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export as Mongoose model — named 'User' so it maps to the 'users' collection
export const User = mongoose.model('User', UserSchema);
