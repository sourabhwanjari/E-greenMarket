import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Tag,
  Scale
} from 'lucide-react';
import {
  updateLocalItemWeight,
  removeLocalItem,
  clearLocalCart
} from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'FRESH10') {
      setDiscountPercent(10);
      dispatch(addToast({ message: 'Coupon FRESH10 applied! 10% discount', type: 'success' }));
    } else if (couponCode.toUpperCase() === 'ORGANIC15') {
      setDiscountPercent(15);
      dispatch(addToast({ message: 'Coupon ORGANIC15 applied! 15% discount', type: 'success' }));
    } else {
      dispatch(addToast({ message: 'Invalid coupon code. Try FRESH10', type: 'error' }));
    }
  };

  const handleWeightDelta = (productId, currentWeight, delta) => {
    const newWeight = currentWeight + delta;
    if (newWeight <= 0) {
      dispatch(removeLocalItem(productId));
      dispatch(addToast({ message: 'Item removed from cart', type: 'info' }));
    } else {
      dispatch(updateLocalItemWeight({ productId, weightInGrams: newWeight }));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeLocalItem(productId));
    dispatch(addToast({ message: 'Item removed from cart', type: 'info' }));
  };

  // Calculations
  const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
  const freeDeliveryThreshold = 500;
  const deliveryCharge = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 40;
  const grandTotal = parseFloat((subtotal - discountAmount + deliveryCharge).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Add fresh farm vegetables, fruits, or use our weight calculator to build your basket.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/shop"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            Explore Produce
          </Link>
          <Link
            to="/calculator"
            className="px-6 py-3 bg-brand-50 hover:bg-brand-100 text-brand-800 font-extrabold text-xs rounded-xl border border-brand-200 transition-all flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4 text-brand-600" />
            <span>Open Weight Calculator</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {items.length} item(s) • Total weight:{' '}
            <span className="font-bold text-slate-700">
              {(items.reduce((acc, curr) => acc + curr.weightInGrams, 0) / 1000).toFixed(3)} kg
            </span>
          </p>
        </div>

        <button
          onClick={() => dispatch(clearLocalCart())}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const pid = item.product?._id || item.product;
            return (
              <div
                key={pid}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={item.image || item.product?.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rate: <span className="font-semibold text-brand-700">₹{item.pricePerKg}/kg</span>
                    </p>
                  </div>
                </div>

                {/* Weight stepper */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => handleWeightDelta(pid, item.weightInGrams, -250)}
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      title="-250g"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 w-20 text-center">
                      {(item.weightInGrams / 1000).toFixed(3)} kg
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({item.weightInGrams}g)
                      </span>
                    </span>
                    <button
                      onClick={() => handleWeightDelta(pid, item.weightInGrams, 250)}
                      className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      title="+250g"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-base font-black text-slate-900 block">
                      ₹{item.totalPrice?.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemove(pid)}
                      className="text-[11px] font-semibold text-rose-500 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Checkout Card (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Order Summary</h2>

          {/* Coupon Input */}
          <form onSubmit={handleApplyCoupon} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Promo Code (FRESH10)"
                className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Apply
            </button>
          </form>

          {/* Free Delivery Banner Indicator */}
          {subtotal < freeDeliveryThreshold && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
              Add <span className="font-bold">₹{(freeDeliveryThreshold - subtotal).toFixed(2)}</span> more produce for <span className="font-bold">FREE Delivery</span>!
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({discountPercent}%)</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery Charges</span>
              {deliveryCharge === 0 ? (
                <span className="font-bold text-emerald-700">FREE</span>
              ) : (
                <span className="font-semibold text-slate-900">₹{deliveryCharge.toFixed(2)}</span>
              )}
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>Final Total</span>
              <span className="text-xl font-black text-brand-700">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login?redirect=/checkout');
              } else {
                navigate('/checkout');
              }
            }}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
