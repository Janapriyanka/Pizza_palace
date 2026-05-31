import express from "express";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

// Models (with updated parent relative paths)
import { User } from "../src/models/User.js";
import { Pizza } from "../src/models/Pizza.js";
import { Order } from "../src/models/Order.js";
import { Review } from "../src/models/Review.js";

// Middleware
import { verifyToken, isAdmin, AuthenticatedRequest } from "../src/middleware/auth.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "pizza_palace_super_secret_key_123";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pizzapalace";
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// List of initial pizzas to seed
const INITIAL_PIZZAS = [
  {
    id: 'p1',
    name: 'Classic Margherita',
    description: 'A timeless Italian masterpiece with rich San Marzano tomato sauce, fresh creamy mozzarella cheese, fragrant sweet basil leaves, and a drizzle of extra virgin olive oil.',
    price: 299,
    image: '/pizzas/margherita.png',
    category: 'Classic',
    isVeg: true,
    rating: 4.8,
    reviewsCount: 142,
    ingredients: ['Tomato Sauce', 'Fresh Mozzarella', 'Basil Leaves', 'Olive Oil'],
    isFeatured: true
  },
  {
    id: 'p2',
    name: 'Premium Pepperoni',
    description: 'The absolute crowd favorite piled high with double-cured dynamic pepperoni slices, fresh mozzarella cheese, and our signature slow-simmered marinara sauce on hand-tossed dough.',
    price: 399,
    image: '/pizzas/pepperoni.png',
    category: 'Signature',
    isVeg: false,
    rating: 4.9,
    reviewsCount: 289,
    ingredients: ['Pepperoni', 'Mozzarella', 'Marinara Sauce', 'Oregano'],
    isFeatured: true
  },
  {
    id: 'p3',
    name: 'BBQ Smoked Chicken',
    description: 'Smokehouse grill meets Italian kitchen. Tender roasted chicken breast tossed in hickory BBQ sauce, red onions, charred bell peppers, cilantro, and authentic smoked Gouda cheese.',
    price: 449,
    image: '/pizzas/bbq_chicken.png',
    category: 'Signature',
    isVeg: false,
    rating: 4.7,
    reviewsCount: 198,
    ingredients: ['BBQ Chicken', 'Red Onions', 'Cilantro', 'Mozzarella', 'Smoked Gouda'],
    isFeatured: true
  },
  {
    id: 'p4',
    name: 'Garden Fresh Supreme',
    description: 'A vibrant garden of fresh vegetables including sweet bell peppers, red onions, juicy cherry tomatoes, sliced black olives, earthy mushrooms, and young spinach topped with light mozzarella.',
    price: 349,
    image: '/pizzas/garden_fresh.png',
    category: 'Veggie',
    isVeg: true,
    rating: 4.6,
    reviewsCount: 115,
    ingredients: ['Bell Peppers', 'Onions', 'Olives', 'Mushrooms', 'Spinach', 'Cherry Tomatoes'],
    isFeatured: false
  },
  {
    id: 'p5',
    name: 'Quattro Formaggi (Four Cheese)',
    description: 'The ultimate cheese lover’s dream. An incredibly luscious, rich blend of imported Mozzarella, aged Gorgonzola blue, sharp Parmesan, and creamy fresh Ricotta cheese.',
    price: 429,
    image: '/pizzas/four_cheese.png',
    category: 'Classic',
    isVeg: true,
    rating: 4.7,
    reviewsCount: 94,
    ingredients: ['Mozzarella', 'Gorgonzola', 'Parmesan', 'Ricotta', 'Garlic Oil'],
    isFeatured: false
  },
  {
    id: 'p6',
    name: 'Spicy Paneer Tikka Spice',
    description: 'An appetizing fusion marvel. Tender cubes of tandoori-marinated paneer, spicy red chilies, green capsicum, and juicy red onions with an aromatic mint-coriander drizzle.',
    price: 399,
    image: '/pizzas/paneer_tikka.png',
    category: 'Veggie',
    isVeg: true,
    rating: 4.5,
    reviewsCount: 81,
    ingredients: ['Paneer Tikka', 'Capsicum', 'Red Chillies', 'Mint Chutney', 'Onions'],
    isFeatured: false
  },
  {
    id: 'p7',
    name: 'The Ultimate Meat Supreme',
    description: 'Powerhouse combo packed with high-quality cured meats including sweet Italian pork sausage, seasoned pepperoni, shaved cured ham, crispy bacon bits, and chopped beef mince.',
    price: 499,
    image: '/pizzas/meat_supreme.png',
    category: 'Supreme',
    isVeg: false,
    rating: 4.9,
    reviewsCount: 312,
    ingredients: ['Sausage', 'Pepperoni', 'Ham', 'Bacon', 'Beef Mince', 'Mozzarella'],
    isFeatured: true
  },
  {
    id: 'p8',
    name: 'Truffle Mushroom Fusion',
    description: 'An elegant gourmet delicacy featuring wild forest mushrooms, drizzled with premium Black Truffle oil, fresh rosemary, sea salt, baby arugula, and shaved Parmesan flakes.',
    price: 549,
    image: '/pizzas/truffle_mushroom.png',
    category: 'Supreme',
    isVeg: true,
    rating: 4.8,
    reviewsCount: 156,
    ingredients: ['Wild Mushrooms', 'Truffle Oil', 'Rosemary', 'Arugula', 'Parmesan'],
    isFeatured: false
  }
];

