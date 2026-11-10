const { body } = require('express-validator');

const orderValidator = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required in the order'),
  body('deliveryAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('deliveryAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('deliveryAddress.pincode')
    .trim()
    .isPostalCode('any')
    .withMessage('Valid pincode is required'),
  body('paymentMethod')
    .isIn(['COD', 'UPI', 'ONLINE'])
    .withMessage('Payment method must be COD, UPI, or ONLINE')
];

const adjustInventoryValidator = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('transactionType')
    .isIn(['RESTOCK', 'DAMAGE_SPOILAGE', 'AUDIT_CORRECTION'])
    .withMessage('Invalid transaction type'),
  body('quantityInGrams')
    .isInt()
    .withMessage('Quantity in grams must be an integer (positive for add, negative for remove)'),
  body('notes')
    .optional()
    .trim()
];

module.exports = {
  orderValidator,
  adjustInventoryValidator
};
