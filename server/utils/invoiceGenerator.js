const crypto = require('crypto');

/**
 * Generates unique sequence-based IDs for Invoices and Orders
 */
function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = crypto.randomInt(1000, 9999);
  return `GG-INV-${year}${month}${day}-${randomSuffix}`;
}

function generateOrderNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = crypto.randomInt(1000, 9999);
  return `GG-ORD-${year}${month}${day}-${randomSuffix}`;
}

module.exports = {
  generateInvoiceNumber,
  generateOrderNumber
};
