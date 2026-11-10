import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  ChevronRight,
  ShieldAlert,
  Calendar,
  CreditCard
} from 'lucide-react';
import api from '../../services/api';
import { addToast } from '../../store/slices/uiSlice';

export default function AccountPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get('orderId');

  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await api.get('/orders/my');
        const list = res.data.orders || [];
        setOrders(list);

        if (highlightOrderId) {
          const match = list.find((o) => o._id === highlightOrderId);
          if (match) setSelectedOrder(match);
        } else if (list.length > 0) {
          setSelectedOrder(list[0]);
        }
      } catch (err) {
        console.error('Error fetching orders', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [highlightOrderId]);

  // Order Stepper Status logic
  const orderSteps = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed by Store' },
    { key: 'PACKED', label: 'Packed Fresh' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const getStepIndex = (status) => {
    if (status === 'CANCELLED') return -1;
    return orderSteps.findIndex((s) => s.key === status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Customer Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="font-bold text-slate-800">{user?.name}</span> ({user?.email})
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile & Saved Addresses
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Purchase History
            </h3>

            {loadingOrders ? (
              <div className="py-16 text-center text-slate-400">Loading your orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No orders placed yet</p>
              </div>
            ) : (
              orders.map((ord) => {
                const isSelected = selectedOrder?._id === ord._id;
                return (
                  <button
                    key={ord._id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`w-full text-left p-4 rounded-3xl border transition-all ${
                      isSelected
                        ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-200'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-brand-50 text-brand-700'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                      <span className="font-black text-slate-900 text-sm">₹{ord.grandTotal.toFixed(2)}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 truncate">
                      {ord.items.map((i) => `${i.name} (${(i.weightInGrams / 1000).toFixed(2)}kg)`).join(', ')}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Order Tracking & Details (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            {selectedOrder ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
                      Live Order Tracking
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Grand Total</span>
                    <span className="text-2xl font-black text-brand-700">
                      ₹{selectedOrder.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* TRACKING TIMELINE STEPPER */}
                {selectedOrder.orderStatus !== 'CANCELLED' ? (
                  <div className="py-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                      Delivery Progress
                    </h4>
                    <div className="relative flex items-center justify-between">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                      {orderSteps.map((step, idx) => {
                        const currentIdx = getStepIndex(selectedOrder.orderStatus);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div
                            key={step.key}
                            className="relative z-10 flex flex-col items-center text-center space-y-2"
                          >
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                isDone
                                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-4 ring-brand-100'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-[11px] font-bold max-w-[80px] leading-tight ${
                                isCurrent
                                  ? 'text-brand-700'
                                  : isDone
                                  ? 'text-slate-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-bold">This order was cancelled and inventory has been restocked.</span>
                  </div>
                )}

                {/* Produce Items Breakdown */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Purchased Produce
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between text-xs"
                      >
                        <div>
                          <h5 className="font-bold text-slate-900">{it.name}</h5>
                          <span className="text-slate-500">
                            {(it.weightInGrams / 1000).toFixed(3)}kg @ ₹{it.pricePerKg}/kg
                          </span>
                        </div>
                        <span className="font-black text-slate-900 text-sm">₹{it.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Payment details footer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">
                      Delivery Address
                    </span>
                    <p className="font-semibold text-slate-800">
                      {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.pincode}
                    </p>
                    <p className="text-slate-500">Recipient: {selectedOrder.customerDetails.name} ({selectedOrder.customerDetails.phone})</p>
                  </div>

                  <div className="space-y-1 text-left sm:text-right">
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">
                      Payment Details
                    </span>
                    <p className="font-semibold text-slate-800">
                      Method: <span className="font-bold">{selectedOrder.paymentMethod}</span>
                    </p>
                    <p className="text-slate-500">Status: <span className="font-bold text-emerald-700">{selectedOrder.paymentStatus}</span></p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400">
                Select an order on the left to track progress and view invoice details.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Profile & Saved Address Tab */
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-brand-700 text-white flex items-center justify-center text-2xl font-black">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email} • {user?.phone}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-800 uppercase">
                {user?.role} Account
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saved Delivery Addresses
            </h4>
            {user?.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <span>Primary Home Address</span>
                  </div>
                  <p className="text-slate-600">{addr.street}</p>
                  <p className="text-slate-600">{addr.city}, Karnataka - {addr.pincode}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No saved address yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
