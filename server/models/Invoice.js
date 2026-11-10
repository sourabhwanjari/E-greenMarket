const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  ratePerKg: { type: Number, required: true },
  weightInGrams: { type: Number, required: true },
  amount: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    customerDetails: {
      name: { type: String, default: 'Walk-in Customer' },
      phone: { type: String, default: '' }
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      required: true
    },
    amountReceived: {
      type: Number,
      default: 0
    },
    changeReturned: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'ONLINE'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PENDING'],
      default: 'PAID'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cashierName: {
      type: String,
      default: 'Green Grocery Cashier'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
