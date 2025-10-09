import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  size: { type: String },   // e.g. "M", "L", "XL"
  color: { type: String },  // e.g. "Red", "Black"
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, trim: true }
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true }, // SEO-friendly

  description: { type: String, required: true },
  images: [{ type: String }],
  brand: { type: String, trim: true },

  price: { type: Number, required: true, min: 0 },

  // ✅ percentage-based discount for flexibility
  discountPercent: { type: Number, min: 0, max: 100, default: 0 },

  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true }],

  stock: { type: Number, default: 0, min: 0 },
  variants: [variantSchema],

  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });


// 🧮 Virtual: compute final discounted price dynamically
productSchema.virtual("discountedPrice").get(function () {
  if (this.discountPercent && this.discountPercent > 0) {
    return Math.round(this.price * (1 - this.discountPercent / 100));
  }
  return this.price;
});



export default mongoose.model("Product", productSchema);
