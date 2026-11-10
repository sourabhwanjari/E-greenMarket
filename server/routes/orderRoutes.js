const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { orderValidator } = require('../validators/orderValidators');

router.use(protect);

router.post('/', orderValidator, validate, createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

// Staff and Admin endpoints
router.get('/', authorize('ADMIN', 'STAFF'), getAllOrders);
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), updateOrderStatus);

module.exports = router;
