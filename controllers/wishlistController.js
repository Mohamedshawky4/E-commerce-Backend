import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

// ✅ Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate("products", "name price images slug");

    if (!wishlist) {
      return res.json({ success: true, wishlist: [] });
    }

    res.json({ success: true, wishlist: wishlist.products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➕ Add product to wishlist (supports ID or slug)
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productIdOrSlug } = req.body;

    // 🧠 Detect if productIdOrSlug is ObjectId or slug
    let product;
    if (mongoose.Types.ObjectId.isValid(productIdOrSlug)) {
      product = await Product.findById(productIdOrSlug);
    } else {
      product = await Product.findOne({ slug: productIdOrSlug });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: product._id } }, // prevents duplicates
      { new: true, upsert: true }
    ).populate("products", "name price images slug");

    res.json({ success: true, message: "Product added to wishlist", wishlist: wishlist.products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ❌ Remove product from wishlist (supports ID or slug)
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productIdOrSlug } = req.params;

    // 🧠 Detect whether it's ObjectId or slug
    let product;
    if (mongoose.Types.ObjectId.isValid(productIdOrSlug)) {
      product = await Product.findById(productIdOrSlug);
    } else {
      product = await Product.findOne({ slug: productIdOrSlug });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: product._id } },
      { new: true }
    ).populate("products", "name price images slug");

    res.json({ success: true, message: "Product removed from wishlist", wishlist: wishlist?.products || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🗑️ Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } },
      { new: true }
    );

    res.json({ success: true, message: "Wishlist cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
