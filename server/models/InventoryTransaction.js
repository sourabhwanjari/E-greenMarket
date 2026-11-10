const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    productName: {
      type: String,
      required: true
    },
    transactionType: {
      type: String,
      enum: [
        'PURCHASE_POS',
        'ONLINE_ORDER',
        'RESTOCK',
        'DAMAGE_SPOILAGE',
        'AUDIT_CORRECTION'
      ],
      required: true,
      index: true
    },
    quantityInGrams: {
      type: Number,
      required: true // negative for deduction, positive for addition
    },
    previousStock: {
      type: Number,
      required: true
    },
    updatedStock: {
      type: Number,
      required: true
    },
    referenceId: {
      type: String,
      default: '' // Invoice number, Order number, or adjustment ticket
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performerName: {
      type: String,
      default: 'System'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
