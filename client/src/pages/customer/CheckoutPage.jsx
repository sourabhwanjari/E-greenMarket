import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  MapPin,
  CheckCircle2,
  Lock,
  Truck,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { clearLocalCart } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, subtotal } = useSelector((state) => state.cart);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.addresses?.[0]?.street || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.pincode || '560001');
  const [landmark, setLandmark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryCharge = subtotal >= 500 ? 0 : 40;
  const grandTotal = parseFloat((subtotal + deliveryCharge).toFixed(2));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      dispatch(addToast({ message: 'Your cart is empty', type: 'error' }));
      navigate('/cart');
      return;
    }

    if (!name.trim() || !phone.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      dispatch(addToast({ message: 'Please fill in all required delivery fields', type: 'error' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.product?._id || item.product,
          weightInGrams: item.weightInGrams
        })),
        deliveryAddress: {
          street,
          city,
          pincode,
          landmark,
          state: 'Karnataka'
        },
        paymentMethod
      };

      const res = await api.post('/orders', orderPayload);
      const createdOrder = res.data.order;

      // Clear Redux & LocalStorage cart
      dispatch(clearLocalCart());

      dispatch(
        addToast({
          message: `Order #${createdOrder.orderNumber} placed successfully!`,
          type: 'success'
        })
      );

      navigate(`/account?orderId=${createdOrder._id}`);
    } catch (err) {
      console.error('Order placement error', err);
      dispatch(
        addToast({
          message: err.response?.data?.message || 'Failed to place order',
          type: 'error'
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Secure Checkout
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Enter your delivery details to receive freshly harvested produce today.
        </p>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Delivery & Payment Info (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <MapPin className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Delivery Address</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Recipient's Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address & Flat / House No *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Flat 302, Green Orchid Apartments, 4th Main"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Club / Park"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Payment Method</h3>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-brand-700" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Cash on Delivery (COD)</h4>
                      <p className="text-xs text-slate-500">Pay cash or scan UPI upon doorstep delivery</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-brand-600"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-brand-700" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Instant UPI / QR</h4>
                      <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="text-brand-600"
                  />
                </label>

                <label
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-brand-700" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">Credit / Debit Card</h4>
                      <p className="text-xs text-slate-500">Secure online processing</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={() => setPaymentMethod('ONLINE')}
                    className="text-brand-600"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Order Basket Summary & Confirm (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="font-extrabold text-slate-900 text-base">Order Items ({items.length})</h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
              {items.map((it) => (
                <div key={it.product?._id || it.product} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-slate-900">{it.name}</h5>
                    <span className="text-slate-400">
                      {(it.weightInGrams / 1000).toFixed(3)}kg @ ₹{it.pricePerKg}/kg
                    </span>
                  </div>
                  <span className="font-black text-slate-800">₹{it.totalPrice?.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex justify-between">
                <span>Produce Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                {deliveryCharge === 0 ? (
                  <span className="font-bold text-emerald-700">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{deliveryCharge.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-2xl font-black text-brand-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Place Order • ₹{grandTotal.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