// ==================== IN-MEMORY DATABASE FALLBACK ====================
let useInMemoryFallback = true;
const IN_MEMORY_USERS: any[] = [];
const IN_MEMORY_PIZZAS: any[] = [...INITIAL_PIZZAS];
const IN_MEMORY_ORDERS: any[] = [];
const IN_MEMORY_REVIEWS: any[] = [];

async function initializeInMemorySeeding() {
  const adminPasswordHash = await bcryptjs.hash("pizzapalace", 12);
  IN_MEMORY_USERS.push({
    id: "admin_chef_id",
    _id: "admin_chef_id",
    name: "Admin Chef",
    email: "admin@pizzapalace.com",
    password: adminPasswordHash,
    role: "owner"
  });
  console.log("In-Memory Fallback Pre-Seeding Complete.");
}

async function seedDatabase() {
  try {
    const pizzaCount = await Pizza.countDocuments();
    if (pizzaCount === 0) {
      console.log("Seeding initial pizza catalogue...");
      await Pizza.insertMany(INITIAL_PIZZAS);
      console.log("Seeding pizza catalogue complete.");
    }

    const adminEmail = "admin@pizzapalace.com";
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      console.log("Seeding default administrator user...");
      const hashedPassword = await bcryptjs.hash("pizzapalace", 12);
      await User.create({
        name: "Admin Chef",
        email: adminEmail,
        password: hashedPassword,
        role: "owner"
      });
      console.log("Seeding default administrator complete.");
    }
  } catch (error) {
    console.error("Database pre-seeding failed:", error);
  }
}

let dbConnectionPromise: Promise<any> | null = null;

// Asynchronous DB Connection (Runs concurrently in background without blocking route mounting)
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    useInMemoryFallback = false;
    return;
  }
  if (dbConnectionPromise) {
    return dbConnectionPromise;
  }

  console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
  mongoose.set('bufferCommands', false); // Disable Mongoose command buffering to prevent 10s hangs

  dbConnectionPromise = (async () => {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
      console.log("MongoDB connected successfully!");
      useInMemoryFallback = false;
      await seedDatabase();
    } catch (err: any) {
      console.warn("MongoDB connection failure, activating High Availability In-Memory fallback:", err.message || err);
      useInMemoryFallback = true;
      await initializeInMemorySeeding();
    }
  })();

  return dbConnectionPromise;
}

// Global Express Application instance
const app = express();
app.use(express.json());

// Reconnect/Database check middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.warn("Database connection check failed inside middleware:", err);
  }
  next();
});

