import { getProducts } from "../controllers/productController.js";

import express from "express";
const productRoutes = express.Router();

productRoutes.get("/", getProducts);

export default productRoutes;