import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

const wishlistRoutes = express.Router();

wishlistRoutes.get("/", protect, getWishlist); // Get user's wishlist
wishlistRoutes.post("/", protect, addToWishlist); // Add product
wishlistRoutes.delete("/:productIdOrSlug", protect, removeFromWishlist); // Remove specific product
wishlistRoutes.delete("/", protect, clearWishlist); // Clear all products

export default wishlistRoutes;
