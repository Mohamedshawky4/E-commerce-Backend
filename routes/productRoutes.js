import { addProductVariant, createProduct, deleteProduct, deleteProductVariant, getProductByIdOrSlug, getProducts, getProductsByCategoryIdOrSlug, getRelatedProducts, updateProduct, updateProductVariant } from "../controllers/productController.js";

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
const productRoutes = express.Router();

productRoutes.get("/", getProducts);
productRoutes.get("/:idOrSlug", getProductByIdOrSlug);
productRoutes.get("/category/:categoryIdOrSlug", getProductsByCategoryIdOrSlug);
productRoutes.get("/related/:idOrSlug", getRelatedProducts);

productRoutes.post("/", protect, admin, createProduct);
productRoutes.put("/:idOrSlug", protect, admin, updateProduct);
productRoutes.delete("/:idOrSlug", protect, admin, deleteProduct);
productRoutes.post("/:idOrSlug/variants", protect, admin, addProductVariant);
productRoutes.put("/:idOrSlug/variants/:variantId", protect, admin, updateProductVariant);
productRoutes.delete("/:idOrSlug/variants/:variantId", protect, admin, deleteProductVariant);

export default productRoutes;