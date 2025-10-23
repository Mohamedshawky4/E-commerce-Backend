import asyncHandler from "express-async-handler";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import { createPaymobPayment } from "../helpers/paymob.js";
// import { createStripePaymentIntent } from "../helpers/stripe.js";
import Shipment from "../models/Shipment.js";

// --- Create a Payment ---
export const createPayment = asyncHandler(async (req, res) => {
 const { orderId, provider, method } = req.body || {};

if (!orderId || !provider || !method ) {
  return res.status(400).json({ message: "Missing required payment fields." });
}
 //check if there is already a payment for this order
 const existingPayment = await Payment.findOne({ order: orderId });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already exists for this order." });
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
    console.log(order)
    const paymobData = await createPaymobPayment(order);
    paymentData.transactionId = paymobData.transactionId;
    responseData = paymobData;
  } 
  else if (provider === "stripe") {
    const stripeData = await createStripePaymentIntent(order);
    paymentData.transactionId = stripeData.paymentIntentId;
    responseData = stripeData;
  } 
  else if (provider === "cod") {
    paymentData.status = "pending"; // ✅ COD payments start as pending
  } 
  else {
    return res.status(400).json({ message: "Invalid payment provider." });
  }

  const payment = await Payment.create(paymentData);

  // 🚚 Automatically create shipment for COD orders
  if (provider === "cod") {
    const shipment = await Shipment.create({
      order: order._id,
      courier: "Local Delivery", // or leave empty if you assign later
      trackingNumber: `COD-${Date.now()}`,
      status: "preparing", // ✅ match your enum
      addressSnapshot: order.shippingAddress, // ✅ match your schema
      shippedAt: null,
    });

    responseData.shipment = shipment;
  }

  res.status(201).json({
    success: true,
    message: "Payment initiated successfully.",
    provider,
    payment,
    ...responseData,
  });
});

// --- Webhook: Paymob ---
export const handlePaymobWebhook = asyncHandler(async (req, res) => {
  const event = req.body;

  if (event.obj?.order?.id) {
    const payment = await Payment.findOne({ transactionId: event.obj.order.id });

    if (payment) {
      if (event.obj.success) {
        payment.status = "paid";
        payment.paidAt = new Date();
        await payment.save();

        await Order.findByIdAndUpdate(payment.order, { isPaid: true, paidAt: new Date() });
      } else {
        payment.status = "failed";
        await payment.save();
      }
    }
  }

  res.json({ received: true });
});

// --- Webhook: Stripe ---
// export const handleStripeWebhook = asyncHandler(async (req, res) => {
//   const event = req.body;

//   if (event.type === "payment_intent.succeeded") {
//     const intent = event.data.object;
//     const payment = await Payment.findOne({ transactionId: intent.id });

//     if (payment) {
//       payment.status = "paid";
//       payment.paidAt = new Date();
//       await payment.save();

//       await Order.findByIdAndUpdate(payment.order, { isPaid: true, paidAt: new Date() });
//     }
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
