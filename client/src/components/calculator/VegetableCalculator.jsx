import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  ShoppingCart,
  Receipt,
  Scale,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import {
  addCalculatorItem,
  updateCalculatorItem,
  removeCalculatorItem,
  setDiscountPercent,
  resetCalculator
} from '../../store/slices/calculatorSlice';
import { addLocalItem } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function VegetableCalculator({ isEmbedded = false, onSendToPos = null }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, discountPercent } = useSelector((state) => state.calculator);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [kg, setKg] = useState('0');
  const [g, setG] = useState('500');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editKg, setEditKg] = useState('0');
  const [editG, setEditG] = useState('0');

  // Fetch real products with database rates
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products?limit=100');
        if (res.data.products && res.data.products.length > 0) {
          setProducts(res.data.products);
          setSelectedProductId(res.data.products[0]._id);
        }
      } catch (err) {
        console.error('Failed to load products for calculator', err);
      }
    };
    fetchCatalog();
  }, []);

  const selectedProduct = products.find((p) => p._id === selectedProductId) || products[0];

  // Quick weight selector presets
  const quickWeightPresets = [
    { label: '100g', kg: 0, g: 100 },
    { label: '250g', kg: 0, g: 250 },
    { label: '500g', kg: 0, g: 500 },
    { label: '750g', kg: 0, g: 750 },
    { label: '1 kg', kg: 1, g: 0 },
    { label: '1.5 kg', kg: 1, g: 500 },
    { label: '2 kg', kg: 2, g: 0 }
  ];

  const handleApplyPreset = (presetKg, presetG) => {
    setKg(String(presetKg));
    setG(String(presetG));
  };

  // Live calculation preview for currently chosen item
  const previewWeightGrams = Math.round((Number(kg) || 0) * 1000) + Math.round(Number(g) || 0);
  const previewPricePaise = selectedProduct
    ? Math.round((Math.round(selectedProduct.pricePerKg * 100) * previewWeightGrams) / 1000)
    : 0;
  const previewAmount = parseFloat((previewPricePaise / 100).toFixed(2));

  // Totals of all items in transaction
  const subtotalPaise = items.reduce((sum, item) => {
    const itemPaise = Math.round(item.amount * 100);
    return sum + itemPaise;
  }, 0);
  const subtotal = parseFloat((subtotalPaise / 100).toFixed(2));

  const totalWeightGrams = items.reduce((sum, item) => sum + (item.weightInGrams || 0), 0);
  const totalWeightKg = (totalWeightGrams / 1000).toFixed(3);

  const discountPaise = Math.round((subtotalPaise * (Number(discountPercent) || 0)) / 100);
  const discountAmount = parseFloat((discountPaise / 100).toFixed(2));

  const grandTotalPaise = Math.max(0, subtotalPaise - discountPaise);
  const grandTotal = parseFloat((grandTotalPaise / 100).toFixed(2));

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const parsedKg = Math.max(0, Number(kg) || 0);
    const parsedG = Math.max(0, Number(g) || 0);
    const totalGrams = Math.round(parsedKg * 1000) + Math.round(parsedG);

    if (totalGrams <= 0) {
      dispatch(addToast({ message: 'Weight must be greater than 0g', type: 'error' }));
      return;
    }

    dispatch(
      addCalculatorItem({
        product: selectedProduct,
        kg: parsedKg,
        g: parsedG
      })
    );

    dispatch(
      addToast({
        message: `Added ${selectedProduct.name} (${(totalGrams / 1000).toFixed(3)}kg) - ₹${previewAmount}`,
        type: 'success'
      })
    );
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditKg(String(items[index].kg));
    setEditG(String(items[index].g));
  };

  const handleSaveEdit = (index) => {
    const parsedKg = Math.max(0, Number(editKg) || 0);
    const parsedG = Math.max(0, Number(editG) || 0);
    const totalGrams = Math.round(parsedKg * 1000) + Math.round(parsedG);

    if (totalGrams <= 0) {
      dispatch(addToast({ message: 'Weight must be greater than 0g', type: 'error' }));
      return;
    }

    dispatch(
      updateCalculatorItem({
        index,
        kg: parsedKg,
        g: parsedG
      })
    );
    setEditingIndex(null);
  };

  const handleAddAllToCart = () => {
    if (items.length === 0) return;

    items.forEach((item) => {
      const prod = products.find((p) => p._id === item.productId) || {
        _id: item.productId,
        name: item.name,
        pricePerKg: item.ratePerKg,
        image: ''
      };

      dispatch(
        addLocalItem({
          product: prod,
          weightInGrams: item.weightInGrams
        })
      );
    });

    dispatch(
      addToast({
        message: `${items.length} calculated item(s) added to shopping cart!`,
        type: 'success'
      })
    );
    navigate('/cart');
  };

  const handleSendToBilling = () => {
    if (items.length === 0) return;

    if (onSendToPos) {
      onSendToPos(items);
    } else {
      // Store in session storage for POS transfer and navigate
      sessionStorage.setItem('gg_pos_import', JSON.stringify(items));
      navigate('/admin/pos');
    }
  };

  return (
    <div className={`bg-white rounded-3xl border border-emerald-100 shadow-xl overflow-hidden ${isEmbedded ? '' : 'max-w-5xl mx-auto my-8'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-700 text-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-300 border border-white/20 shadow-inner">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Live Market Rate Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Vegetable Weight & Price Calculator
              </h2>
              <p className="text-xs sm:text-sm text-brand-100">
                Formula: Weight in Grams = (kg × 1000) + g | Total Price = (Rate/kg × Grams) ÷ 1000
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => dispatch(resetCalculator())}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Input Form */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            {/* Vegetable Name Selection */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Vegetable / Fruit
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} — ₹{p.pricePerKg}/kg ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Rate per KG (From DB) */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rate / kg
              </label>
              <div className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-brand-700 shadow-inner flex items-center justify-between">
                <span>₹{selectedProduct?.pricePerKg || 0}</span>
                <span className="text-[10px] text-slate-400 font-normal">Database</span>
              </div>
            </div>

            {/* Kilograms Input */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kilograms (kg)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
            </div>

            {/* Grams Input */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Grams (g)
              </label>
              <input
                type="number"
                min="0"
                max="999"
                step="50"
                value={g}
                onChange={(e) => setG(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              />
            </div>

            {/* Add Button */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Quick Weights:
            </span>
            {quickWeightPresets.map((preset) => {
              const isSelected =
                Number(kg) === preset.kg && Number(g) === preset.g;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset.kg, preset.g)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-300'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-800'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            {/* Current Item Calculation Live Pill */}
            <div className="ml-auto bg-brand-100/70 border border-brand-200 px-3.5 py-1 rounded-xl text-xs font-bold text-brand-900 flex items-center gap-2">
              <span>Item Total:</span>
              <span className="text-sm font-black text-brand-700">₹{previewAmount}</span>
              <span className="text-[11px] text-brand-600 font-medium">({previewWeightGrams}g)</span>
            </div>
          </div>
        </div>

        {/* Calculation Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <span>Items in Current Purchase</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {items.length}
              </span>
            </h3>

            {items.length > 0 && (
              <div className="text-xs font-medium text-slate-500">
                Total Net Weight: <span className="font-bold text-slate-800">{totalWeightKg} kg</span> ({totalWeightGrams}g)
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-600">No vegetables added yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select any vegetable or fruit above, pick a preset weight (e.g. 500g, 750g, 1kg) or enter custom grams, and click "Add Item".
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Vegetable / Fruit</th>
                    <th className="py-3.5 px-4 text-right">Rate / kg</th>
                    <th className="py-3.5 px-4 text-center">Weight</th>
                    <th className="py-3.5 px-4 text-right">Calculated Amount</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map((item, idx) => {
                    const isEditing = editingIndex === idx;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                          ₹{item.ratePerKg}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={editKg}
                                onChange={(e) => setEditKg(e.target.value)}
                                className="w-14 px-1.5 py-1 text-xs border rounded text-center font-bold"
                                placeholder="kg"
                              />
                              <span className="text-xs text-slate-400">kg</span>
                              <input
                                type="number"
                                min="0"
                                max="999"
                                value={editG}
                                onChange={(e) => setEditG(e.target.value)}
                                className="w-16 px-1.5 py-1 text-xs border rounded text-center font-bold"
                                placeholder="g"
                              />
                              <span className="text-xs text-slate-400">g</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/50">
                              {item.kg > 0 ? `${item.kg}kg ` : ''}
                              {item.g > 0 ? `${item.g}g` : item.kg === 0 ? '0g' : ''}
                              <span className="text-[10px] text-slate-400 ml-1">
                                ({(item.weightInGrams / 1000).toFixed(3)} kg)
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 text-base">
                          ₹{item.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isEditing ? (
                              <button
                                onClick={() => handleSaveEdit(idx)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartEdit(idx)}
                                className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                title="Edit Weight"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => dispatch(removeCalculatorItem(idx))}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bill Summary & Actions */}
        {items.length > 0 && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Discount Control */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
                Apply Discount (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => dispatch(setDiscountPercent(e.target.value))}
                className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 text-center"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="flex flex-wrap items-center gap-6 justify-end w-full md:w-auto">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Subtotal</span>
                <span className="text-lg font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="text-right">
                  <span className="text-xs text-emerald-600 block font-semibold">
                    Discount ({discountPercent}%)
                  </span>
                  <span className="text-lg font-bold text-emerald-600">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="text-right pl-4 border-l border-slate-200">
                <span className="text-xs text-brand-800 uppercase tracking-wider block font-bold">
                  Grand Total
                </span>
                <span className="text-2xl font-black text-brand-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Action Buttons */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddAllToCart}
              className="w-full sm:w-auto px-6 py-3 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-brand-600" />
              <span>Add All to Cart ({items.length})</span>
            </button>

            <button
              type="button"
              onClick={handleSendToBilling}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>Send Directly to POS Billing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
