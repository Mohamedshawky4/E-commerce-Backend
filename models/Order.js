import mongoose from "mongoose";
import { addressSchema } from "./User.js";

// --- Order Item Schema ---
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: { type: String, trim: true },
    productBrand: { type: String, trim: true },

  
    variantId: { type: mongoose.Schema.Types.ObjectId },

    variantSnapshot: {
      size: { type: String, trim: true },
      color: { type: String, trim: true },
    },

    // Pricing snapshot
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// --- Order Schema ---
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: {
      type: [orderItemSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    // Totals breakdown
    itemsSubtotal: { type: Number, required: true, min: 0 },
    discountTotal: { type: Number, required: true, min: 0, default: 0 },
    shippingFee: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },

    // Order status
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Payment & shipment references
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment" },

    // Address snapshot from user
    shippingAddress: addressSchema,

    // Status timestamps
    placedAt: { type: Date },
    paidAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
