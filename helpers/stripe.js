// import Stripe from "stripe";
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const createStripePaymentIntent = async (order) => {
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: Math.round(order.totalPrice * 100),
//     currency: "usd",
//     metadata: { orderId: order._id.toString() },
//   });

//   return {
//     paymentIntentId: paymentIntent.id,
//     clientSecret: paymentIntent.client_secret,
//   };
// };
