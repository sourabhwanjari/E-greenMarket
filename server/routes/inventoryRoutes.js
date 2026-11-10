const express = require('express');
const router = express.Router();
const {
  getInventory,
  adjustStock,
  getInventoryHistory
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { adjustInventoryValidator } = require('../validators/orderValidators');

router.use(protect);
router.use(authorize('ADMIN', 'STAFF'));

router.get('/', getInventory);
router.post('/adjust', adjustInventoryValidator, validate, adjustStock);
router.get('/history', getInventoryHistory);

module.exports = router;
