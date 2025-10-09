import mongoose from "mongoose";
import { addressSchema } from "./User.js"; // reuse snapshot schema

const shipmentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

  courier: { type: String, trim: true }, // e.g. Aramex, DHL, local delivery
  trackingNumber: { type: String, trim: true },

  status: { 
    type: String, 
    enum: ["preparing", "in_transit", "delivered", "returned"], 
    default: "preparing" 
  },

  shippedAt: { type: Date },
  deliveredAt: { type: Date },

  addressSnapshot: addressSchema, // ✅ frozen copy at shipping time
}, { timestamps: true });

export default mongoose.model("Shipment", shipmentSchema);
