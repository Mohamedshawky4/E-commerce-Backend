import asyncHandler from "express-async-handler";
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";


// --------------------------------------------------
// 🧮 Helper: Update Product Rating and Review Count
// --------------------------------------------------
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const avg = stats.length > 0 ? stats[0].avgRating : 0;
  const count = stats.length > 0 ? stats[0].totalReviews : 0;

  await Product.findByIdAndUpdate(productId, {
    averageRating: avg,
    reviewCount: count,
  });
};

// --------------------------------------------------
// 🟢 1️⃣ Add Review (Supports productId or slug)
export const addReview = asyncHandler(async (req, res) => {
  const { productId, slug, rating, comment, images, videos } = req.body;

  // 1️⃣ Find product by ID or slug
  const product =
    productId
      ? await Product.findById(productId)
      : await Product.findOne({ slug });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  // 2️⃣ Check if user purchased this product
  const hasOrdered = await Order.findOne({
    user: req.user._id,
    "items.product": product._id,
    status: { $in: ["delivered", "completed"] },
  });

  if (!hasOrdered) {
    return res.status(403).json({
      success: false,
      message: "You can only review products you've purchased.",
    });
  }

  // 3️⃣ Check if user already reviewed this product
  const existing = await Review.findOne({
    user: req.user._id,
    product: product._id,
  });

  if (existing) {
    return res.status(400).json({ message: "You already reviewed this product." });
  }

  // 4️⃣ Create review
  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating,
    comment,
    images: images || [],
    videos: videos || [],
    isVerifiedPurchase: !!hasOrdered,
  });

  await updateProductRating(product._id);

  res.status(201).json({
    success: true,
    message: "Review added successfully.",
    review,
  });
});


// --------------------------------------------------
// 🟣 2️⃣ Get All Reviews for a Product (Supports slug or ID)
// --------------------------------------------------
export const getProductReviews = asyncHandler(async (req, res) => {
  const { productIdOrSlug } = req.params; // dynamic param (id or slug)
  const { sort = "recent", rating, hasImages, keyword } = req.query;

  // Try to find product by either ID or slug
  let product;
  if (mongoose.Types.ObjectId.isValid(productIdOrSlug)) {
    product = await Product.findById(productIdOrSlug);
  } else {
    product = await Product.findOne({ slug: productIdOrSlug });
  }

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  // --- Build filters ---
  const filter = { product: product._id };
  if (rating) filter.rating = Number(rating);
  if (hasImages === "true") filter.images = { $exists: true, $ne: [] };
  if (keyword) filter.comment = { $regex: keyword, $options: "i" };

  // --- Sorting options ---
  const sortOptions = {
    recent: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1 },
    lowest: { rating: 1 },
  };

  const sortBy = sortOptions[sort] || sortOptions.recent;

  // --- Query ---
  const reviews = await Review.find(filter)
    .populate("user", "name avatar")
    .sort(sortBy);

  res.json({
    success: true,
    count: reviews.length,
    reviews,
  });
});




// --------------------------------------------------
// 🔵 3️⃣ Get Reviews by Logged-in User
// --------------------------------------------------
export const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate("product", "name images slug price")
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// --------------------------------------------------
// 🟡 4️⃣ Update Review (User Only)
// --------------------------------------------------
export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment, images } = req.body;

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: "Review not found." });

  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized." });
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  if (images !== undefined) review.images = images;

  await review.save();
  await updateProductRating(review.product);

  res.json({ success: true, message: "Review updated.", review });
});

// --------------------------------------------------
// 🔴 5️⃣ Delete Review (User or Admin)
// --------------------------------------------------
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: "Review not found." });

  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized." });
  }

  await review.deleteOne();
  await updateProductRating(review.product);

  res.json({ success: true, message: "Review deleted." });
});

// --------------------------------------------------
// 🟠 6️⃣ Like / Unlike Review
// --------------------------------------------------
export const toggleLikeReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(id);
  if (!review) return res.status(404).json({ message: "Review not found." });

  const alreadyLiked = review.likes.includes(userId);

  if (alreadyLiked) {
    review.likes.pull(userId);
  } else {
    review.likes.push(userId);
  }

  await review.save();

  res.json({
    success: true,
    message: alreadyLiked ? "Review unliked." : "Review liked.",
    likesCount: review.likes.length,
  });
});

// --------------------------------------------------
// 🟤 7️⃣ Admin: Get All Reviews
// --------------------------------------------------
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("product", "name slug")
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// --------------------------------------------------
// ⚫ 8️⃣ Report Review
// --------------------------------------------------
export const reportReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  //check if review exists
  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found." });
  }
  review.reports.push({ user: req.user._id, reason, reportedAt: new Date() });
  await review.save();

  res.json({ success: true, message: "Review reported." });
});

// --------------------------------------------------
// 🟣 9️⃣ Get Reported Reviewss
// --------------------------------------------------
export const getReportedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ "reports.0": { $exists: true } })
    .populate("user", "name email")
    .populate("product", "name slug")
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// --------------------------------------------------
//10 clear reports
export const clearReviewReports = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await Review.findByIdAndUpdate(id, { $pull: { reports: {} } });
  res.json({ success: true, message: "Review reports cleared." });
});

// --------------------------------------------------
//11 change review status
export const changeReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Review.findByIdAndUpdate(id, { status });
  res.json({ success: true, message: "Review status changed." });
});