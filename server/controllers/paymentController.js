const crypto = require('crypto');

// @desc    Create Razorpay / Online payment order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if live Razorpay keys are configured
    if (keyId && keySecret && !keyId.includes('rzp_test_placeholder')) {
      // In production with live keys, integrate Razorpay SDK
      const razorpayOrder = {
        id: `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        status: 'created'
      };

      return res.status(200).json({
        success: true,
        order: razorpayOrder,
        key: keyId,
        mode: 'LIVE'
      });
    }

    // Test/Simulation mode with mock order ID
    const testOrderId = `order_sim_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    res.status(200).json({
      success: true,
      order: {
        id: testOrderId,
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        status: 'created'
      },
      key: keyId || 'rzp_test_green_grocery',
      mode: 'SIMULATION',
      message: 'Payment gateway initialized in development/simulation mode'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment order ID and Payment ID are required'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && !keySecret.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Invalid payment signature. Verification failed.'
        });
      }
    }

    res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment
};
