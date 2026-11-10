import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  Scale,
  Check,
  X
} from 'lucide-react';
import api from '../../services/api';
import { addLocalItem } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function CataloguePage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  // Modal for quick weight selection
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [weightKg, setWeightKg] = useState('0');
  const [weightG, setWeightG] = useState('500');

  useEffect(() => {
    const fetchCatalogue = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (currentCategory && currentCategory !== 'All') {
          params.append('category', currentCategory);
        }
        if (currentSearch) {
          params.append('search', currentSearch);
        }
        if (currentSort) {
          params.append('sort', currentSort);
        }
        params.append('limit', '50');

        const [prodRes, catRes] = await Promise.all([
          api.get(`/products?${params.toString()}`),
          api.get('/products/categories')
        ]);

        setProducts(prodRes.data.products || []);
        setTotalCount(prodRes.data.total || 0);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Failed to load catalogue', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogue();
  }, [currentCategory, currentSearch, currentSort]);

  const handleCategorySelect = (categoryName) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryName === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', categoryName);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (sortVal) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortVal);
    setSearchParams(newParams);
  };

  const handleQuickAddClick = (p) => {
    setSelectedProduct(p);
    setWeightKg('0');
    setWeightG('500');
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;
    const totalGrams = Math.round(Number(weightKg) * 1000) + Math.round(Number(weightG));

    if (totalGrams <= 0) {
      dispatch(addToast({ message: 'Weight must be greater than zero', type: 'error' }));
      return;
    }

    if (selectedProduct.stockInGrams < totalGrams) {
      dispatch(
        addToast({
          message: `Only ${selectedProduct.stockInKg}kg available in stock!`,
          type: 'error'
        })
      );
      return;
    }

    dispatch(
      addLocalItem({
        product: selectedProduct,
        weightInGrams: totalGrams
      })
    );

    const pricePaise = Math.round(selectedProduct.pricePerKg * 100);
    const amount = parseFloat(((pricePaise * totalGrams) / 1000 / 100).toFixed(2));

    dispatch(
      addToast({
        message: `Added ${(totalGrams / 1000).toFixed(3)}kg of ${selectedProduct.name} (₹${amount}) to cart!`,
        type: 'success'
      })
    );

    setSelectedProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Farm-Fresh Product Catalogue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore {totalCount} verified pesticide-free and organic daily harvests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters (3 Cols) */}
        <aside className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleCategorySelect('All')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  currentCategory === 'All'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Produce</span>
                <span>{categories.reduce((acc, c) => acc + c.count, 0)}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleCategorySelect(c.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    currentCategory === c.name
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{c.name}</span>
                  <span className={currentCategory === c.name ? 'text-white' : 'text-slate-400'}>
                    {c.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick link to calculator banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-brand-50 to-emerald-100/50 border border-brand-200 space-y-2">
            <div className="flex items-center gap-2 text-brand-800 font-bold text-xs">
              <Scale className="w-4 h-4 text-brand-600" />
              <span>Weight Calculator</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Need custom grams like 250g or 750g? Calculate prices for multiple vegetables in one go.
            </p>
            <Link
              to="/calculator"
              className="inline-block text-xs font-extrabold text-brand-700 hover:text-brand-900 underline"
            >
              Open Calculator →
            </Link>
          </div>
        </aside>

        {/* Product Grid & Controls (9 Cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* Sorting & Search Summary */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-900">{products.length}</span> of {totalCount} produce items
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                Sort By:
              </label>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="newest">Newest Harvest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="py-24 text-center text-slate-400">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-base font-semibold text-slate-700">No products found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => {
                const isOutOfStock = p.stockInGrams <= 0;
                return (
                  <div
                    key={p._id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/90 text-brand-800 backdrop-blur-sm">
                          {p.category}
                        </span>
                        {isOutOfStock && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                            Sold Out
                          </span>
                        )}
                      </div>

                      <Link to={`/product/${p._id}`}>
                        <h3 className="font-bold text-slate-900 text-base hover:text-brand-600 transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Rate</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-brand-700">₹{p.pricePerKg}</span>
                          <span className="text-xs text-slate-400 font-medium">/kg</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickAddClick(p)}
                        disabled={isOutOfStock}
                        className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add Weight</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* QUICK WEIGHT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedProduct.name}</h3>
                  <span className="text-xs text-brand-700 font-extrabold">₹{selectedProduct.pricePerKg}/kg</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Choose Weight Preset
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: '100g', k: '0', g: '100' },
                  { l: '250g', k: '0', g: '250' },
                  { l: '500g', k: '0', g: '500' },
                  { l: '750g', k: '0', g: '750' },
                  { l: '1 kg', k: '1', g: '0' },
                  { l: '1.5kg', k: '1', g: '500' },
                  { l: '2 kg', k: '2', g: '0' },
                  { l: '3 kg', k: '3', g: '0' }
                ].map((item) => (
                  <button
                    key={item.l}
                    type="button"
                    onClick={() => {
                      setWeightKg(item.k);
                      setWeightG(item.g);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      weightKg === item.k && weightG === item.g
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom kg & g inputs */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kilograms (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grams (g)</label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  step="50"
                  value={weightG}
                  onChange={(e) => setWeightG(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Price Preview */}
            <div className="bg-brand-50 p-3.5 rounded-xl border border-brand-200 flex items-center justify-between mb-5">
              <span className="text-xs font-bold text-brand-900">Total Calculated Price:</span>
              <span className="text-xl font-black text-brand-700">
                ₹{(((selectedProduct.pricePerKg * (Math.round(Number(weightKg) * 1000) + Math.round(Number(weightG)))) / 1000) || 0).toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConfirmAddToCart}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