// Initialize Gemini with lazy loading
let ai: GoogleGenAI | null = null;
const getGeminiClient = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please configure a key in Settings > Secrets.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
};

// ==================== AUTHENTICATION ENDPOINTS ====================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: "Please provide name, email, and password." });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    if (useInMemoryFallback) {
      const existing = IN_MEMORY_USERS.find(u => u.email === emailLower);
      if (existing) {
        res.status(400).json({ success: false, message: "An account with this email is already registered." });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
        return;
      }

      const hashedPassword = await bcryptjs.hash(password, 12);
      const role = emailLower === "admin@pizzapalace.com" ? "owner" : "customer";
      const newId = `user_${Date.now()}`;

      const newUser = {
        id: newId,
        _id: newId,
        name,
        email: emailLower,
        password: hashedPassword,
        role
      };
      IN_MEMORY_USERS.push(newUser);

      const token = jwt.sign(
        { id: newId, email: emailLower, role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        token,
        user: {
          uid: newId,
          name,
          email: emailLower,
          role,
          isLoggedIn: true
        }
      });
      return;
    }

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      res.status(400).json({ success: false, message: "An account with this email is already registered." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
      return;
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const role = emailLower === "admin@pizzapalace.com" ? "owner" : "customer";

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        uid: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isLoggedIn: true
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to register user." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Please provide email and password credentials." });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    if (useInMemoryFallback) {
      const user = IN_MEMORY_USERS.find(u => u.email === emailLower);
      if (!user) {
        res.status(400).json({ success: false, message: "Invalid email address or password combination." });
        return;
      }

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ success: false, message: "Invalid email address or password combination." });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        token,
        user: {
          uid: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isLoggedIn: true
        }
      });
      return;
    }

    const user = await User.findOne({ email: emailLower });
    if (!user) {
      res.status(400).json({ success: false, message: "Invalid email address or password combination." });
      return;
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid email address or password combination." });
      return;
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        uid: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isLoggedIn: true
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed to authenticate." });
  }
});

app.get("/api/auth/profile", verifyToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (useInMemoryFallback) {
      const user = IN_MEMORY_USERS.find(u => u.id === req.user?.id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }
      const userCopy = { ...user };
      delete userCopy.password;
      res.json({ success: true, user: userCopy });
      return;
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to load user profile." });
  }
});

app.put("/api/auth/profile", verifyToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Please specify a name." });
      return;
    }

    if (useInMemoryFallback) {
      const index = IN_MEMORY_USERS.findIndex(u => u.id === req.user?.id);
      if (index === -1) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }
      IN_MEMORY_USERS[index].name = name;
      const userCopy = { ...IN_MEMORY_USERS[index] };
      delete userCopy.password;
      res.json({ success: true, user: userCopy });
      return;
    }

    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select("-password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to update profile details." });
  }
});

// ==================== PIZZA CATALOGUE ENDPOINTS ====================

app.get("/api/pizzas", async (req, res) => {
  try {
    const { category } = req.query;
    
    if (useInMemoryFallback) {
      let pizzas = [...IN_MEMORY_PIZZAS];
      if (category && category !== "All") {
        pizzas = pizzas.filter(p => p.category === category);
      }
      res.json(pizzas);
      return;
    }

    let queryObj = {};
    if (category && category !== "All") {
      queryObj = { category: category };
    }
    const pizzas = await Pizza.find(queryObj);
    res.json(pizzas);
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve pizzas." });
  }
});

app.get("/api/pizzas/:id", async (req, res) => {
  try {
    if (useInMemoryFallback) {
      const pizza = IN_MEMORY_PIZZAS.find(p => p.id === req.params.id);
      if (!pizza) {
        res.status(404).json({ success: false, message: "Pizza not found." });
        return;
      }
      res.json(pizza);
      return;
    }

    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      res.status(404).json({ success: false, message: "Pizza not found in catalogue." });
      return;
    }
    res.json(pizza);
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve pizza details." });
  }
});

