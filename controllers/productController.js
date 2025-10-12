    // GET /api/products — getProducts

    // Purpose: list products with pagination, sorting, filtering, search.

    // Query params to support: page, limit, sort (e.g. -price), search, category, minPrice, maxPrice, brand, discounted=true, rating>=, hasStock=true, variant=size,color, tags, fields (select).

    // Should return: products array + pagination metadata (total, page, pages, limit).
    import Product from "../models/Product.js";
    import Category from "../models/Category.js";
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
