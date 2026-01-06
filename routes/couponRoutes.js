import express from "express";
import { validateCoupon, createCoupon } from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/validate", protect, validateCoupon);
router.post("/", protect, admin, createCoupon);

export default router;
