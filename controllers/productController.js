    // GET /api/products — getProducts

    // Purpose: list products with pagination, sorting, filtering, search.

    // Query params to support: page, limit, sort (e.g. -price), search, category, minPrice, maxPrice, brand, discounted=true, rating>=, hasStock=true, variant=size,color, tags, fields (select).

    // Should return: products array + pagination metadata (total, page, pages, limit).
    import Product from "../models/Product.js";
    import Category from "../models/Category.js";
    import mongoose from "mongoose";
    export const getProducts = async (req, res) => {
    try {
        let {
        page = 1,
        limit = 10,
        sort,
        search,
        category,
        minPrice,
        maxPrice,
        brand,
        discounted,
        rating,
        hasStock,
        size,
        color,
        fields
        } = req.query;
        minPrice = Number(minPrice);
        maxPrice = Number(maxPrice);
        rating = Number(rating);

        page = parseInt(page);
        limit = parseInt(limit);
        const filter = {};

        // 🔍 Full-text search
        if (search) {
    try {
        filter.$text = { $search: search };
    } catch {
        filter.name = { $regex: search, $options: "i" }; // fallback search
    }
    }

        // 🏷️ Category filter
    if (category) {
    const slugs = category.split(",");
    const categoryDocs = await Category.find({ slug: { $in: slugs } });
    if (categoryDocs.length) {
        filter.categories = { $in: categoryDocs.map(c => c._id) };
    }
    }
        // 💰 Price range
        if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // 🏢 Brand filter with multi-value support
        if (brand) {
        const brands = brand.split(",").map(b => b.trim());
        filter.brand = { $in: brands };
        }
    

        // 💸 Discount filter
        if (discounted === "true") filter.discountPercent = { $gt: 0 };

        // ⭐ Rating filter
        if (rating) filter.averageRating = { $gte: Number(rating) };

        // 📦 Stock filter
        if (hasStock === "true") filter.stock = { $gt: 0 };

        // 👕 Variant filter with multi-value support
    // 👕 Variant filter (matches same variant element)
    if (size || color) {
    const variantFilter = {};

    if (size) {
        const sizes = size.split(",").map(s => s.trim());
        variantFilter.size = { $in: sizes };
    }

    if (color) {
        const colors = color.split(",").map(c => c.trim());
        variantFilter.color = { $in: colors };
    }

    // ✅ Use $elemMatch to require both in the same variant
    filter.variants = { $elemMatch: variantFilter };
    }

    // require at least one variant element that matches both constraints

        // Query builder
        let query = Product.find(filter)
        .sort(sort || "-createdAt")
        .skip((page - 1) * limit)
        .limit(limit);

        // 🎯 Field selection
        if (fields) {
        const selectFields = fields.split(",").join(" ");
        query = query.select(selectFields);
        } else {
        query = query.select("name price discountPercent images averageRating slug");
        }

        const [products, total] = await Promise.all([
        query.exec(),
        Product.countDocuments(filter)
        ]);

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
            hasPrevPage: page > 1
        }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    };
 // GET /api/products/slug/:slug — getProductBySlug
   export const getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let product;

    // 🧠 Determine if the param is an ObjectId or slug
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug).populate("categories", "name slug");
    } else {
      product = await Product.findOne({ slug: idOrSlug }).populate("categories", "name slug");
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
    //get products based on category id with all the filters and pagination in get products
export const getProductsByCategoryIdOrSlug = async (req, res) => {
  try {
    const { categoryIdOrSlug } = req.params;

    let {
      page = 1,
      limit = 10,
      sort,
      search,
      minPrice,
      maxPrice,
      brand,
      discounted,
      rating,
      hasStock,
      size,
      color,
      fields,
    } = req.query;

    // 🧮 Type conversions
    page = parseInt(page);
    limit = parseInt(limit);
    minPrice = Number(minPrice);
    maxPrice = Number(maxPrice);
    rating = Number(rating);

    // 🏷️ Find category by either ObjectId or slug
    let categoryDoc;
    if (mongoose.Types.ObjectId.isValid(categoryIdOrSlug)) {
      categoryDoc = await Category.findById(categoryIdOrSlug);
    } else {
      categoryDoc = await Category.findOne({ slug: categoryIdOrSlug });
    }

    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const filter = { categories: categoryDoc._id }; // force category constraint

    // 🔍 Full-text search
    if (search) {
      try {
        filter.$text = { $search: search };
      } catch {
        filter.name = { $regex: search, $options: "i" }; // fallback regex search
      }
    }

    // 💰 Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    // 🏢 Brand filter
    if (brand) {
      const brands = brand.split(",").map((b) => b.trim());
      filter.brand = { $in: brands };
    }

    // 💸 Discount filter
    if (discounted === "true") filter.discountPercent = { $gt: 0 };

    // ⭐ Rating filter
    if (rating) filter.averageRating = { $gte: rating };

    // 📦 Stock filter
    if (hasStock === "true") filter.stock = { $gt: 0 };

    // 👕 Variant filter (require both color + size in same variant)
    if (size || color) {
      const variantFilter = {};
      if (size) {
        const sizes = size.split(",").map((s) => s.trim());
        variantFilter.size = { $in: sizes };
      }
      if (color) {
        const colors = color.split(",").map((c) => c.trim());
        variantFilter.color = { $in: colors };
      }
      filter.variants = { $elemMatch: variantFilter };
    }

    // 🔄 Query builder
    let query = Product.find(filter)
      .sort(sort || "-createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("categories", "name slug");

    // 🎯 Field selection
    if (fields) {
      const selectFields = fields.split(",").join(" ");
      query = query.select(selectFields);
    } else {
      query = query.select("name price discountPercent images averageRating slug");
    }

    const [products, total] = await Promise.all([
      query.exec(),
      Product.countDocuments(filter),
    ]);

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/products/related/:idOrSlug
// Purpose: get related products based on shared categories or brand
export const getRelatedProducts = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { limit = 6, includeOutOfStock = "true" } = req.query;

    let product;

    // 🧠 Detect if param is an ObjectId or slug
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug });
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 🧮 Build related filter
    const filter = {
      _id: { $ne: product._id }, // exclude current product
      $or: [
        { categories: { $in: product.categories } }, // same category
        { brand: product.brand }, // or same brand
      ],
    };

    if (includeOutOfStock === "false") {
      filter.stock = { $gt: 0 };
    }

    // 🔄 Query related products
    const relatedProducts = await Product.find(filter)
      .limit(Number(limit))
      .populate("categories", "name slug")
      .select("name slug price discountPercent images brand averageRating");

    res.json({ 
      success: true, 
      count: relatedProducts.length,
      relatedProducts 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//create, update, delete product - admin only 
// POST /api/products — createProduct
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, discountPercent, brand, categories, variants, images, stock } = req.body;

    // Basic validation
    if (!name || !price || !categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, message: "Name, price, and at least one category are required" });
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// PUT /api/products/:id — updateProduct
// PUT /api/products/:idOrSlug — updateProduct
export const updateProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const updates = req.body;

    let updatedProduct;

    // 🧠 Detect whether it's an ObjectId or slug
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      updatedProduct = await Product.findByIdAndUpdate(idOrSlug, updates, { new: true });
    } else {
      updatedProduct = await Product.findOneAndUpdate({ slug: idOrSlug }, updates, { new: true });
    }

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/products/:idOrSlug — deleteProduct
export const deleteProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let deletedProduct;

    // 🧠 Detect whether it's an ObjectId or slug
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      deletedProduct = await Product.findByIdAndDelete(idOrSlug);
    } else {
      deletedProduct = await Product.findOneAndDelete({ slug: idOrSlug });
    }

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: x, message: error.message });
  }
};

//add product variant check if product exists
export const addProductVariant = async (req, res) => {
    try {
        const { idOrSlug } = req.params;
        const { size, color, additionalPrice, stock, sku } = req.body;
        let product;

        // 🧠 Determine if the param is an ObjectId or slug
        if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
            product = await Product.findById(idOrSlug);
        }
        else {
            product = await Product.findOne({ slug: idOrSlug });
        }

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const newVariant = {
            size,
            color,
            additionalPrice,
            stock,
            sku
        };

        product.variants.push(newVariant);
        await product.save();

        res.status(201).json({ success: true, message: "Product variant added successfully", product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//update product variant
export const updateProductVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;
    const { size, color, additionalPrice, stock } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: { "variants.$[variant].size": size, "variants.$[variant].color": color, "variants.$[variant].additionalPrice": additionalPrice, "variants.$[variant].stock": stock } },
      { new: true, arrayFilters: [{ "variant._id": variantId }] }
    );

    res.json({ success: true, message: "Product variant updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//delete product variant
export const deleteProductVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $pull: { variants: { _id: variantId } } },
      { new: true }
    );

    res.json({ success: true, message: "Product variant deleted successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

