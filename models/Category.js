import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true }, // SEO-friendly URL
  description: { type: String, trim: true },

  // Self-reference for nested categories (subcategories)
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },

  image: { type: String }, // optional banner image
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);
