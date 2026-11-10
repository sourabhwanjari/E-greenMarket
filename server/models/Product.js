const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Leafy Vegetables',
        'Root Vegetables',
        'Fresh Fruits',
        'Seasonal Vegetables',
        'Organic Products'
      ],
      index: true
    },
    image: {
      type: String,
      required: [true, 'Product image is required']
    },
    pricePerKg: {
      type: Number,
      required: [true, 'Price per kilogram is required'],
      min: [1, 'Price per kg must be greater than 0']
    },
    pricePerKgInPaise: {
      type: Number,
      default: function () {
        return Math.round(this.pricePerKg * 100);
      }
    },
    stockInGrams: {
      type: Number,
      required: [true, 'Stock in grams is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10000 // 10 kg
    },
    minStockThresholdInGrams: {
      type: Number,
      default: 3000 // 3 kg trigger for low stock alert
    },
    unit: {
      type: String,
      default: 'kg'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

// Virtual for stock in kilograms
productSchema.virtual('stockInKg').get(function () {
  return parseFloat((this.stockInGrams / 1000).toFixed(2));
});

// Auto-sync pricePerKgInPaise on save
productSchema.pre('save', function (next) {
  if (this.isModified('pricePerKg')) {
    this.pricePerKgInPaise = Math.round(this.pricePerKg * 100);
  }
  if (this.stockInGrams <= 0) {
    this.isAvailable = false;
  }
  next();
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
