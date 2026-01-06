import asyncHandler from "express-async-handler";
import Coupon from "../models/Coupon.js";

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = asyncHandler(async (req, res) => {
    const { code, cartTotal } = req.body;

    if (!code) {
        return res.status(400).json({ message: "Please provide a coupon code." });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code." });
    }

    if (!coupon.isActive) {
        return res.status(400).json({ message: "This coupon is no longer active." });
    }

    if (coupon.expiryDate < new Date()) {
        return res.status(400).json({ message: "This coupon has expired." });
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "This coupon has reached its usage limit." });
    }

    if (cartTotal < coupon.minPurchase) {
        return res.status(400).json({
            message: `Minimum purchase of $${coupon.minPurchase} is required to use this coupon.`
        });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else {
        discountAmount = coupon.discountValue;
    }

    // Cap discount at cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    res.json({
        success: true,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
    });
});

// @desc    Create a new coupon (Admin only)
export const createCoupon = asyncHandler(async (req, res) => {
    const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
        return res.status(400).json({ message: "Coupon code already exists." });
    }

    const coupon = await Coupon.create({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        minPurchase,
        expiryDate,
        usageLimit,
    });

    res.status(201).json(coupon);
});
