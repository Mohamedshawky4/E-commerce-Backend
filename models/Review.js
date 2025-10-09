import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },

  // Optional extras
  images: [{ type: String }], // user-uploaded review photos
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // helpful votes

}, { timestamps: true });

// ✅ Prevent duplicate reviews (1 review per user per product)
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Helpful indexes for product review queries and recency
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