app.post("/api/pizzas", verifyToken as any, isAdmin as any, async (req, res) => {
  try {
    if (useInMemoryFallback) {
      const pizza = { ...req.body, id: `pizza_${Date.now()}` };
      IN_MEMORY_PIZZAS.push(pizza);
      res.status(201).json(pizza);
      return;
    }

    const newPizza = await Pizza.create(req.body);
    res.status(201).json(newPizza);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || "Failed to create pizza record." });
  }
});

app.put("/api/pizzas/:id", verifyToken as any, isAdmin as any, async (req, res) => {
  try {
    if (useInMemoryFallback) {
      const index = IN_MEMORY_PIZZAS.findIndex(p => p.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ success: false, message: "Pizza not found." });
        return;
      }
      IN_MEMORY_PIZZAS[index] = { ...IN_MEMORY_PIZZAS[index], ...req.body };
      res.json(IN_MEMORY_PIZZAS[index]);
      return;
    }

    const updatedPizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPizza) {
      res.status(404).json({ success: false, message: "Pizza not found." });
      return;
    }
    res.json(updatedPizza);
  } catch (err: any) {
    res.status(400).json({ success: false, message: "Failed to update pizza details." });
  }
});

app.delete("/api/pizzas/:id", verifyToken as any, isAdmin as any, async (req, res) => {
  try {
    if (useInMemoryFallback) {
      const index = IN_MEMORY_PIZZAS.findIndex(p => p.id === req.params.id);
      if (index === -1) {
        res.status(404).json({ success: false, message: "Pizza not found." });
        return;
      }
      IN_MEMORY_PIZZAS.splice(index, 1);
      res.json({ success: true, message: "Pizza successfully removed from catalogue." });
      return;
    }

    const deletedPizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!deletedPizza) {
      res.status(404).json({ success: false, message: "Pizza not found." });
      return;
    }
    res.json({ success: true, message: "Pizza successfully removed from catalogue." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to delete pizza." });
  }
});

// ==================== ORDER ENDPOINTS ====================

app.post("/api/orders", verifyToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const orderData = req.body;
    orderData.userId = req.user.id;
    orderData.customerUid = req.user.id;
    orderData.createdAt = Date.now();

    if (useInMemoryFallback) {
      IN_MEMORY_ORDERS.unshift(orderData);
      res.status(201).json({ success: true, order: orderData });
      return;
    }
    
    const newOrder = await Order.create(orderData);
    res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || "Failed to record order." });
  }
});

app.get("/api/orders", verifyToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (useInMemoryFallback) {
      let orders = [...IN_MEMORY_ORDERS];
      const isPrivileged = req.user.role === "admin" || req.user.role === "owner";
      if (!isPrivileged) {
        orders = orders.filter(o => o.customerUid === req.user?.id);
      }
      res.json(orders);
      return;
    }

    let orders;
    if (req.user.role === "admin" || req.user.role === "owner") {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ customerUid: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve orders." });
  }
});

app.get("/api/orders/my", verifyToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    if (useInMemoryFallback) {
      const orders = IN_MEMORY_ORDERS.filter(o => o.customerUid === req.user?.id);
      res.json(orders);
      return;
    }

    const orders = await Order.find({ customerUid: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve order history." });
  }
});

app.patch("/api/orders/:id", verifyToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (useInMemoryFallback) {
      const order = IN_MEMORY_ORDERS.find(o => o.id === id);
      if (!order) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      const isPrivileged = req.user.role === "admin" || req.user.role === "owner";
      if (!isPrivileged) {
        if (status !== "Cancelled") {
          res.status(403).json({ error: "Forbidden. Customers can only cancel their own active orders." });
          return;
        }
        if (order.status !== "Received" && order.status !== "Preparing") {
          res.status(400).json({ error: "Cannot cancel order that has already been baked or delivered." });
          return;
        }
      }

      order.status = status;
      order.updatedAt = new Date().toLocaleTimeString();
      res.json({ success: true, order });
      return;
    }

    const order = await Order.findOne({ id: id });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const isPrivileged = req.user.role === "admin" || req.user.role === "owner";
    if (!isPrivileged) {
      if (status !== "Cancelled") {
        res.status(403).json({ error: "Forbidden. Customers can only cancel their own active orders." });
        return;
      }
      if (order.status !== "Received" && order.status !== "Preparing") {
        res.status(400).json({ error: "Cannot cancel order that has already been baked or delivered." });
        return;
      }
    }

    order.status = status;
    order.updatedAt = new Date().toLocaleTimeString();
    await order.save();

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to update order status." });
  }
});

