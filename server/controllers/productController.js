const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');

// @desc    Get all products with search, filter, sort, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      isFeatured,
      isAvailable,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (isAvailable === 'true') {
      query.isAvailable = true;
      query.stockInGrams = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
      query.pricePerKg = {};
      if (minPrice) query.pricePerKg.$gte = Number(minPrice);
      if (maxPrice) query.pricePerKg.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { pricePerKg: 1 };
    if (sort === 'price-desc') sortOptions = { pricePerKg: -1 };
    if (sort === 'name-asc') sortOptions = { name: 1 };
    if (sort === 'name-desc') sortOptions = { name: -1 };
    if (sort === 'stock-asc') sortOptions = { stockInGrams: 1 };
    if (sort === 'stock-desc') sortOptions = { stockInGrams: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      image,
      pricePerKg,
      stockInGrams = 10000,
      minStockThresholdInGrams = 3000,
      isFeatured = false,
      isAvailable = true
    } = req.body;

    const product = await Product.create({
      name,
      description,
      category,
      image,
      pricePerKg: Number(pricePerKg),
      stockInGrams: Number(stockInGrams),
      minStockThresholdInGrams: Number(minStockThresholdInGrams),
      isFeatured: Boolean(isFeatured),
      isAvailable: Boolean(isAvailable)
    });

    // Record initial stock inventory transaction
    if (stockInGrams > 0) {
      await InventoryTransaction.create({
        product: product._id,
        productName: product.name,
        transactionType: 'RESTOCK',
        quantityInGrams: product.stockInGrams,
        previousStock: 0,
        updatedStock: product.stockInGrams,
        referenceId: 'INITIAL_STOCK',
        performedBy: req.user?._id,
        performerName: req.user?.name || 'Admin',
        notes: 'Initial product stock creation'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const previousStock = product.stockInGrams;
    const previousPrice = product.pricePerKg;

    // Apply updates
    const updates = req.body;
    if (updates.pricePerKg) {
      updates.pricePerKgInPaise = Math.round(Number(updates.pricePerKg) * 100);
    }

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    // If stock changed directly via product edit, record audit transaction
    if (updates.stockInGrams !== undefined && updates.stockInGrams !== previousStock) {
      const delta = Number(updates.stockInGrams) - previousStock;
      await InventoryTransaction.create({
        product: product._id,
        productName: product.name,
        transactionType: 'AUDIT_CORRECTION',
        quantityInGrams: delta,
        previousStock,
        updatedStock: product.stockInGrams,
        referenceId: 'MANUAL_UPDATE',
        performedBy: req.user?._id,
        performerName: req.user?.name || 'Admin',
        notes: `Product stock manually updated from ${previousStock}g to ${product.stockInGrams}g`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories summary
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = [
      'Leafy Vegetables',
      'Root Vegetables',
      'Fresh Fruits',
      'Seasonal Vegetables',
      'Organic Products'
    ];

    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const result = categories.map((cat) => ({
      name: cat,
      count: countMap[cat] || 0
    }));

    res.status(200).json({
      success: true,
      categories: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
