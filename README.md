# 🍕 Pizza Palace — Full-Stack Pizza Ordering Platform

> A premium, feature-complete pizza ordering web application built with the MERN stack (MongoDB + Express + React + Node.js), deployed on Vercel with a Gemini AI recommender.

[![Live Demo](https://img.shields.io/badge/Live-pizzapalace--storefront.vercel.app-orange?style=for-the-badge)](https://pizzapalace-storefront.vercel.app)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)](#)
[![Deployed on](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge)](https://vercel.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛒 **Smart Cart** | Size/crust/topping customization with live price calculations |
| 🔐 **JWT Auth** | Secure login & registration with 24h token sessions |
| 📦 **Live Order Tracking** | Real-time status pipeline: Received → Preparing → Baking → Delivered |
| 🤖 **AI Pizza Recommender** | Gemini 2.5 Flash generates custom pizza recipes from your mood |
| 🧑‍🍳 **Custom Pizza Builder** | Build your own pizza with a visual step-by-step interface |
| 📊 **Owner Dashboard** | Full kitchen management — view all orders, advance statuses, manage menu |
| ⭐ **Review System** | Submit star ratings + comments per pizza after ordering |
| 🎟️ **Coupon System** | Discount codes (PALACE50, PIZZALOVER, WELCOME10, FREETAX) |
| 🌙 **Dark/Light Mode** | System-aware theme with persistence via localStorage |
| ☁️ **DB Fallback** | In-memory store activates automatically if MongoDB is unreachable |

---

## 🧱 Tech Stack

### Frontend
- **React 18** + **TypeScript** — component-based UI
- **React Router v6** — client-side routing (HashRouter)
- **Vite** — ultra-fast dev server + production bundler
- **Vanilla CSS** — custom design tokens, glassmorphism, dark mode

### Backend
- **Node.js** + **Express** — REST API server
- **Mongoose** — MongoDB ODM with schemas and validation
- **MongoDB Atlas** — cloud-hosted database
- **bcryptjs** — password hashing (12 salt rounds)
- **jsonwebtoken** — JWT authentication (24h expiry)
- **Google Gemini AI** (`@google/genai`) — AI pizza recommendations

### Infrastructure
- **Vercel** — serverless deployment (frontend + API functions)
- **Vercel Environment Variables** — secrets management

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- A MongoDB Atlas account (or local MongoDB)
- A Google Gemini API key (from [Google AI Studio](https://aistudio.google.com))

### 1. Clone and install
```bash
git clone <your-repo-url>
cd Pizzamaxxing
npm install
```

### 2. Set up environment variables
Copy the example env file and fill in your values:
```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=your_super_secret_key_change_this
GEMINI_API_KEY=AIzaSy...your_key_here
PORT=5000
```

### 3. Run the development server
```bash
npm run dev
```

This starts both the Express API and the Vite frontend on **http://localhost:5000**.

---

## 🔑 Admin Access

| Credential | Value |
|---|---|
| Email | `admin@pizzapalace.com` |
| Password | `pizzapalace` |

The admin account is auto-seeded when the database is first connected. Use the **Owner Dashboard** (`/owner` route) to manage orders and the menu.

---

## 📁 Project Structure

```
Pizzamaxxing/
├── api/
│   └── server.ts          # Express API server (Vercel serverless entry)
├── src/
│   ├── components/        # Reusable UI components (Navbar, Footer, Cards...)
│   ├── context/
│   │   └── AppContext.tsx  # Global state — cart, auth, orders, reviews
│   ├── middleware/
│   │   └── auth.ts        # JWT verifyToken + isAdmin guards
│   ├── models/            # Mongoose schemas (User, Pizza, Order, Review)
│   ├── pages/             # Full page components routed by React Router
│   ├── data/              # Static pizza data, pricing constants
│   ├── types.ts           # TypeScript interfaces shared across frontend
│   ├── App.tsx            # Root component — router + layout
│   └── main.tsx           # React DOM entry point
├── index.html             # Vite HTML shell
├── vite.config.ts         # Vite build + dev proxy config
├── vercel.json            # Vercel routing rules (API → serverless, SPA fallback)
├── tsconfig.json          # TypeScript compiler config
├── package.json           # Scripts and dependencies
└── .env.example           # Template for environment variables
```

---

## 🌐 API Endpoints

### Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Create a new account |
| POST | `/api/auth/login` | ❌ | Login and receive JWT |
| GET | `/api/auth/profile` | ✅ JWT | Get logged-in user profile |
| PUT | `/api/auth/profile` | ✅ JWT | Update display name |

### Pizza Menu
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/pizzas` | ❌ | List all pizzas (filter by `?category=`) |
| GET | `/api/pizzas/:id` | ❌ | Get a single pizza |
| POST | `/api/pizzas` | 🔒 Owner | Add a new pizza |
| PUT | `/api/pizzas/:id` | 🔒 Owner | Update pizza details |
| DELETE | `/api/pizzas/:id` | 🔒 Owner | Remove pizza from menu |

### Orders
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | ✅ JWT | Place a new order |
| GET | `/api/orders` | ✅ JWT | Get orders (all for owner, own for customer) |
| GET | `/api/orders/my` | ✅ JWT | Get only current user's orders |
| PATCH | `/api/orders/:id` | ✅ JWT | Update order status |
| DELETE | `/api/orders/:id` | ✅ JWT | Cancel an order |

### Reviews
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews` | ❌ | Get all reviews |
| POST | `/api/reviews` | ❌ | Submit a new review |

### AI
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/recommend-pizza` | ❌ | Generate AI pizza from mood/cravings |

---

## 🗂️ Available Coupon Codes

| Code | Discount |
|---|---|
| `PALACE50` | 50% off |
| `PIZZALOVER` | 20% off |
| `WELCOME10` | 10% off |
| `FREETAX` | 15% off |

---

## 🏗️ Deployment (Vercel)

The project is pre-configured for Vercel serverless deployment.

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

**Set environment variables in Vercel Dashboard:**
- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — a strong random secret (use `openssl rand -base64 32`)
- `GEMINI_API_KEY` — your Google AI Studio key

---

## 📝 License

Apache-2.0 — see file headers for details.