app.delete("/api/orders/:id", verifyToken as any, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    const { id } = req.params;

    if (useInMemoryFallback) {
      const order = IN_MEMORY_ORDERS.find(o => o.id === id);
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found." });
        return;
      }

      const isPrivileged = req.user.role === "admin" || req.user.role === "owner";
      if (!isPrivileged && order.customerUid !== req.user.id) {
        res.status(403).json({ success: false, message: "Unauthorized to cancel this order." });
        return;
      }

      if (order.status !== "Received") {
        res.status(400).json({ success: false, message: "Only orders in 'Received' status can be cancelled." });
        return;
      }

      order.status = "Cancelled";
      order.updatedAt = new Date().toLocaleTimeString();
      res.json({ success: true, order });
      return;
    }

    const order = await Order.findOne({ id: id });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const isPrivileged = req.user.role === "admin" || req.user.role === "owner";
    if (!isPrivileged && order.customerUid !== req.user.id) {
      res.status(403).json({ success: false, message: "Unauthorized to cancel this order." });
      return;
    }

    if (order.status !== "Received") {
      res.status(400).json({ success: false, message: "Only orders in 'Received' status can be cancelled." });
      return;
    }

    order.status = "Cancelled";
    order.updatedAt = new Date().toLocaleTimeString();
    await order.save();

    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to cancel order." });
  }
});

// ==================== REVIEW ENDPOINTS ====================

app.get("/api/reviews", async (req, res) => {
  try {
    if (useInMemoryFallback) {
      res.json(IN_MEMORY_REVIEWS);
      return;
    }
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve reviews." });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const reviewData = req.body;
    reviewData.createdAt = Date.now();

    if (useInMemoryFallback) {
      IN_MEMORY_REVIEWS.unshift(reviewData);

      // Aggregate and update pizza rating
      const pizzaId = reviewData.pizzaId;
      const reviewsForPizza = IN_MEMORY_REVIEWS.filter(r => r.pizzaId === pizzaId);
      
      if (reviewsForPizza.length > 0) {
        const totalRating = reviewsForPizza.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = parseFloat((totalRating / reviewsForPizza.length).toFixed(1));
        
        const pIndex = IN_MEMORY_PIZZAS.findIndex(p => p.id === pizzaId);
        if (pIndex > -1) {
          IN_MEMORY_PIZZAS[pIndex].rating = avgRating;
          IN_MEMORY_PIZZAS[pIndex].reviewsCount = reviewsForPizza.length;
        }
      }

      res.status(201).json({ success: true, review: reviewData });
      return;
    }

    const newReview = await Review.create(reviewData);

    const pizzaId = reviewData.pizzaId;
    const reviewsForPizza = await Review.find({ pizzaId });
    
    if (reviewsForPizza.length > 0) {
      const totalRating = reviewsForPizza.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = parseFloat((totalRating / reviewsForPizza.length).toFixed(1));
      
      await Pizza.findOneAndUpdate(
        { id: pizzaId },
        { rating: avgRating, reviewsCount: reviewsForPizza.length }
      );
    }

    res.status(201).json({ success: true, review: newReview });
  } catch (err: any) {
    res.status(400).json({ success: false, message: "Failed to submit review." });
  }
});

// ==================== AI PIZZA RECOMMENDER ENDPOINT ====================

