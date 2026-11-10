const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { productValidator } = require('../validators/productValidators');

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only endpoints
router.post('/', protect, authorize('ADMIN'), productValidator, validate, createProduct);
router.put('/:id', protect, authorize('ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

module.exports = router;
