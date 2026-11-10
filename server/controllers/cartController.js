const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateItemPrice } = require('../utils/weightCalculator');

// @desc    Get user's shopping cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [], subtotal: 0 });
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res, next) => {
  try {
    const { productId, weightInGrams } = req.body;

    const parsedWeight = parseInt(weightInGrams, 10);
    if (!parsedWeight || parsedWeight <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid weight in grams is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stockInGrams < parsedWeight) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}. Available: ${product.stockInKg}kg (${product.stockInGrams}g)`
      });
    }

    const { amountInRupees } = calculateItemPrice(product.pricePerKg, parsedWeight);

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [], subtotal: 0 });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      // Update weight
      const newWeight = cart.items[existingIndex].weightInGrams + parsedWeight;
      if (product.stockInGrams < newWeight) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more ${product.name}. Total requested (${newWeight}g) exceeds stock (${product.stockInGrams}g)`
        });
      }
      const recalculated = calculateItemPrice(product.pricePerKg, newWeight);
      cart.items[existingIndex].weightInGrams = newWeight;
      cart.items[existingIndex].totalPrice = recalculated.amountInRupees;
      cart.items[existingIndex].pricePerKg = product.pricePerKg;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        pricePerKg: product.pricePerKg,
        image: product.image,
        weightInGrams: parsedWeight,
        totalPrice: amountInRupees
      });
    }

    cart.calculateSubtotal();
    await cart.save();

    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: `${product.name} added to cart`,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item weight
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { weightInGrams } = req.body;

    const parsedWeight = parseInt(weightInGrams, 10);
    if (!parsedWeight || parsedWeight <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be greater than 0 grams'
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not in cart' });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stockInGrams < parsedWeight) {
      return res.status(400).json({
        success: false,
        message: `Requested ${parsedWeight}g exceeds available stock (${product.stockInGrams}g)`
      });
    }

    const recalculated = calculateItemPrice(product.pricePerKg, parsedWeight);
    item.weightInGrams = parsedWeight;
    item.totalPrice = recalculated.amountInRupees;
    item.pricePerKg = product.pricePerKg;

    cart.calculateSubtotal();
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    cart.calculateSubtotal();
    await cart.save();
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: { items: [], subtotal: 0 }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
