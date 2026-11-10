const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { runInTransaction } = require('../config/db');

// @desc    Get real-time inventory overview
// @route   GET /api/inventory
// @access  Private (Staff, Admin)
const getInventory = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status === 'OUT_OF_STOCK') {
      query.stockInGrams = { $lte: 0 };
    } else if (status === 'LOW_STOCK') {
      query.stockInGrams = { $gt: 0, $lte: 3000 };
    } else if (status === 'IN_STOCK') {
      query.stockInGrams = { $gt: 3000 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ stockInGrams: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Enhance each product with low-stock flag and formatted weights
    const inventory = products.map((p) => {
      const stockKg = parseFloat((p.stockInGrams / 1000).toFixed(2));
      const minThresholdKg = parseFloat(((p.minStockThresholdInGrams || 3000) / 1000).toFixed(2));
      let stockStatus = 'IN_STOCK';
      if (p.stockInGrams <= 0) {
        stockStatus = 'OUT_OF_STOCK';
      } else if (p.stockInGrams <= (p.minStockThresholdInGrams || 3000)) {
        stockStatus = 'LOW_STOCK';
      }

      return {
        ...p,
        stockInKg: stockKg,
        minStockThresholdKg: minThresholdKg,
        stockStatus
      };
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      inventory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust inventory stock (Restock, Damage, Audit Correction)
// @route   POST /api/inventory/adjust
// @access  Private (Staff, Admin)
const adjustStock = async (req, res, next) => {
  try {
    const { productId, transactionType, quantityInGrams, notes = '' } = req.body;

    const deltaGrams = parseInt(quantityInGrams, 10);
    if (isNaN(deltaGrams) || deltaGrams === 0) {
      return res.status(400).json({
        success: false,
        message: 'Non-zero quantity in grams is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousStock = product.stockInGrams;
    const updatedStock = previousStock + deltaGrams;

    if (updatedStock < 0) {
      return res.status(400).json({
        success: false,
        message: `Adjustment would cause negative stock. Current stock is ${previousStock}g (${(previousStock / 1000).toFixed(2)}kg)`
      });
    }

    await runInTransaction(async (session) => {
      product.stockInGrams = updatedStock;
      product.isAvailable = updatedStock > 0;
      await product.save({ session });

      await InventoryTransaction.create(
        [
          {
            product: product._id,
            productName: product.name,
            transactionType,
            quantityInGrams: deltaGrams,
            previousStock,
            updatedStock,
            referenceId: `ADJ-${Date.now()}`,
            performedBy: req.user._id,
            performerName: req.user.name,
            notes
          }
        ],
        { session }
      );
    });

    res.status(200).json({
      success: true,
      message: `Stock successfully adjusted for ${product.name}`,
      product: {
        id: product._id,
        name: product.name,
        previousStock,
        updatedStock,
        stockInKg: (updatedStock / 1000).toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock movement audit history
// @route   GET /api/inventory/history
// @access  Private (Staff, Admin)
const getInventoryHistory = async (req, res, next) => {
  try {
    const { productId, transactionType, page = 1, limit = 30 } = req.query;
    const query = {};

    if (productId) {
      query.product = productId;
    }

    if (transactionType && transactionType !== 'ALL') {
      query.transactionType = transactionType;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      InventoryTransaction.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  adjustStock,
  getInventoryHistory
};
