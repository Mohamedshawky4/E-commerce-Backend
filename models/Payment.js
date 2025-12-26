import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

  provider: { type: String, enum: ["paymob", "paypal", "stripe", "cod"], required: true },
  method: { type: String, enum: ["card", "wallet", "cod"], required: true },

  amount: { type: Number, required: true },

  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },

  transactionId: { type: String }, // from Paymob API
  currency: { type: String, default: "EGP" },

  paidAt: { type: Date },
  rawWebhookData: { type: Object },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
