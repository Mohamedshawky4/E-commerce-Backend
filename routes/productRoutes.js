import { addProductVariant, createProduct, deleteProduct, deleteProductVariant, getAllBrands, getProductByIdOrSlug, getProducts, getProductsByCategoryIdOrSlug, getRelatedProducts, updateProduct, updateProductVariant } from "../controllers/productController.js";

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
const productRoutes = express.Router();

// IMPORTANT: Specific routes must come BEFORE parameterized routes
productRoutes.get("/brands", getAllBrands); // Must be before /:idOrSlug

productRoutes.get("/", getProducts);
productRoutes.post("/", protect, admin, createProduct);
productRoutes.get("/category/:categoryIdOrSlug", getProductsByCategoryIdOrSlug);
productRoutes.get("/:idOrSlug", getProductByIdOrSlug);
productRoutes.get("/:idOrSlug/related", getRelatedProducts);
productRoutes.put("/:idOrSlug", protect, admin, updateProduct);
productRoutes.delete("/:idOrSlug", protect, admin, deleteProduct);
productRoutes.post("/:idOrSlug/variants", protect, admin, addProductVariant);
productRoutes.put("/:idOrSlug/variants/:variantId", protect, admin, updateProductVariant);
productRoutes.delete("/:idOrSlug/variants/:variantId", protect, admin, deleteProductVariant);

export default productRoutes;