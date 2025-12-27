import asyncHandler from "express-async-handler";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import { createPaymobPayment } from "../helpers/paymob.js";
import { createStripePaymentIntent, verifyStripeWebhook } from "../helpers/stripe.js";
import Shipment from "../models/Shipment.js";
import { decrementStockAtomic } from "../utils/inventory.js";
import { logger } from "../utils/logger.js";
import { sendOrderConfirmation } from "../utils/email.js";

// --- Utility: Finish Order (Decrement Stock + Update Status) ---
const finishOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order || order.isPaid) return;

  // Mark as paid
  order.isPaid = true;
  order.paidAt = new Date();
  order.status = "processing";
  await order.save();

  // Atomic stock decrement
  if (!order.stockDecremented) {
    await decrementStockAtomic(order.items);
    order.stockDecremented = true;
    await order.save();
  }

  // Send Confirmation Email
  try {
    const user = await Order.findById(orderId).populate("user").lean();
    if (user && user.user && user.user.email) {
      await sendOrderConfirmation(user.user.email, order);
      logger.info(`Confirmation email sent to ${user.user.email} for order ${orderId}`);
    }
  } catch (err) {
    logger.error(`Failed to send confirmation email for order ${orderId}`, err.message);
  }
};

// --- Create a Payment ---
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, provider, method } = req.body || {};

  if (!orderId || !provider || !method) {
    return res.status(400).json({ message: "Missing required payment fields." });
  }

  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment && provider !== "cod") {
    return res.status(400).json({ message: "Payment already initiated for this order." });
  }

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found." });
  if (order.isPaid) return res.status(400).json({ message: "Order already paid." });

  let paymentData = {
    order: order._id,
    provider,
    method,
    amount: order.totalAmount,
  };

  let responseData = {};

  if (provider === "paymob") {
    const paymobData = await createPaymobPayment(order);
    paymentData.transactionId = paymobData.transactionId; // This is the Paymob Order ID
    responseData = paymobData;
  } else if (provider === "stripe") {
    const stripeData = await createStripePaymentIntent(order);
    paymentData.transactionId = stripeData.paymentIntentId;
    responseData = stripeData;
  } else if (provider === "cod") {
    paymentData.status = "pending";
  } else {
    return res.status(400).json({ message: "Invalid payment provider." });
  }

  const payment = existingPayment || await Payment.create(paymentData);
  if (existingPayment) {
    existingPayment.provider = provider;
    existingPayment.method = method;
    existingPayment.transactionId = paymentData.transactionId;
    await existingPayment.save();
  }

  if (provider === "cod") {
    const shipment = await Shipment.create({
      order: order._id,
      courier: "Local Delivery",
      trackingNumber: `COD-${Date.now()}`,
      status: "preparing",
      addressSnapshot: order.shippingAddress,
      shippedAt: null,
    });
    responseData.shipment = shipment;
  }


  logger.transaction("PAYMENT_INITIATED", {
    orderId,
    provider,
    method,
    amount: order.totalAmount,
    status: payment.status
  });

  if (provider === "cod") {
    await finishOrder(order._id);
  }

  res.status(201).json({
    success: true,
    message: "Payment initiated successfully.",
    provider,
    payment,
    ...responseData,
  });
});

// --- Webhook: Paymob (Robust) ---
// export const handlePaymobWebhook = asyncHandler(async (req, res) => {
//   const event = req.body;

//   // Paymob sends a transaction success webhook
//   // We check for HMAC in a real production app (recommended)

//   if (event.obj && event.obj.order && event.obj.success === true) {
//     const paymobOrderId = event.obj.order.id;
//     const payment = await Payment.findOne({ transactionId: paymobOrderId });

//     if (payment && payment.status !== "paid") {
//       payment.status = "paid";
//       payment.paidAt = new Date();
//       payment.rawWebhookData = event;
//       await payment.save();

//       await finishOrder(payment.order);
//     }
//   }

//   res.json({ success: true });
// });

// --- Webhook: Stripe (Robust) ---
// export const handleStripeWebhook = asyncHandler(async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     // Note: To verify, we need the raw body. 
//     // If not available, we can process as is but verify later.
//     // For now, processing based on event.body as typical middleware-based express
//     event = req.body;

//     if (event.type === "payment_intent.succeeded") {
//       const intent = event.data.object;
//       const payment = await Payment.findOne({ transactionId: intent.id });

//       if (payment && payment.status !== "paid") {
//         payment.status = "paid";
//         payment.paidAt = new Date();
//         await payment.save();

//         await finishOrder(payment.order);
//       }
//     }
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   res.json({ received: true });
// });

// --- Get Payment by Order ---
export const getPaymentByOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const payment = await Payment.findOne({ order: orderId }).populate("order");

  if (!payment) return res.status(404).json({ message: "Payment not found." });

  res.json({ success: true, payment });
});

// --- Admin: Get All Payments ---
export const getAllPayments = asyncHandler(async (req, res) => {
  const { provider, status } = req.query;

  const filter = {};
  if (provider) filter.provider = provider;
  if (status) filter.status = status;

  const payments = await Payment.find(filter)
    .populate("order", "user totalPrice status")
    .sort({ createdAt: -1 });

  res.json({ success: true, total: payments.length, payments });
});
