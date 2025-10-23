import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { addReview,getProductReviews,getUserReviews,updateReview,deleteReview,toggleLikeReview,getAllReviews,reportReview,getReportedReviews,clearReviewReports,changeReviewStatus } from "../controllers/reviewControllers.js";
const reviewRoutes = express.Router();

// --------------------------------------------------
// ⭐ Review Routes
// --------------------------------------------------

// 1️⃣ Add a review (User Only)
reviewRoutes.post("/", protect, addReview);

// 2️⃣ Get all reviews for a product
reviewRoutes.get("/product/:productIdOrSlug", getProductReviews);

// 3️⃣ Get all reviews for the logged-in user
reviewRoutes.get("/user", protect, getUserReviews);

// 4️⃣ Update a review (User Only)
reviewRoutes.put("/:id", protect, updateReview);
// 5️⃣ Delete a review (User or Admin)
reviewRoutes.delete("/:id", protect, deleteReview);  
// 8️⃣ Report a review (user)
reviewRoutes.post("/:id/report", protect, reportReview);

// 6️⃣ Like a review (User Only)
reviewRoutes.post("/:id/like", protect, toggleLikeReview);
// --------------------------------------------------

// Admin Review Management Routes
// --------------------------------------------------

// 7️⃣ Get all reviews (Admin Only)
reviewRoutes.get("/", protect, admin, getAllReviews);   


// 9️⃣ Get reported reviews (Admin Only)
reviewRoutes.get("/reports/all", protect, admin, getReportedReviews);
// 🔟 Clear review reports (Admin Only)
reviewRoutes.delete("/:id/reports/clear", protect, admin, clearReviewReports);
// 1️⃣1️⃣ Change review status (Admin Only)
reviewRoutes.put("/:id/status", protect, admin, changeReviewStatus);
// --------------------------------------------------

export default reviewRoutes;
