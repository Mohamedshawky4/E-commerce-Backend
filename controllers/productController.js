import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";
import APIFeatures from "../utils/apiFeatures.js";

// GET /api/products — getProducts
export const getProducts = asyncHandler(async (req, res) => {
  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await apiFeatures.query.populate("categories", "name slug");

  const countFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();
  const total = await countFeatures.query.countDocuments();

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const pages = Math.ceil(total / limit);

  res.json({
    success: true,
    products,
    pagination: {
      total,
      page,
      pages,
      limit,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  });
});

// GET /api/products/slug/:slug — getProductBySlug
export const getProductByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let product;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    product = await Product.findById(idOrSlug).populate("categories", "name slug");
  } else {
    product = await Product.findOne({ slug: idOrSlug }).populate("categories", "name slug");
  }

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
});

// GET /api/products/category/:categoryIdOrSlug
export const getProductsByCategoryIdOrSlug = asyncHandler(async (req, res) => {
  const { categoryIdOrSlug } = req.params;

  let categoryDoc;
  if (mongoose.Types.ObjectId.isValid(categoryIdOrSlug)) {
    categoryDoc = await Category.findById(categoryIdOrSlug);
  } else {
    categoryDoc = await Category.findOne({ slug: categoryIdOrSlug });
  }

  if (!categoryDoc) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Inject category ID into query for APIFeatures
  req.query.categories = categoryDoc._id.toString();

  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await apiFeatures.query.populate("categories", "name slug");

  const countFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter();
  const total = await countFeatures.query.countDocuments();

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const pages = Math.ceil(total / limit);

  res.json({
    success: true,
    category: { name: categoryDoc.name, slug: categoryDoc.slug, id: categoryDoc._id },
    products,
    pagination: {
      total,
      page,
      pages,
      limit,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  });
});

// GET /api/products/related/:idOrSlug
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const { limit = 6, includeOutOfStock = "true" } = req.query;

  let product;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    product = await Product.findById(idOrSlug);
  } else {
    product = await Product.findOne({ slug: idOrSlug });
  }

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const filter = {
    _id: { $ne: product._id },
    $or: [
      { categories: { $in: product.categories } },
      { brand: product.brand },
    ],
  };

  if (includeOutOfStock === "false") {
    filter.stock = { $gt: 0 };
  }

  const relatedProducts = await Product.find(filter)
    .limit(Number(limit))
    .populate("categories", "name slug")
    .select("name slug price discountPercent images brand averageRating");

  res.json({
    success: true,
    count: relatedProducts.length,
    relatedProducts
  });
});

// POST /api/products — createProduct
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discountPercent, brand, categories, variants, images, stock } = req.body;

  if (!name || !price || !categories || !Array.isArray(categories) || categories.length === 0) {
    res.status(400);
    throw new Error("Name, price, and at least one category are required");
  }

  const newProduct = new Product({
    name,
    description,
    price,
    discountPercent,
    brand,
    categories,
    variants,
    images,
    stock,
  });

  await newProduct.save();
  res.status(201).json({ success: true, message: "Product created successfully", product: newProduct });
});

// PUT /api/products/:idOrSlug — updateProduct
export const updateProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const updates = req.body;

  let updatedProduct;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    updatedProduct = await Product.findByIdAndUpdate(idOrSlug, updates, { new: true });
  } else {
    updatedProduct = await Product.findOneAndUpdate({ slug: idOrSlug }, updates, { new: true });
  }

  if (!updatedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
});

// DELETE /api/products/:idOrSlug — deleteProduct
export const deleteProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;

  let deletedProduct;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    deletedProduct = await Product.findByIdAndDelete(idOrSlug);
  } else {
    deletedProduct = await Product.findOneAndDelete({ slug: idOrSlug });
  }

  if (!deletedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, message: "Product deleted successfully" });
});

// POST /api/products/:idOrSlug/variants
export const addProductVariant = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const { size, color, additionalPrice, stock, sku } = req.body;

  let product;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    product = await Product.findById(idOrSlug);
  } else {
    product = await Product.findOne({ slug: idOrSlug });
  }

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  product.variants.push({ size, color, additionalPrice, stock, sku });
  await product.save();

  res.status(201).json({ success: true, message: "Product variant added successfully", product });
});

// PUT /api/products/:id/variants/:variantId
export const updateProductVariant = asyncHandler(async (req, res) => {
  const { id, variantId } = req.params;
  const { size, color, additionalPrice, stock } = req.body;

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: { "variants.$[variant].size": size, "variants.$[variant].color": color, "variants.$[variant].additionalPrice": additionalPrice, "variants.$[variant].stock": stock } },
    { new: true, arrayFilters: [{ "variant._id": variantId }] }
  );

  if (!updatedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, message: "Product variant updated successfully", product: updatedProduct });
});

// DELETE /api/products/:id/variants/:variantId
export const deleteProductVariant = asyncHandler(async (req, res) => {
  const { id, variantId } = req.params;

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $pull: { variants: { _id: variantId } } },
    { new: true }
  );

  if (!updatedProduct) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, message: "Product variant deleted successfully", product: updatedProduct });
});

export const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Product.find().distinct("brand");
  res.json({ success: true, brands });
});

// GET /api/products/suggestions?q=...
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, products: [] });

  const products = await Product.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { brand: { $regex: q, $options: "i" } }
    ]
  })
    .limit(5)
    .select("name slug images price discountPercent brand");

  res.json({ success: true, products });
});
