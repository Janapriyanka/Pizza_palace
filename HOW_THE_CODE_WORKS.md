# 🍕 Pizza Palace — How the Code Works
### A Developer Guide for Junior Engineers

This document explains **how every part of the Pizza Palace codebase works**, why decisions were made, and how data flows from the user's browser all the way to the database and back. Read this top-to-bottom before touching any code.

---

## Table of Contents

1. [Big Picture — What We Built](#1-big-picture)
2. [How the Server Starts](#2-how-the-server-starts)
3. [Database Connection — The Smart Fallback System](#3-database-connection)
4. [Authentication — How Login Works](#4-authentication)
5. [The API Routes — Each Endpoint Explained](#5-api-routes)
6. [The Frontend — React + Context](#6-the-frontend)
7. [Global State — AppContext Explained](#7-global-state)
8. [The Cart System — Price Calculation](#8-cart-system)
9. [The Order Pipeline — From Cart to Kitchen](#9-order-pipeline)
10. [AI Pizza Recommender — Gemini Integration](#10-ai-recommender)
11. [Data Models — MongoDB Schemas](#11-data-models)
12. [Vercel Deployment — How It All Gets Hosted](#12-vercel-deployment)
13. [Key Files Reference](#13-key-files-reference)

---

## 1. Big Picture

Pizza Palace is a **MERN stack** application:

```
Browser (React + TypeScript)
    ↕  HTTP/HTTPS  (REST API calls with JWT tokens)
Express Server (Node.js + TypeScript)
    ↕  Mongoose ODM
MongoDB Atlas (Cloud Database)
    +
Google Gemini AI (for pizza recommendations)
```

**Two environments:**
- **Local dev**: Both frontend and backend run together via `npm run dev` (Express serves Vite middleware)
- **Production (Vercel)**: Frontend is a static build in `/dist`, backend runs as serverless functions via `/api/server.ts`

---

## 2. How the Server Starts

**File: `api/server.ts`**

When the server file loads (either locally or when Vercel invokes it), this is what happens in order:

```
1. Import libraries (express, mongoose, jwt, bcrypt, etc.)
2. Import our Mongoose models (User, Pizza, Order, Review)
3. Import our auth middleware (verifyToken, isAdmin)
4. Read environment variables (MONGO_URI, JWT_SECRET, PORT)
5. Define INITIAL_PIZZAS (hardcoded seed data)
6. Set up in-memory fallback arrays (IN_MEMORY_USERS, etc.)
7. Create Express app instance
8. Attach JSON body parser middleware
9. Attach DB-connection-check middleware (runs on EVERY request)
10. Register all API routes (auth, pizzas, orders, reviews, AI)
11. Attach Vite dev middleware (local) OR serve /dist (production)
12. Start listening on PORT (local only — Vercel handles this itself)
```

---

## 3. Database Connection — The Smart Fallback System

**Why this is tricky on Vercel:** Vercel runs your backend as serverless functions. Each function invocation may be a fresh process (cold start). Multiple requests can arrive at the same millisecond, each trying to open a database connection.

**The solution — Promise caching:**

```typescript
let dbConnectionPromise: Promise<any> | null = null;

async function connectToDatabase() {
  // If already connected, skip
  if (mongoose.connection.readyState === 1) return;

  // If a connection is already in progress, return the SAME promise
  // (not a new one). This prevents race conditions.
  if (dbConnectionPromise) return dbConnectionPromise;

  // First caller: start the connection and cache the promise
  dbConnectionPromise = (async () => {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      useInMemoryFallback = false; // MongoDB is live
      await seedDatabase();        // Auto-seed pizzas + admin user
    } catch (err) {
      useInMemoryFallback = true;  // MongoDB failed → use RAM
      await initializeInMemorySeeding(); // Seed admin into RAM
    }
  })();
}
```

**The In-Memory Fallback:** If MongoDB is down or the connection string is wrong, the server automatically switches to storing all data in JavaScript arrays (`IN_MEMORY_USERS`, `IN_MEMORY_PIZZAS`, etc.). This means the site **never crashes** — it just loses persistence across server restarts.

Every API route checks `if (useInMemoryFallback)` and handles both cases.

---

## 4. Authentication — How Login Works

We use **JWT (JSON Web Tokens)** — no sessions, no cookies.

### Registration Flow

```
Frontend (Auth.tsx)
  → POST /api/auth/register { name, email, password }
    → Validate inputs (name, email, password ≥ 6 chars)
    → Check if email already exists in DB
    → Hash the password: bcrypt.hash(password, 12)
    → Create User document in MongoDB
    → Sign a JWT: jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '24h' })
    → Return { success: true, token, user }
  ← Frontend stores token in localStorage
  ← Frontend sets currentUser state → user is now "logged in"
```

### Login Flow

```
Frontend (Auth.tsx)
  → POST /api/auth/login { email, password }
    → Find user by email in MongoDB
    → Compare passwords: bcrypt.compare(inputPassword, user.password)
    → If match: sign JWT and return it
    → If no match: return 400 "Invalid credentials"
  ← Frontend stores token in localStorage
```

### How Protected Routes Work

Every protected API call includes the JWT in the header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The `verifyToken` middleware in `src/middleware/auth.ts`:
1. Extracts the token from the header
2. Calls `jwt.verify(token, JWT_SECRET)` — this checks the signature AND expiry
3. If valid: attaches decoded payload to `req.user` → route handler runs
4. If invalid: returns 401 immediately

### Session Restoration on Refresh

When the page loads, `AppContext.tsx` checks for a saved token in localStorage and calls `GET /api/auth/profile` to restore the session automatically.

---

## 5. API Routes — Each Endpoint Explained

### Auth Routes (`/api/auth/*`)

| Route | What it does |
|---|---|
| `POST /register` | Creates a new user account, returns JWT |
| `POST /login` | Validates credentials, returns JWT |
| `GET /profile` | Returns logged-in user's data (JWT required) |
| `PUT /profile` | Updates user's display name (JWT required) |

### Pizza Routes (`/api/pizzas`)

| Route | What it does |
|---|---|
| `GET /api/pizzas` | Returns all pizzas. Add `?category=Veggie` to filter |
| `GET /api/pizzas/:id` | Returns one pizza by ID |
| `POST /api/pizzas` | Creates a new pizza — **OWNER ONLY** |
| `PUT /api/pizzas/:id` | Updates pizza details — **OWNER ONLY** |
| `DELETE /api/pizzas/:id` | Removes pizza from menu — **OWNER ONLY** |

The `verifyToken + isAdmin` middleware chain guards the owner-only routes. A regular customer calling POST /api/pizzas gets a 403 Forbidden.

### Order Routes (`/api/orders`)

| Route | What it does |
|---|---|
| `POST /api/orders` | Places a new order |
| `GET /api/orders` | Owners see ALL orders; customers see only THEIR orders |
| `GET /api/orders/my` | Always returns only the logged-in user's orders |
| `PATCH /api/orders/:id` | Updates status (owners can set any status; customers can only cancel) |
| `DELETE /api/orders/:id` | Cancels an order (only if status = "Received") |

### Review Routes (`/api/reviews`)

| Route | What it does |
|---|---|
| `GET /api/reviews` | Returns all reviews (public, no auth needed) |
| `POST /api/reviews` | Submits a review AND recalculates pizza rating |

When a review is submitted, the server:
1. Saves the review document
2. Fetches ALL reviews for that pizza
3. Calculates average rating: `sum / count`
4. Updates the Pizza document's `rating` and `reviewsCount` fields

---

## 6. The Frontend — React + Context

**File: `src/App.tsx`**

App.tsx is the root. It wraps everything in two things:
- `<AppProvider>` — the global state store (see next section)
- `<Router>` — React Router's HashRouter

Routes map URL paths to page components:

```
/           → Home.tsx     (hero, featured pizzas, testimonials)
/menu       → Menu.tsx     (full catalogue with filters)
/cart       → Cart.tsx     (cart, checkout, order tracking, reviews)
/about      → About.tsx    (restaurant story)
/contact    → Contact.tsx  (contact form)
/auth       → Auth.tsx     (login + register forms)
/owner      → OwnerDashboard.tsx  (admin panel)
/builder    → CustomPizzaBuilder.tsx  (step-by-step builder)
/ai-recommender → AIPizzaRecommender.tsx  (AI chat interface)
*           → NotFound.tsx (404 page)
```

We use **HashRouter** (URLs like `/#/menu`) instead of BrowserRouter because Vercel's serverless routing handles path-based routing via `vercel.json`, and HashRouter avoids conflicts with the SPA fallback.

---

## 7. Global State — AppContext Explained

**File: `src/context/AppContext.tsx`**

This is the brain of the frontend. It uses React Context + `useState` + `useEffect` to manage ALL shared state. Any component can call `useApp()` to access it.

### What state lives here

| State | Type | What it is |
|---|---|---|
| `cart` | `CartItem[]` | Items currently in the cart |
| `currentUser` | `User` | Logged-in user info (or Guest) |
| `theme` | `'dark' \| 'light'` | UI theme preference |
| `couponCode` | `string` | Currently applied coupon |
| `ordersList` | `OrderTrack[]` | All orders for the current user |
| `activeOrder` | `OrderTrack \| null` | The most recent non-delivered order |
| `reviews` | `PizzaReview[]` | All platform reviews |
| `toasts` | `ToastMessage[]` | Notification pop-ups |
| `wishlist` | `string[]` | Pizza IDs the user favorited |

### localStorage persistence

Several state values are saved to localStorage so they survive page refreshes:
- `pizza_palace_cart` — cart contents
- `pizza_palace_wishlist` — saved favorites
- `pizza_palace_theme` — dark/light preference
- `pizza_palace_coupon` — active coupon
- `pizza_palace_jwt_token` — authentication token

### The polling loop

Every 4 seconds, the context syncs orders and reviews from the server:
```typescript
const interval = setInterval(() => {
  syncReviewsFromServer();
  if (currentUser.isLoggedIn) {
    syncOrdersFromServer();
  }
}, 4000);
```

This makes the order status tracker feel "live" without WebSockets.

---

## 8. Cart System — Price Calculation

When a user adds a pizza to the cart, the price is calculated dynamically:

```
unitPrice = (basePrice × sizeMultiplier) + crustPremium + cheesePremium + toppingsPremium
```

**Example: Large Quattro Formaggi with Cheese Burst + Extra Cheese + 2 toppings**
```
basePrice      = ₹429
sizeMultiplier = 1.4  (Large)
crustPremium   = ₹50  (Cheese Burst)
cheesePremium  = ₹30  (Extra Cheese)
toppingsPremium= ₹40  (2 × ₹20)

unitPrice = (429 × 1.4) + 50 + 30 + 40
          = 600.60 + 120
          = ₹720.60
```

The `cartItemId` is a hash combining `pizzaId + customization`:
```typescript
const cartItemId = `${pizza.id}-${size}-${crust}-${extraCheese}-${sortedToppings}`;
```

This means adding the same pizza with different sizes creates two separate cart entries, but adding the same pizza with the same customization increments the existing item's quantity.

**Order totals calculation:**
```
subtotal     = sum(unitPrice × quantity) for all cart items
discount     = subtotal × (couponPercentage / 100)
taxableAmount= subtotal - discount
tax          = taxableAmount × 0.05  (5% GST)
deliveryFee  = taxableAmount > 500 ? ₹0 : ₹49
total        = taxableAmount + tax + deliveryFee
```

---

## 9. Order Pipeline — From Cart to Kitchen

### Placing an Order

1. User clicks "Place Order" in `Cart.tsx`
2. `AppContext.placeOrder()` is called with delivery address + order type
3. A unique order ID is generated: `'ORD-' + random6digits`
4. The full order object (cart items, prices, customer info) is sent to `POST /api/orders`
5. Server attaches `userId` from the JWT and saves to MongoDB
6. Cart is cleared, order appears in the tracking panel

### Order Status Lifecycle

```
Received → Preparing → Baking → Quality Check → Ready → Out for Delivery → Delivered
    ↘ Cancelled (only possible from Received or Preparing)
```

**Owner** can advance any order to any status via the Owner Dashboard.
**Customer** can only cancel their own order (and only if it's "Received" status).

The status tracker in `Cart.tsx` polls every 4 seconds (via AppContext's interval) and animates the progress bar based on the current status.

---

## 10. AI Recommender — Gemini Integration

**File: `src/pages/AIPizzaRecommender.tsx` + `api/server.ts` (POST /api/recommend-pizza)**

The AI flow:
1. User enters their mood/craving in the chat interface
2. Frontend calls `POST /api/recommend-pizza { mood, cravings }`
3. Server builds a detailed prompt telling Gemini exactly what JSON to return
4. Gemini 2.5 Flash generates a custom pizza recipe as JSON
5. Server parses and validates the JSON, returns it to the frontend
6. Frontend displays the generated pizza with an "Add to Cart" button

**Retry logic:** The server tries up to 3 times with exponential backoff (800ms → 1600ms → 3200ms) in case Gemini rate limits kick in.

**Lazy initialization:** The Gemini client is only created on the first AI request (not at server startup). This avoids errors if `GEMINI_API_KEY` is not set.

---

## 11. Data Models — MongoDB Schemas

### User
```
name       String  — Display name
email      String  — Login identifier (unique, lowercase)
password   String  — bcrypt hash
role       String  — 'customer' | 'owner' | 'admin'
createdAt  Date    — Account creation time
```

### Pizza
```
name          String   — Menu display name
description   String   — Descriptive text
price         Number   — Base price in INR
image         String   — Unsplash image URL
category      String   — 'Classic'|'Signature'|'Supreme'|'Veggie'
isVeg         Boolean  — Vegetarian indicator
rating        Number   — Average star rating (auto-updated on review)
reviewsCount  Number   — Total review count (auto-updated on review)
ingredients   [String] — List of main ingredients
isFeatured    Boolean  — Show in homepage carousel
isAvailable   Boolean  — Soft availability toggle
```

### Order
```
id             String  — Frontend ID like "ORD-847312"
userId         ObjectId— Reference to User
customerEmail  String  — Copied at order time
items          Mixed[] — Array of CartItem objects
subtotal       Number  — Pre-tax, pre-fee total
deliveryFee    Number  — ₹0 or ₹49
tax            Number  — 5% GST
discount       Number  — Coupon amount
total          Number  — Grand total
status         String  — Current lifecycle stage
deliveryAddress String — Street address or "Dine-In • Table X"
orderType      String  — 'Delivery' | 'DineIn'
couponCode     String  — Used coupon (if any)
createdAt      Number  — Unix millisecond timestamp
```

### Review
```
id           String — Frontend ID like "REV-1717123456ABC"
orderId      String — Which order this came from
customerUid  String — Who wrote it
customerName String — Copied at review time
pizzaId      String — Which pizza is being reviewed
pizzaName    String — Copied at review time
rating       Number — 1–5 stars
comment      String — Written feedback
createdAt    Number — Unix millisecond timestamp
```

---

## 12. Vercel Deployment — How It All Gets Hosted

**File: `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/server" },
    { "source": "/(.*)",     "destination": "/index.html" }
  ]
}
```

This does two things:
1. **API routing**: Any request to `/api/anything` is forwarded to `api/server.ts` (which Vercel runs as a serverless function)
2. **SPA fallback**: Everything else serves `index.html`, letting React Router handle navigation on the client side

**Build process:**
1. `vite build` compiles and bundles all React/TypeScript into `/dist`
2. Vercel detects TypeScript API files in `/api/` and compiles them automatically
3. Both `/dist` (static) and `/api` (serverless) are deployed together

**Environment variables** must be set in the Vercel Dashboard (not committed to git):
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Random string for signing tokens
- `GEMINI_API_KEY` — Google AI Studio key

---

## 13. Key Files Reference

| File | Role |
|---|---|
| `api/server.ts` | **THE** backend — all Express routes and DB logic |
| `src/context/AppContext.tsx` | **THE** frontend brain — all state and API calls |
| `src/middleware/auth.ts` | JWT verification and role guards |
| `src/models/User.ts` | User MongoDB schema |
| `src/models/Pizza.ts` | Pizza MongoDB schema |
| `src/models/Order.ts` | Order MongoDB schema |
| `src/models/Review.ts` | Review MongoDB schema |
| `src/types.ts` | TypeScript interfaces used across the frontend |
| `src/App.tsx` | Root React component — routing layout |
| `src/pages/Cart.tsx` | Most complex page — checkout + tracking + reviews |
| `src/pages/OwnerDashboard.tsx` | Admin panel — order management + menu CRUD |
| `src/pages/AIPizzaRecommender.tsx` | AI chat interface for pizza recommendations |
| `src/pages/CustomPizzaBuilder.tsx` | Step-by-step pizza creation wizard |
| `vercel.json` | Vercel routing config |
| `vite.config.ts` | Vite bundler and dev proxy settings |
| `.env.example` | Template for required environment variables |

---

## Common Questions

**Q: Why does the site work even without MongoDB?**
A: The server has a built-in in-memory fallback. If `mongoose.connect()` fails, all data is stored in JavaScript arrays for the lifetime of the serverless function. Data won't persist between requests in this mode, but the site won't crash.

**Q: Why use HashRouter instead of BrowserRouter?**
A: Vercel needs `vercel.json` to know which URLs are API calls vs. frontend routes. HashRouter keeps the `#` in URLs which the browser handles entirely client-side — no server involvement needed.

**Q: How are passwords kept secure?**
A: Passwords are **never** stored as plain text. They are hashed with bcrypt using 12 salt rounds before being saved. Even if someone gained direct database access, they'd see only hash strings.

**Q: What happens if the JWT expires?**
A: The token expires after 24 hours. The next API call returns 401, the frontend catches it, the user is logged out, and they're redirected to `/auth` to log in again.

**Q: How does the pizza rating update automatically?**
A: When a review is submitted, the server fetches ALL reviews for that pizza, computes the new average, and updates the Pizza document in MongoDB. This is "denormalization" — duplicating aggregated data to avoid slow joins.
