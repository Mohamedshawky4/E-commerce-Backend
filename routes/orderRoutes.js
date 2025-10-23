import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
  getOrderById,
  getOrderPreview,
  placeOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  downloadInvoice
} from "../controllers/orderControllers.js";

const orderRoutes = express.Router();

// --------------------------------------------------
// 🛒 Order Routes
// --------------------------------------------------

// 1️⃣ Preview order before placing (user must be logged in)
orderRoutes.post("/preview", protect, getOrderPreview);

// 2️⃣ Place an order
orderRoutes.post("/", protect, placeOrder);

// 3️⃣ Get all orders (ADMIN only)
orderRoutes.get("/", protect, admin, getAllOrders);

// 4️⃣ Get orders for the logged-in user
orderRoutes.get("/my-orders", protect, getUserOrders);

// 5️⃣ Get a single order by ID (for user or admin)
orderRoutes.get("/:id", protect, getOrderById);

// 6️⃣ Update order status (ADMIN only)
orderRoutes.put("/:id/status", protect, admin, updateOrderStatus);

// 7️⃣ Cancel order (user)
orderRoutes.put("/:id/cancel", protect, cancelOrder);

// 8️⃣ Download invoice as PDF
orderRoutes.get("/:id/invoice", downloadInvoice);

export default orderRoutes;
