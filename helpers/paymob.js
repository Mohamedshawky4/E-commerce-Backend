import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

export const createPaymobPayment = async (order) => {
  try {
    // Step 1: Authenticate
    const authRes = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: PAYMOB_API_KEY,
    });
    const token = authRes.data.token;

    // Step 2: Create Order
    const orderRes = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        amount_cents: Math.round(order.totalAmount * 100),
        currency: "EGP",
        delivery_needed: false,
        items: [],
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const paymobOrderId = orderRes.data.id;

    // Step 3: Generate Payment Key
    const paymentKeyRes = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        amount_cents: Math.round(order.totalAmount * 100),
        currency: "EGP",
        order_id: paymobOrderId,
        integration_id: PAYMOB_INTEGRATION_ID,
        billing_data:{
                    email: order.user?.email || "test@example.com",
                    first_name: order.user?.name?.split(" ")[0] || "User",
                    last_name: order.user?.name?.split(" ")[1] || "Example",
                    phone_number: order.user?.phone || "01000000000",
                    apartment: "NA",
                    floor: "NA",       // ✅ REQUIRED by Paymob
                    building: "NA",    // ✅ REQUIRED by Paymob
                    city: order.shippingAddress?.city || "Cairo",
                    country: "EG",
                    state: order.shippingAddress?.state || "Cairo",
                    street: order.shippingAddress?.street || "NA",},

      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return {
      transactionId: paymobOrderId,
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKeyRes.data.token}`,
    };
 } catch (error) {
  console.error("PAYMOB ERROR DETAILS:", {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message,
  });
  throw new Error("Paymob payment creation failed");
}
};