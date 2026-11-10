/**
 * Comprehensive Automated Test Suite for Green Grocery
 * Runs in Node without external test framework dependencies.
 */
const assert = require('assert');
const {
  calculateWeightInGrams,
  calculateItemPrice,
  calculateBillTotals
} = require('../utils/weightCalculator');
const { generateInvoiceNumber, generateOrderNumber } = require('../utils/invoiceGenerator');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${error.message}`);
    failedTests++;
  }
}

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${error.message}`);
    failedTests++;
  }
}

async function startSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING GREEN GROCERY TEST SUITE');
  console.log('======================================================\n');

  console.log('--- 1. VEGETABLE WEIGHT CALCULATOR UNIT TESTS ---');

  // Test 1: 500g vegetable calculation (Tomato ₹40/kg)
  runTest('500g calculation: Tomato ₹40/kg -> ₹20.00', () => {
    const res = calculateItemPrice(40, 500);
    assert.strictEqual(res.amountInRupees, 20);
    assert.strictEqual(res.weightInKg, 0.5);
  });

  // Test 2: 750g calculation: Tomato ₹40/kg -> ₹30.00
  runTest('750g calculation: Tomato ₹40/kg -> ₹30.00', () => {
    const res = calculateItemPrice(40, 750);
    assert.strictEqual(res.amountInRupees, 30);
    assert.strictEqual(res.weightInKg, 0.75);
  });

  // Test 3: 1kg calculation: Potato ₹30/kg -> ₹30.00
  runTest('1kg calculation: Potato ₹30/kg -> ₹30.00', () => {
    const res = calculateItemPrice(30, 1000);
    assert.strictEqual(res.amountInRupees, 30);
    assert.strictEqual(res.weightInKg, 1);
  });

  // Test 4: Decimal and fractional weights (1.250kg = 1250g Onion ₹50/kg -> ₹62.50)
  runTest('Decimal weights: 1250g Onion ₹50/kg -> ₹62.50', () => {
    const grams = calculateWeightInGrams(1, 250);
    assert.strictEqual(grams, 1250);
    const res = calculateItemPrice(50, grams);
    assert.strictEqual(res.amountInRupees, 62.5);
  });

  // Test 5: Multiple vegetable calculation (Prompt example: Tomato 750g ₹30 + Potato 2kg ₹60 + Onion 500g ₹25 = ₹115)
  runTest('Multiple vegetables batch calculation matches prompt grand total ₹115', () => {
    const items = [
      { pricePerKg: 40, weightInGrams: 750 },
      { pricePerKg: 30, weightInGrams: 2000 },
      { pricePerKg: 50, weightInGrams: 500 }
    ];
    const totals = calculateBillTotals(items, 0, 0, 0);
    assert.strictEqual(totals.subtotal, 115);
    assert.strictEqual(totals.grandTotal, 115);
    assert.strictEqual(totals.totalWeightGrams, 3250);
    assert.strictEqual(totals.totalWeightKg, 3.25);
  });

  // Test 6: Zero weight validation rejection
  runTest('Zero weight validation rejects with proper error', () => {
    assert.throws(
      () => calculateWeightInGrams(0, 0),
      /Total weight must be greater than zero/
    );
  });

  // Test 7: Negative weight rejection
  runTest('Negative weight rejection throws error', () => {
    assert.throws(
      () => calculateWeightInGrams(-1, 200),
      /Weight values cannot be negative/
    );
    assert.throws(
      () => calculateWeightInGrams(1, -50),
      /Weight values cannot be negative/
    );
  });

  console.log('\n--- 2. BILLING & FINANCIAL CALCULATION TESTS ---');

  // Test 8: Discount & tax calculations
  runTest('Discount & tax calculations in integer paise accuracy', () => {
    const items = [
      { pricePerKg: 100, weightInGrams: 1000 } // Subtotal ₹100
    ];
    // 10% discount on ₹100 = ₹10 discount -> ₹90 subtotal
    // 5% tax on ₹90 = ₹4.50 tax -> Grand Total ₹94.50
    const totals = calculateBillTotals(items, 10, 5, 0);
    assert.strictEqual(totals.subtotal, 100);
    assert.strictEqual(totals.discount, 10);
    assert.strictEqual(totals.tax, 4.5);
    assert.strictEqual(totals.grandTotal, 94.5);
  });

  // Test 9: Unique Invoice & Order Number Generation
  runTest('Invoice and Order number format and uniqueness', () => {
    const inv1 = generateInvoiceNumber();
    const inv2 = generateInvoiceNumber();
    const ord1 = generateOrderNumber();
    assert.ok(inv1.startsWith('GG-INV-'));
    assert.ok(ord1.startsWith('GG-ORD-'));
    assert.notStrictEqual(inv1, inv2);
  });

  console.log('\n--- 3. DATABASE INTEGRATION & MODEL TESTS ---');

  await runAsyncTest('MongoDB Connection & Schema Validation', async () => {
    const { connectDB, disconnectDB } = require('../config/db');
    const User = require('../models/User');
    const Product = require('../models/Product');

    await connectDB();

    // Verify User schema validation
    const testEmail = `test_${Date.now()}@greengrocery.com`;
    const user = await User.create({
      name: 'Integration Tester',
      email: testEmail,
      phone: '9998887776',
      password: 'password123',
      role: 'CUSTOMER'
    });
    assert.strictEqual(user.name, 'Integration Tester');

    // Password hashing check
    const fetched = await User.findById(user._id).select('+password');
    assert.notStrictEqual(fetched.password, 'password123');
    const match = await fetched.matchPassword('password123');
    assert.strictEqual(match, true);

    // Verify Product virtuals and paise sync
    const prod = await Product.create({
      name: 'Test Tomato',
      description: 'Juicy test tomato',
      category: 'Seasonal Vegetables',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      pricePerKg: 40,
      stockInGrams: 10000
    });
    assert.strictEqual(prod.pricePerKgInPaise, 4000);
    assert.strictEqual(prod.stockInKg, 10);

    // Clean up test documents
    await User.findByIdAndDelete(user._id);
    await Product.findByIdAndDelete(prod._id);

    await disconnectDB();
  });

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

startSuite();
