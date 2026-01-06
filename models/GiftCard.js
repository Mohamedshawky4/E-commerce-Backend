import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        initialBalance: {
            type: Number,
            required: true,
            min: 0,
        },
        currentBalance: {
            type: Number,
            required: true,
            min: 0,
        },
        expiryDate: {
            type: Date,
            default: null, // null means it never expires
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        purchasedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        usedBy: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                amount: Number,
                usedAt: { type: Date, default: Date.now },
                order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("GiftCard", giftCardSchema);
