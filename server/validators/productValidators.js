const { body, param } = require('express-validator');

const productValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('category')
    .isIn([
      'Leafy Vegetables',
      'Root Vegetables',
      'Fresh Fruits',
      'Seasonal Vegetables',
      'Organic Products'
    ])
    .withMessage('Category must be one of: Leafy Vegetables, Root Vegetables, Fresh Fruits, Seasonal Vegetables, Organic Products'),
  body('pricePerKg')
    .isFloat({ min: 1 })
    .withMessage('Price per kg must be a positive number'),
  body('stockInGrams')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock in grams must be a non-negative integer'),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Product image URL is required')
];

module.exports = { productValidator };
