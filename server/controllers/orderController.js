const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const InventoryTransaction = require('../models/InventoryTransaction');
const { generateOrderNumber } = require('../utils/invoiceGenerator');
const { calculateItemPrice, calculateBillTotals } = require('../utils/weightCalculator');
const { runInTransaction } = require('../config/db');

// @desc    Create online customer order
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      deliveryAddress,
      paymentMethod = 'COD',
      discountPercent = 0,
      notes = ''
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Complete delivery address (street, city, pincode) is required'
      });
    }

    // Validate product stock & current pricing
    const productIds = items.map((i) => i.productId || i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const validatedItems = [];
    for (const item of items) {
      const pid = (item.productId || item.product).toString();
      const product = productMap[pid];
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${pid}`
        });
      }

      const weight = parseInt(item.weightInGrams, 10);
      if (!weight || weight <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid weight for ${product.name}`
        });
      }

      if (product.stockInGrams < weight) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockInKg}kg`
        });
      }

      const { amountInRupees } = calculateItemPrice(product.pricePerKg, weight);

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        pricePerKg: product.pricePerKg,
        weightInGrams: weight,
        totalPrice: amountInRupees
      });
    }

    // Delivery charge rule: Free delivery for orders over ₹500, else ₹40
    const rawSubtotal = validatedItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const deliveryCharge = rawSubtotal >= 500 ? 0 : 40;

    const totals = calculateBillTotals(validatedItems, discountPercent, 0, deliveryCharge);
    const orderNumber = generateOrderNumber();

    const orderResult = await runInTransaction(async (session) => {
      // 1. Deduct stock for each item & log transaction
      const inventoryLogs = [];
      for (const item of validatedItems) {
        const prod = productMap[item.product.toString()];
        const previousStock = prod.stockInGrams;
        const updatedStock = previousStock - item.weightInGrams;

        const updated = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stockInGrams: { $gte: item.weightInGrams }
          },
          {
            $inc: { stockInGrams: -item.weightInGrams },
            $set: { isAvailable: updatedStock > 0 }
          },
          { new: true, session }
        );

        if (!updated) {
          throw new Error(`Insufficient stock for ${item.name} during checkout processing`);
        }

        inventoryLogs.push({
          product: item.product,
          productName: item.name,
          transactionType: 'ONLINE_ORDER',
          quantityInGrams: -item.weightInGrams,
          previousStock,
          updatedStock,
          referenceId: orderNumber,
          performedBy: req.user._id,
          performerName: req.user.name,
          notes: `Customer Order #${orderNumber}`
        });
      }

      await InventoryTransaction.insertMany(inventoryLogs, { session });

      // 2. Create Order
      const newOrder = await Order.create(
        [
          {
            orderNumber,
            customerId: req.user._id,
            customerDetails: {
              name: req.user.name,
              email: req.user.email,
              phone: req.user.phone
            },
            items: validatedItems,
            deliveryAddress,
            subtotal: totals.subtotal,
            discount: totals.discount,
            tax: totals.tax,
            deliveryCharge: totals.deliveryCharge,
            grandTotal: totals.grandTotal,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
            orderStatus: 'PLACED',
            statusHistory: [
              {
                status: 'PLACED',
                timestamp: new Date(),
                note: 'Order placed by customer'
              }
            ]
          }
        ],
        { session }
      );

      // 3. Clear user's cart
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [], subtotal: 0 },
        { session }
      );

      return newOrder[0];
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: orderResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Role check: customer can only see their own order, staff/admin can see any
    if (
      req.user.role === 'CUSTOMER' &&
      order.customerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin/Staff)
// @route   GET /api/orders
// @access  Private (Admin, Staff)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { orderNumber: { $regex: s, $options: 'i' } },
        { 'customerDetails.name': { $regex: s, $options: 'i' } },
        { 'customerDetails.phone': { $regex: s, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin, Staff)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note = '' } = req.body;
    const validStatuses = [
      'PLACED',
      'CONFIRMED',
      'PACKED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.orderStatus;
    if (oldStatus === status) {
      return res.status(200).json({
        success: true,
        message: 'Order status unchanged',
        order
      });
    }

    // If cancelling, restock the products
    if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      await runInTransaction(async (session) => {
        const restockLogs = [];
        for (const item of order.items) {
          const prod = await Product.findById(item.product).session(session);
          if (prod) {
            const prev = prod.stockInGrams;
            prod.stockInGrams += item.weightInGrams;
            prod.isAvailable = true;
            await prod.save({ session });

            restockLogs.push({
              product: item.product,
              productName: item.name,
              transactionType: 'RESTOCK',
              quantityInGrams: item.weightInGrams,
              previousStock: prev,
              updatedStock: prod.stockInGrams,
              referenceId: order.orderNumber,
              performedBy: req.user._id,
              performerName: req.user.name,
              notes: `Order #${order.orderNumber} Cancelled - Restocked`
            });
          }
        }
        if (restockLogs.length > 0) {
          await InventoryTransaction.insertMany(restockLogs, { session });
        }
      });
    }

    order.orderStatus = status;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status} by ${req.user.name}`
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};
