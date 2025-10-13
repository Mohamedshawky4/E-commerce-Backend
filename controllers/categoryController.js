import Category from "../models/Category.js";
import mongoose from "mongoose";

// ✅ Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, parentCategory, image } = req.body;

    // Ensure slug uniqueness
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }

    const category = new Category({
      name,
      slug,
      description,
      parentCategory: parentCategory || null,
      image,
    });

    await category.save();
    res.status(201).json({ success: true, message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("parentCategory", "name slug")
      .sort({ createdAt: -1 });

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single category (by ID or slug)
export const getCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let category;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      category = await Category.findById(idOrSlug).populate("parentCategory", "name slug");
    } else {
      category = await Category.findOne({ slug: idOrSlug }).populate("parentCategory", "name slug");
    }

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update category (by ID or slug)
export const updateCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { name, slug, description, parentCategory, image } = req.body;

    const query = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const updatedCategory = await Category.findOneAndUpdate(
      query,
      { name, slug, description, parentCategory: parentCategory || null, image },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category updated successfully", category: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete category (by ID or slug)
export const deleteCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const query = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const deletedCategory = await Category.findOneAndDelete(query);

    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get subcategories by parent category (optional)
export const getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;
    const subcategories = await Category.find({ parentCategory: parentId });

    res.json({ success: true, subcategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


