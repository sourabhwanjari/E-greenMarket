const express = require('express');
const router = express.Router();
const {
  createBill,
  getAllInvoices,
  getInvoiceById
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { billingValidator } = require('../validators/billingValidators');

router.use(protect);
router.use(authorize('ADMIN', 'STAFF'));

router.post('/', billingValidator, validate, createBill);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);

module.exports = router;
