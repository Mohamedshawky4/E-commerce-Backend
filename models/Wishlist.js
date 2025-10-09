import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  // Array of products the user added to wishlist
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
}, { timestamps: true });

// Prevent duplicate products via unique compound index at the application layer
// Model-level: rely on $addToSet in controllers; optional validator here if needed
wishlistSchema.index({ user: 1 });

export default mongoose.model("Wishlist", wishlistSchema);
