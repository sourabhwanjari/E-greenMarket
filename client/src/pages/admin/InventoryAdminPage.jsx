import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  History,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { addToast } from '../../store/slices/uiSlice';
import { useDispatch } from 'react-redux';

export default function InventoryAdminPage() {
  const dispatch = useDispatch();
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'history'
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjType, setAdjType] = useState('RESTOCK');
  const [adjKg, setAdjKg] = useState('10');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [invRes, histRes] = await Promise.all([
        api.get('/inventory?limit=100'),
        api.get('/inventory/history?limit=50')
      ]);
      setInventory(invRes.data.inventory || []);
      setTransactions(histRes.data.transactions || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const handleOpenAdjust = (p) => {
    setSelectedProduct(p);
    setAdjType('RESTOCK');
    setAdjKg('10');
    setNotes('');
    setShowAdjustModal(true);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjKg) return;

    setIsSubmitting(true);
    try {
      const parsedGrams = Math.round(Number(adjKg) * 1000);
      const delta = adjType === 'RESTOCK' ? parsedGrams : -parsedGrams;

      await api.post('/inventory/adjust', {
        productId: selectedProduct._id,
        transactionType: adjType,
        quantityInGrams: delta,
        notes: notes || `${adjType} adjustment of ${adjKg}kg`
      });

      dispatch(
        addToast({
          message: `Stock successfully adjusted for ${selectedProduct.name}`,
          type: 'success'
        })
      );

      setShowAdjustModal(false);
      fetchInventoryData();
    } catch (err) {
      dispatch(
        addToast({
          message: err.response?.data?.message || 'Failed to adjust stock',
          type: 'error'
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Inventory & Stock Audit Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track warehouse kg/g balances, restock crates, record damages, and inspect audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'stock'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Stock ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Movement Audit History ({transactions.length})
            </button>
          </div>
        </div>

        {activeTab === 'stock' ? (
          /* Live Stock Balances Table */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Produce</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-center">Stock in Kg</th>
                    <th className="py-3.5 px-4 text-center">Stock in Grams</th>
                    <th className="py-3.5 px-4 text-center">Alert Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((p) => {
                    const isLow = p.stockStatus === 'LOW_STOCK';
                    const isOut = p.stockStatus === 'OUT_OF_STOCK';

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                            <div>
                              <span className="font-extrabold text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] text-brand-700 font-bold">₹{p.pricePerKg}/kg</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-600">{p.category}</td>
                        <td className="py-3.5 px-4 text-center font-black text-slate-900 text-sm">
                          {p.stockInKg} kg
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-600">
                          {p.stockInGrams} g
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isOut ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 justify-center">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock (&lt;3kg)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Adequate Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleOpenAdjust(p)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-bold text-xs rounded-xl transition-all"
                          >
                            Adjust / Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Movement Audit Logs Table */
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Produce</th>
                    <th className="py-3.5 px-4">Action Type</th>
                    <th className="py-3.5 px-4 text-right">Delta (g)</th>
                    <th className="py-3.5 px-4 text-center">Before → After</th>
                    <th className="py-3.5 px-4">Performer & Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const isPositive = tx.quantityInGrams > 0;
                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{tx.productName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.transactionType === 'RESTOCK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.transactionType === 'PURCHASE_POS'
                                ? 'bg-amber-100 text-amber-800'
                                : tx.transactionType === 'ONLINE_ORDER'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-black ${isPositive ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {isPositive ? `+${tx.quantityInGrams}` : tx.quantityInGrams} g
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-600">
                          {(tx.previousStock / 1000).toFixed(2)}kg → {(tx.updatedStock / 1000).toFixed(2)}kg
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-800 block">{tx.performerName || 'System'}</span>
                          <span>Ref: {tx.referenceId || 'N/A'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Adjust Inventory Stock */}
        {showAdjustModal && selectedProduct && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-in">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Adjust Produce Stock
                  </h3>
                  <p className="text-xs text-brand-700 font-bold mt-0.5">
                    {selectedProduct.name} • Current: {selectedProduct.stockInKg}kg
                  </p>
                </div>
                <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Adjustment Action</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="RESTOCK">RESTOCK (+ Add Stock from Harvest)</option>
                    <option value="DAMAGE_SPOILAGE">DAMAGE / SPOILAGE (- Deduct Wastage)</option>
                    <option value="AUDIT_CORRECTION">AUDIT CORRECTION (Manual Adjustment)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity in Kilograms (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    required
                    value={adjKg}
                    onChange={(e) => setAdjKg(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    = {Math.round(Number(adjKg) * 1000)} grams
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Audit Notes / Supplier Invoice Ref</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Fresh crate received from Mandi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-md"
                  >
                    {isSubmitting ? 'Updating...' : 'Confirm Stock Adjustment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
