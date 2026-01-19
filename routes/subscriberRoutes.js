import express from "express";
import { subscribe, getSubscribers } from "../controllers/subscriberController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", subscribe);
router.get("/", protect, admin, getSubscribers);

export default router;
