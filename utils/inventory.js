import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * Atomic stock decrement for multiple products.
 * Uses MongoDB transactions to ensure all or none succeed.
 */
export const decrementStockAtomic = async (items) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        for (const item of items) {
            if (item.variantId) {
                const updated = await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        "variants._id": item.variantId,
                        "variants.stock": { $gte: item.quantity },
                    },
                    {
                        $inc: { "variants.$.stock": -item.quantity, stock: -item.quantity },
                    },
                    { session, new: true }
                );

                if (!updated) {
                    throw new Error(`Insufficient stock for variant of product ${item.productName || item.product}`);
                }
            } else {
                const updated = await Product.findOneAndUpdate(
                    { _id: item.product, stock: { $gte: item.quantity } },
                    { $inc: { stock: -item.quantity } },
                    { session, new: true }
                );

                if (!updated) {
                    throw new Error(`Insufficient stock for product ${item.productName || item.product}`);
                }
            }
        }

        await session.commitTransaction();
        session.endSession();
        return true;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Atomic Stock Decrement Failed:", error.message);
        throw error;
    }
};
