import express from 'express';
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

// 🧴 Security & Logging
app.use(express.json());
app.use(cors());
app.use(morgan("[:date[iso]] :method :url :status :res[content-length] - :response-time ms"));

// 🚨 Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => {
  res.send("GENESIS API is running...");
});

// API Routes
app.use("/api/users", authLimiter, userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/shipments", shipmentRoutes);

// 🛠️ Error Handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("✓ MongoDB connected");
  app.listen(process.env.PORT || 5000, () => {
    console.log(`✓ Server running on port ${process.env.PORT || 5000}`);
  });
}).catch((error) => {
  console.error("✗ MongoDB connection error:", error);
});
