import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

// Commented out until STRIPE_SECRET_KEY is configured in .env
/*
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createStripePaymentIntent = async (order) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalAmount * 100), // Note: order has totalAmount, not totalPrice
        currency: "usd",
        metadata: { orderId: order._id.toString() },
    });

    return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
    };
};

export const verifyStripeWebhook = (payload, sig) => {
    return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
};
*/

export const createStripePaymentIntent = async (order) => {
    throw new Error("Stripe provider is currently disabled. Please configure STRIPE_SECRET_KEY.");
};

export const verifyStripeWebhook = (payload, sig) => {
    throw new Error("Stripe provider is currently disabled. Please configure STRIPE_WEBHOOK_SECRET.");
};
