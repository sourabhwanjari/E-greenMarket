const { body } = require('express-validator');

const billingValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required for billing'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID in items'),
  body('items.*.weightInGrams')
    .isInt({ min: 50 })
    .withMessage('Weight must be at least 50 grams per item'),
  body('paymentMethod')
    .isIn(['CASH', 'UPI', 'ONLINE'])
    .withMessage('Payment method must be CASH, UPI, or ONLINE'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount cannot be negative')
];

module.exports = { billingValidator };
