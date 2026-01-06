import express from "express";
import { checkGiftCard, createGiftCard } from "../controllers/giftCardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/check", protect, checkGiftCard);
router.post("/", protect, admin, createGiftCard);

export default router;
