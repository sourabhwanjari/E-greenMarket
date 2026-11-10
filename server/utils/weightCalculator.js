/**
 * Weight Calculator Core Utility
 * Authoritative business calculation with integer-based precision to prevent floating-point errors.
 */

/**
 * Calculates weight in grams from kilograms and grams.
 * @param {number} kg - Kilograms
 * @param {number} g - Grams
 * @returns {number} Total weight in grams (integer)
 */
function calculateWeightInGrams(kg = 0, g = 0) {
  const parsedKg = Number(kg) || 0;
  const parsedG = Number(g) || 0;

  if (parsedKg < 0 || parsedG < 0) {
    throw new Error('Weight values cannot be negative');
  }

  const totalGrams = Math.round(parsedKg * 1000) + Math.round(parsedG);

  if (totalGrams <= 0) {
    throw new Error('Total weight must be greater than zero');
  }

  return totalGrams;
}

/**
 * Calculates the exact price for a given weight in grams and price per kg.
 * Uses integer paise arithmetic internally to eliminate floating point issues.
 * @param {number} pricePerKg - Price in INR per kilogram
 * @param {number} weightInGrams - Weight in grams
 * @returns {Object} { amountInRupees, amountInPaise, weightInGrams, weightInKg }
 */
function calculateItemPrice(pricePerKg, weightInGrams) {
  if (typeof pricePerKg !== 'number' || pricePerKg <= 0) {
    throw new Error('Invalid price per kg. Must be a positive number');
  }

  if (typeof weightInGrams !== 'number' || weightInGrams <= 0) {
    throw new Error('Invalid weight. Must be greater than 0 grams');
  }

  // Convert price to paise (integer)
  const pricePerKgPaise = Math.round(pricePerKg * 100);

  // Exact paise calculation: (pricePerKgPaise * weightInGrams) / 1000
  // Round to nearest integer paise
  const amountInPaise = Math.round((pricePerKgPaise * weightInGrams) / 1000);

  // Convert back to rupees with 2 decimal places
  const amountInRupees = parseFloat((amountInPaise / 100).toFixed(2));
  const weightInKg = parseFloat((weightInGrams / 1000).toFixed(3));

  return {
    amountInRupees,
    amountInPaise,
    weightInGrams: Math.round(weightInGrams),
    weightInKg
  };
}

/**
 * Calculates totals for a batch of items (subtotal, discount, tax, grand total)
 * @param {Array} items - Array of { pricePerKg, weightInGrams }
 * @param {number} discountPercent - Discount percentage (0 - 100)
 * @param {number} taxPercent - Tax percentage (0 - 100)
 * @param {number} deliveryCharge - Delivery fee
 */
function calculateBillTotals(items = [], discountPercent = 0, taxPercent = 0, deliveryCharge = 0) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      subtotal: 0,
      discount: 0,
      tax: 0,
      deliveryCharge: 0,
      grandTotal: 0,
      totalWeightGrams: 0,
      totalWeightKg: 0
    };
  }

  let subtotalPaise = 0;
  let totalWeightGrams = 0;

  for (const item of items) {
    const { amountInPaise, weightInGrams } = calculateItemPrice(item.pricePerKg || item.ratePerKg, item.weightInGrams);
    subtotalPaise += amountInPaise;
    totalWeightGrams += weightInGrams;
  }

  // Calculate discount in paise
  const validDiscountPercent = Math.max(0, Math.min(100, Number(discountPercent) || 0));
  const discountPaise = Math.round((subtotalPaise * validDiscountPercent) / 100);

  const discountedSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);

  // Tax in paise
  const validTaxPercent = Math.max(0, Number(taxPercent) || 0);
  const taxPaise = Math.round((discountedSubtotalPaise * validTaxPercent) / 100);

  // Delivery charge in paise
  const deliveryPaise = Math.round((Number(deliveryCharge) || 0) * 100);

  const grandTotalPaise = discountedSubtotalPaise + taxPaise + deliveryPaise;

  return {
    subtotal: parseFloat((subtotalPaise / 100).toFixed(2)),
    discount: parseFloat((discountPaise / 100).toFixed(2)),
    tax: parseFloat((taxPaise / 100).toFixed(2)),
    deliveryCharge: parseFloat((deliveryPaise / 100).toFixed(2)),
    grandTotal: parseFloat((grandTotalPaise / 100).toFixed(2)),
    subtotalPaise,
    grandTotalPaise,
    totalWeightGrams,
    totalWeightKg: parseFloat((totalWeightGrams / 1000).toFixed(3))
  };
}

module.exports = {
  calculateWeightInGrams,
  calculateItemPrice,
  calculateBillTotals
};
