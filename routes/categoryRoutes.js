import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const categoryRoutes = express.Router();

categoryRoutes.post("/", protect, admin, createCategory);
categoryRoutes.get("/", getAllCategories);
categoryRoutes.get("/:idOrSlug", getCategory);
categoryRoutes.put("/:idOrSlug", protect, admin, updateCategory);
categoryRoutes.delete("/:idOrSlug", protect, admin, deleteCategory);

// Optional route for nested categories
categoryRoutes.get("/parent/:parentId/subcategories", getSubcategories);

export default categoryRoutes;
