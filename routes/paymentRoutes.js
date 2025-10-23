import express from "express";
import {
  createPayment,
  handlePaymobWebhook,
//   handleStripeWebhook,
  getPaymentByOrder,
  getAllPayments,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";


const paymentRoutes = express.Router();

paymentRoutes.post("/", protect, createPayment);
paymentRoutes.post("/paymob/webhook", handlePaymobWebhook);
// paymentRoutes.post("/stripe/webhook", handleStripeWebhook);
paymentRoutes.get("/order/:orderId", protect, getPaymentByOrder);
paymentRoutes.get("/", protect, admin, getAllPayments);

export default paymentRoutes;
