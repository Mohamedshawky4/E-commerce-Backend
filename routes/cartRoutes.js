import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cartController.js";

const cartRouter = express.Router();

// 🛡️ Apply auth protection to all routes
cartRouter.use(protect);

// ✅ Get cart (GET) — Add item (POST) — Clear all items (DELETE)
cartRouter.route("/")
  .get(getCart)         // GET /api/cart
  .post(addToCart)      // POST /api/cart
  .delete(clearCart);   // DELETE /api/cart

// ✅ Update quantity or remove specific item
cartRouter.route("/item")
  .put(updateCartItem)   // PUT /api/cart/item
  .delete(removeFromCart); // DELETE /api/cart/item

export default cartRouter;
