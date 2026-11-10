const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const InventoryTransaction = require('../models/InventoryTransaction');
const { generateInvoiceNumber } = require('../utils/invoiceGenerator');
const { calculateItemPrice, calculateBillTotals } = require('../utils/weightCalculator');
const { runInTransaction } = require('../config/db');

// @desc    Create POS Bill & update inventory atomically
// @route   POST /api/billing
// @access  Private (Staff, Admin)
const createBill = async (req, res, next) => {
  try {
    const {
      customerDetails = { name: 'Walk-in Customer', phone: '' },
      items,
      discountPercent = 0,
      taxPercent = 0,
      deliveryCharge = 0,
      paymentMethod = 'CASH',
      amountReceived = 0
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one item is required for billing'
      });
    }

    // Step 1: Pre-fetch and validate stock and prices for all items
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
    });

    const validatedItems = [];
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for ID: ${item.productId}`
        });
      }

      const weightInGrams = parseInt(item.weightInGrams, 10);
      if (!weightInGrams || weightInGrams <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid weight for ${product.name}`
        });
      }

      // Check stock
      if (product.stockInGrams < weightInGrams) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockInKg}kg (${product.stockInGrams}g), Requested: ${(weightInGrams / 1000).toFixed(2)}kg`
        });
      }

      const { amountInRupees } = calculateItemPrice(product.pricePerKg, weightInGrams);

      validatedItems.push({
        product: product._id,
        name: product.name,
        ratePerKg: product.pricePerKg,
        weightInGrams,
        amount: amountInRupees
      });
    }

    // Calculate authoritative totals
    const totals = calculateBillTotals(
      validatedItems,
      discountPercent,
      taxPercent,
      deliveryCharge
    );

    // Validate cash received
    const parsedReceived = Number(amountReceived) || 0;
    let changeReturned = 0;
    if (paymentMethod === 'CASH') {
      if (parsedReceived > 0 && parsedReceived < totals.grandTotal) {
        return res.status(400).json({
          success: false,
          message: `Received cash (₹${parsedReceived}) is less than grand total (₹${totals.grandTotal})`
        });
      }
      changeReturned = parsedReceived >= totals.grandTotal ? parseFloat((parsedReceived - totals.grandTotal).toFixed(2)) : 0;
    }

    const invoiceNumber = generateInvoiceNumber();

    // Execute atomic update
    const result = await runInTransaction(async (session) => {
      const inventoryLogs = [];

      // 1. Deduct stock for each item
      for (const item of validatedItems) {
        const prod = productMap[item.product.toString()];
        const previousStock = prod.stockInGrams;
        const updatedStock = previousStock - item.weightInGrams;

        // Atomic conditional decrement to ensure no race condition
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
          throw new Error(`Concurrent stock deduction failed for ${item.name}. Stock was modified.`);
        }

        inventoryLogs.push({
          product: item.product,
          productName: item.name,
          transactionType: 'PURCHASE_POS',
          quantityInGrams: -item.weightInGrams,
          previousStock,
          updatedStock,
          referenceId: invoiceNumber,
          performedBy: req.user?._id,
          performerName: req.user?.name || 'Cashier',
          notes: `POS Bill Sale #${invoiceNumber}`
        });
      }

      // 2. Save inventory transactions
      await InventoryTransaction.insertMany(inventoryLogs, { session });

      // 3. Create Invoice
      const invoiceData = {
        invoiceNumber,
        customerDetails: {
          name: customerDetails.name || 'Walk-in Customer',
          phone: customerDetails.phone || ''
        },
        items: validatedItems,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        deliveryCharge: totals.deliveryCharge,
        grandTotal: totals.grandTotal,
        amountReceived: paymentMethod === 'CASH' ? (parsedReceived || totals.grandTotal) : totals.grandTotal,
        changeReturned,
        paymentMethod,
        paymentStatus: 'PAID',
        createdBy: req.user?._id,
        cashierName: req.user?.name || 'Green Grocery Cashier'
      };

      const [newInvoice] = await Invoice.create([invoiceData], { session });
      return newInvoice;
    });

    res.status(201).json({
      success: true,
      message: 'Bill created and inventory updated successfully',
      invoice: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invoices with filtering, pagination & search
// @route   GET /api/billing
// @access  Private (Staff, Admin)
const getAllInvoices = async (req, res, next) => {
  try {
    const {
      search,
      startDate,
      endDate,
      paymentMethod,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { invoiceNumber: { $regex: s, $options: 'i' } },
        { 'customerDetails.name': { $regex: s, $options: 'i' } },
        { 'customerDetails.phone': { $regex: s, $options: 'i' } }
      ];
    }

    if (paymentMethod && paymentMethod !== 'ALL') {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: invoices.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      invoices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('items.product');
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      invoice
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBill,
  getAllInvoices,
  getInvoiceById
};
