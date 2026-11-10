const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getCustomers,
  getSalesReport
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/customers', getCustomers);
router.get('/sales', getSalesReport);

module.exports = router;
