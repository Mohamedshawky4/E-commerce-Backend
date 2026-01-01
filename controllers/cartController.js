import Cart from "../models/Cart.js";

// ✅ Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product", "name price images slug variants");

    if (!cart) {
      return res.json({ success: true, cart: { items: [], totalPrice: 0 } });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ➕ Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity } = req.body;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId && item.variantId?.toString() === variantId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, variantId, quantity });
    }

    // 🧮 Optionally recalculate total price
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price images slug variants");

    res.json({ success: true, message: "Item added to cart", cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//update quantity

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find(
      i => i.product.toString() === productId && i.variantId?.toString() === variantId
    );

    if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

    item.quantity = quantity;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.product", "name price images slug variants");

    res.json({ success: true, message: "Cart item updated", cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ❌ Remove item from cart

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId } = req.body;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId, variantId } } },
      { new: true }
    ).populate("items.product", "name price images slug");

    res.json({ success: true, message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🧹 Clear entire cart

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    await Cart.findOneAndUpdate({ user: userId }, { items: [], totalPrice: 0 });
    res.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