app.post("/api/recommend-pizza", async (req: express.Request, res: express.Response) => {
  try {
    const { mood, cravings } = req.body;
    if (!mood && !cravings) {
      res.status(400).json({ error: "Please tell us your mood or craving." });
      return;
    }

    const client = getGeminiClient();
    const prompt = `You are an expert pizza chef at "Pizza Palace".
We need you to design a highly specific, appetizing custom pizza recipe tailored to the customer's current state.

Customer's mood: "${mood || "No specific mood"}"
Customer's current cravings: "${cravings || "No specific cravings"}"

You MUST respond with a JSON object that strictly matches the following TypeScript structure. Do not wrap it in markdown block tags, just pure JSON:
{
  "name": "A creative, appetizing name prefixed with a cute, colorful cartoon emoji based on the concept/vibe (e.g., '🍕 Cozy Rainstorm Margherita', '💪 Post-Gym protein Heavyweight', '🌋 Fiery Volcano Deluxe', '🎉 Friday Night Party Rave', '💻 Midnight Stack Overflow', '🍀 Organic Garden Feast', '🍍 Aloha Sweet Paradise'). The name MUST start with a descriptive cartoonish emoji!",
  "crust": "Classic Crust" or "Thick Crust" or "Thin Crust" or "Cheese Burst",
  "sauce": "Classic Tomato" or "Creamy White Garlic" or "Smoky BBQ" or "Fiery Buffalo",
  "cheese": "Mozzarella" or "Four Cheese Blend" or "Feta" or "Vegan Cheese",
  "toppings": ["Topping 1", "Topping 2", ... max 5 toppings],
  "description": "An incredibly tempting narrative explaining how this specific pizza combo matches their psychological mood and cravings (exactly 2 sentences).",
  "flavorProfile": "e.g., Savory-Sweet, Spicy & Creamy, Smoky-Herbaceous, Rich & Cheesy",
  "complexityScore": A number from 1 to 5 indicating culinary complexity,
  "estimatedPrice": A realistic decimal price like 399, 449, 499, 549, etc. (must be between 299 and 599 for consistency with INR pricing)
}

For the toppings array, please select from these actual kitchen toppings where appropriate:
- Pepperoni
- Italian Sausage
- BBQ Chicken
- Paneer Tikka
- Extra Mozzarella
- Mushrooms
- Black Olives
- Sweet Corn
- Jalapenos
- Pineapple
- Bell Peppers
- Red Onions

Return ONLY the pure JSON object.`;

    let result;
    let attempt = 0;
    const maxAttempts = 3;
    let delayMs = 800;

    while (attempt < maxAttempts) {
      try {
        result = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });
        break; // Success!
      } catch (err: any) {
        attempt++;
        console.warn(`Gemini attempt ${attempt} failed with message: ${err.message}`);
        if (attempt >= maxAttempts) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2;
      }
    }

    if (!result) {
      throw new Error("Empty response received from culinary model");
    }

    const responseText = result.text || "{}";
    const cleanJson = responseText.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    const parsedPizza = JSON.parse(cleanJson);
    res.json(parsedPizza);
  } catch (error: any) {
    console.warn("Gemini Error:", error.message || error);
    res.status(500).json({
      error: "Failed to generate recommendation via Gemini",
      isFallback: true,
      message: error.message || "Something went wrong"
    });
  }
});

// ==================== STATIC DELIVERY AND VITE MIDDLEWARE ====================

if (process.env.NODE_ENV !== "production") {
  console.log("Loading Vite Dev Mode server middleware...");
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  console.log("Production Build Delivery Active...");
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// safe standalone check in ES Modules & CommonJS bundlers
const isMain = typeof process !== 'undefined' && process.argv[1] && (
  (typeof import.meta !== 'undefined' && import.meta.url && process.argv[1] === fileURLToPath(import.meta.url)) ||
  process.argv[1].endsWith('server.ts') ||
  process.argv[1].endsWith('server.js') ||
  process.argv[1].includes('tsx')
);

if (isMain || !process.env.VERCEL) {
  connectToDatabase().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server starting on http://localhost:${PORT}`);
    });
  });
} else {
  // Setup database connection and routes for serverless invocations immediately upon import
  connectToDatabase();
}

export default app;
