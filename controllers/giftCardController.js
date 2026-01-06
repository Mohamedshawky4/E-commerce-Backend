import asyncHandler from "express-async-handler";
import GiftCard from "../models/GiftCard.js";

// @desc    Validate/Check gift card balance
// @route   POST /api/gift-cards/check
// @access  Private
export const checkGiftCard = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: "Please provide a gift card code." });
    }

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!giftCard) {
        return res.status(404).json({ message: "Invalid gift card code." });
    }

    if (!giftCard.isActive) {
        return res.status(400).json({ message: "This gift card is inactive." });
    }

    if (giftCard.expiryDate && giftCard.expiryDate < new Date()) {
        return res.status(400).json({ message: "This gift card has expired." });
    }

    if (giftCard.currentBalance <= 0) {
        return res.status(400).json({ message: "This gift card has zero balance." });
    }

    res.json({
        success: true,
        code: giftCard.code,
        balance: giftCard.currentBalance,
    });
});

// @desc    Create a new gift card (Admin only)
export const createGiftCard = asyncHandler(async (req, res) => {
    const { code, amount, expiryDate } = req.body;

    const codeToUse = code ? code.toUpperCase() : Math.random().toString(36).substring(2, 10).toUpperCase();

    const gcExists = await GiftCard.findOne({ code: codeToUse });
    if (gcExists) {
        return res.status(400).json({ message: "Gift card code already exists." });
    }

    const giftCard = await GiftCard.create({
        code: codeToUse,
        initialBalance: amount,
        currentBalance: amount,
        expiryDate,
    });

    res.status(201).json(giftCard);
});
