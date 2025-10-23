import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { generateInvoice } from "../helpers/generateInvoice.js";

// --------------------------------------------------
// 1️⃣  Order Preview (NO DB WRITE)
// --------------------------------------------------
export const getOrderPreview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItems, shippingAddress, paymentMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // --- Build flexible query for either _id or slug ---
    const productFilters = cartItems.map((item) => {
      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        return { _id: item.productId };
      } else if (item.productSlug) {
        return { slug: item.productSlug.toLowerCase() };
      }
      return null;
    }).filter(Boolean);

    if (productFilters.length === 0) {
      return res.status(400).json({ success: false, message: "No valid product identifiers provided." });
    }

    // --- Fetch products in one query ---
    const products = await Product.find({ $or: productFilters }).lean();

    let items = [];
    let itemsSubtotal = 0;

    for (const item of cartItems) {
      const product = products.find(
        (p) =>
          p._id.toString() === item.productId ||
          p.slug === item.productSlug?.toLowerCase()
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId || item.productSlug}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`,
        });
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;

      items.push({
        product: product._id,
        productName: product.name,
        productBrand: product.brand,
        variantId: item.variantId,
        variantSnapshot: item.variantSnapshot,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });

      itemsSubtotal += lineTotal;
    }

    const discountTotal = 0;
    const shippingFee = 50;
    const totalAmount = itemsSubtotal - discountTotal + shippingFee;

    const orderPreview = {
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
      discountTotal,
      shippingFee,
      totalAmount: Number(totalAmount.toFixed(2)),
      status: "pending",
    };

    res.json({
      success: true,
      message: "Order preview generated successfully",
      orderPreview,
    });
  } catch (error) {
    console.error("Order Preview Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------
// 2️⃣  Place Order (ACTUAL CREATION IN DB)
// --------------------------------------------------
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItems, shippingAddress, paymentMethod } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // --- Build flexible query for either _id or slug ---
    const productFilters = cartItems.map((item) => {
      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        return { _id: item.productId };
      } else if (item.productSlug) {
        return { slug: item.productSlug.toLowerCase() };
      }
      return null;
    }).filter(Boolean);

    if (productFilters.length === 0) {
      return res.status(400).json({ success: false, message: "No valid product identifiers provided." });
    }

    // --- Fetch products in one query ---
    const products = await Product.find({ $or: productFilters }).lean();

    let items = [];
    let itemsSubtotal = 0;

    for (const item of cartItems) {
      const product = products.find(
        (p) =>
          p._id.toString() === item.productId ||
          p.slug === item.productSlug?.toLowerCase()
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId || item.productSlug}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`,
        });
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * item.quantity;

      items.push({
        product: product._id,
        productName: product.name,
        productBrand: product.brand,
        variantId: item.variantId,
        variantSnapshot: item.variantSnapshot,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      });

      itemsSubtotal += lineTotal;
    }

    const discountTotal = 0;
    const shippingFee = 50;
    const totalAmount = itemsSubtotal - discountTotal + shippingFee;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const newOrder = await Order.create({
      orderNumber,
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
      discountTotal,
      shippingFee,
      totalAmount: Number(totalAmount.toFixed(2)),
      status: "pending",
      placedAt: new Date(),
    });

    // --- Decrement stock (variant-aware) ---
    for (const item of items) {
      if (item.variantId) {
        const updated = await Product.updateOne(
          {
            _id: item.product,
            "variants._id": item.variantId,
            "variants.stock": { $gte: item.quantity },
          },
          {
            $inc: { "variants.$.stock": -item.quantity, stock: -item.quantity },
          }
        );

        if (updated.matchedCount === 0) {
          throw new Error(`Insufficient stock for variant of ${item.productName}`);
        }
      } else {
        const updated = await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        );

        if (updated.matchedCount === 0) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------
// 3️⃣  Get All Orders (ADMIN)
// --------------------------------------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().lean().exec();
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Get All Orders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------
// 4️⃣  Get User Orders
// --------------------------------------------------
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).lean().exec();
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// --------------------------------------------------
// 5️⃣  Get Order by ID
// --------------------------------------------------
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.id;
    const order = await Order.findById(orderId).lean().exec();
    res.json({ success: true, order });
  } catch (error) {
    console.error("Get Order by ID Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// --------------------------------------------------
// 6️⃣  Update Order Status (ADMIN)
// --------------------------------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true }).lean().exec();
    res.json({ success: true, message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

//cancel order
export const cancelOrder = async (req, res) => {
  try { 
    const orderId = req.params.id;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: "cancelled", cancelledAt: new Date() }, { new: true }).lean().exec();
    res.json({ success: true, message: "Order cancelled", order: updatedOrder });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
//download invoice
export const downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).lean().exec();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const invoice = await generateInvoice(order);
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.orderNumber}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(invoice);
  } catch (error) {
    console.error("Download Invoice Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};