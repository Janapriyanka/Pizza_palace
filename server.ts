import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

  // Synchronized backup file storage paths
  const ORDERS_FILE = path.join(process.cwd(), "orders.json");
  const REVIEWS_FILE = path.join(process.cwd(), "reviews.json");

  const readOrdersFromFile = (): any[] => {
    try {
      if (fs.existsSync(ORDERS_FILE)) {
        return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
      }
    } catch (err) {
      console.warn("Error reading orders file:", err);
    }
    return [];
  };

  const writeOrdersToFile = (orders: any[]) => {
    try {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
    } catch (err) {
      console.warn("Error writing orders file:", err);
    }
  };

  const readReviewsFromFile = (): any[] => {
    try {
      if (fs.existsSync(REVIEWS_FILE)) {
        return JSON.parse(fs.readFileSync(REVIEWS_FILE, "utf8"));
      }
    } catch (err) {
      console.warn("Error reading reviews file:", err);
    }
    return [];
  };

  const writeReviewsToFile = (reviews: any[]) => {
    try {
      fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), "utf8");
    } catch (err) {
      console.warn("Error writing reviews file:", err);
    }
  };

  // Live API route for AI pizza recommendation
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

      const result = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = result.text || "{}";
      const cleanJson = responseText.trim().replace(/^```json/, "").replace(/```$/, "").trim();
      const parsedPizza = JSON.parse(cleanJson);
      res.json(parsedPizza);
    } catch (error: any) {
      console.warn("Gemini Error:", error.message);
      // Fallback response inside the API in case API key is missing or invalid
      res.status(500).json({
        error: "Failed to generate recommendation via Gemini",
        isFallback: true,
        message: error.message || "Something went wrong"
      });
    }
  });

  // REST APIs for high availability fallback order sync
  app.get("/api/orders", (req: express.Request, res: express.Response) => {
    const orders = readOrdersFromFile();
    res.json(orders);
  });

  app.post("/api/orders", (req: express.Request, res: express.Response) => {
    const orders = readOrdersFromFile();
    const newOrder = req.body;
    
    // Check if order already exists to prevent duplicate posts:
    const exIndex = orders.findIndex(o => o.id === newOrder.id);
    if (exIndex > -1) {
      orders[exIndex] = newOrder;
    } else {
      orders.unshift(newOrder); // Add to beginning
    }
    writeOrdersToFile(orders);
    res.status(201).json({ success: true, order: newOrder });
  });

  app.patch("/api/orders/:id", (req: express.Request, res: express.Response) => {
    const orders = readOrdersFromFile();
    const { id } = req.params;
    const { status } = req.body;
    
    const index = orders.findIndex(o => o.id === id);
    if (index > -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toLocaleTimeString();
      writeOrdersToFile(orders);
      res.json({ success: true, order: orders[index] });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.get("/api/reviews", (req: express.Request, res: express.Response) => {
    const reviews = readReviewsFromFile();
    res.json(reviews);
  });

  app.post("/api/reviews", (req: express.Request, res: express.Response) => {
    const reviews = readReviewsFromFile();
    const newReview = req.body;
    
    const exIndex = reviews.findIndex(r => r.id === newReview.id);
    if (exIndex > -1) {
      reviews[exIndex] = newReview;
    } else {
      reviews.unshift(newReview);
    }
    writeReviewsToFile(reviews);
    res.status(201).json({ success: true, review: newReview });
  });

  // Vite development middleware vs production static delivery
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite Dev Mode server middleware...");
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://localhost:${PORT}`);
  });
}

startServer();
