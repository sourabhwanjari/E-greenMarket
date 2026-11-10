const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  image: { type: String, default: '' },
  weightInGrams: {
    type: Number,
    required: true,
    min: [50, 'Minimum weight is 50g']
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: [cartItemSchema],
    subtotal: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Method to calculate subtotal
cartSchema.methods.calculateSubtotal = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  return this.subtotal;
};

module.exports = mongoose.model('Cart', cartSchema);
