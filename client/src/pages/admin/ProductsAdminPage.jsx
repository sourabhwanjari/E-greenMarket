import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  Package,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { addToast } from '../../store/slices/uiSlice';
import { useDispatch } from 'react-redux';

export default function ProductsAdminPage() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Leafy Vegetables');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [stockKg, setStockKg] = useState('20');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Leafy Vegetables',
    'Root Vegetables',
    'Fresh Fruits',
    'Seasonal Vegetables',
    'Organic Products'
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products?limit=100');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Leafy Vegetables');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
    setPricePerKg('50');
    setStockKg('25');
    setIsFeatured(false);
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description || '');
    setImage(p.image);
    setPricePerKg(String(p.pricePerKg));
    setStockKg(String((p.stockInGrams / 1000).toFixed(2)));
    setIsFeatured(Boolean(p.isFeatured));
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!name || !pricePerKg || !image) {
      dispatch(addToast({ message: 'Name, price, and image are required', type: 'error' }));
      return;
    }

    setIsSubmitting(true);
    try {
      const stockInGrams = Math.round(Number(stockKg) * 1000);
      const payload = {
        name,
        category,
        description,
        image,
        pricePerKg: Number(pricePerKg),
        stockInGrams,
        isFeatured
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        dispatch(addToast({ message: `Updated ${name} successfully`, type: 'success' }));
      } else {
        await api.post('/products', payload);
        dispatch(addToast({ message: `Created new product ${name}`, type: 'success' }));
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      dispatch(addToast({ message: err.response?.data?.message || 'Failed to save product', type: 'error' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, prodName) => {
    if (!window.confirm(`Are you sure you want to delete ${prodName}?`)) return;
    try {
      await api.delete(`/products/${id}`);
      dispatch(addToast({ message: `Deleted ${prodName}`, type: 'info' }));
      fetchProducts();
    } catch (err) {
      dispatch(addToast({ message: 'Failed to delete product', type: 'error' }));
    }
  };

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Product Catalogue Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add new produce, update per-kg pricing, adjust inventory stock and catalog status.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Vegetable / Fruit</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                selectedCategory === 'All' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              All ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
                  selectedCategory === c ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Produce</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Price / kg</th>
                  <th className="py-3.5 px-4 text-center">Current Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const isLow = p.stockInGrams <= 3000 && p.stockInGrams > 0;
                  const isOut = p.stockInGrams <= 0;

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
                            {p.isFeatured && (
                              <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{p.category}</td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                        ₹{p.pricePerKg}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800">
                          {p.stockInKg} kg
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          ({p.stockInGrams}g)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
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
        </div>

        {/* MODAL: Add / Edit Product */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-in my-8">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">
                  {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Produce to Catalog'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Produce Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fresh Spinach (Palak)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Price Per Kg (₹) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Stock in Kg</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={stockKg}
                      onChange={(e) => setStockKg(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded text-brand-600"
                      />
                      <span className="font-bold text-slate-700">Feature on Homepage</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Image URL (Unsplash or Cloudinary) *</label>
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description of taste, health benefits or farm origin..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-md"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Produce'}
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
