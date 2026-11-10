import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  X
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { addToast } from '../../store/slices/uiSlice';
import { useDispatch } from 'react-redux';

export default function OrdersAdminPage() {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/orders?${params.toString()}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      dispatch(addToast({ message: `Order status updated to ${newStatus}`, type: 'success' }));
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err) {
      dispatch(addToast({ message: 'Failed to update order status', type: 'error' }));
    }
  };

  const statuses = [
    'ALL',
    'PLACED',
    'CONFIRMED',
    'PACKED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Online Customer Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming grocery requests, update delivery steps, and manage order fulfillment.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
              placeholder="Search by order# or customer name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === st ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items / Weight</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Change Status</th>
                  <th className="py-3.5 px-4 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {ord.orderNumber}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{ord.customerDetails?.name}</span>
                      <span className="text-[11px] text-slate-500">{ord.customerDetails?.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">
                        {ord.items.length} items ({(ord.items.reduce((acc, i) => acc + i.weightInGrams, 0) / 1000).toFixed(2)}kg)
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                        {ord.items.map((i) => i.name).join(', ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      ₹{ord.grandTotal.toFixed(2)}
                      <span className="text-[10px] text-slate-400 block font-normal uppercase">
                        {ord.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-brand-50 text-brand-700'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PACKED">PACKED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED (RESTOCK)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: Order Details Viewer */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-in max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </span>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Recipient */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Customer & Delivery</span>
                  <p className="font-bold text-slate-900">{selectedOrder.customerDetails?.name} ({selectedOrder.customerDetails?.phone})</p>
                  <p className="text-slate-600">{selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city} - {selectedOrder.deliveryAddress?.pincode}</p>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Items in Order</span>
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{it.name}</span>
                        <span className="text-slate-500 block">{(it.weightInGrams / 1000).toFixed(3)}kg @ ₹{it.pricePerKg}/kg</span>
                      </div>
                      <span className="font-black text-slate-900">₹{it.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing summary */}
                <div className="pt-3 border-t border-slate-200 space-y-1 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200 text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-brand-700">₹{selectedOrder.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
