import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ShoppingBag,
  Scale,
  ShieldCheck,
  Truck,
  Leaf,
  ChevronLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { addLocalItem } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kg, setKg] = useState('1');
  const [g, setG] = useState('0');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-900">Product not found</h2>
        <Link to="/shop" className="text-sm font-bold text-brand-600 mt-2 inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  const weightInGrams = Math.round(Number(kg) * 1000) + Math.round(Number(g));
  const pricePaise = Math.round(product.pricePerKg * 100);
  const amountPaise = Math.round((pricePaise * weightInGrams) / 1000);
  const calculatedPrice = parseFloat((amountPaise / 100).toFixed(2));

  const handleAddToCart = () => {
    if (weightInGrams <= 0) {
      dispatch(addToast({ message: 'Weight must be greater than zero', type: 'error' }));
      return;
    }

    if (product.stockInGrams < weightInGrams) {
      dispatch(
        addToast({
          message: `Only ${product.stockInKg}kg available in stock!`,
          type: 'error'
        })
      );
      return;
    }

    dispatch(
      addLocalItem({
        product,
        weightInGrams
      })
    );

    dispatch(
      addToast({
        message: `Added ${(weightInGrams / 1000).toFixed(3)}kg of ${product.name} (₹${calculatedPrice}) to cart!`,
        type: 'success'
      })
    );
  };

  const isOutOfStock = product.stockInGrams <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Produce</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Product Image (5 cols) */}
        <div className="lg:col-span-5">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-lg">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info & Weight Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-100 text-brand-800">
                {product.category}
              </span>
              {product.isFeatured && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured Harvest
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pricing & Stock Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
                Price Per Kilogram
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-brand-700">₹{product.pricePerKg}</span>
                <span className="text-sm text-slate-500 font-medium">/kg</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
                Availability
              </span>
              {isOutOfStock ? (
                <span className="text-sm font-extrabold text-rose-600">Out of Stock</span>
              ) : (
                <span className="text-sm font-extrabold text-emerald-700">
                  In Stock ({product.stockInKg} kg)
                </span>
              )}
            </div>
          </div>

          {/* Precision Weight Selector */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Select Weight
            </span>

            {/* Quick Weight presets */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[
                { l: '250g', k: '0', g: '250' },
                { l: '500g', k: '0', g: '500' },
                { l: '750g', k: '0', g: '750' },
                { l: '1 kg', k: '1', g: '0' },
                { l: '1.5 kg', k: '1', g: '500' },
                { l: '2 kg', k: '2', g: '0' },
                { l: '3 kg', k: '3', g: '0' }
              ].map((item) => (
                <button
                  key={item.l}
                  type="button"
                  onClick={() => {
                    setKg(item.k);
                    setG(item.g);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    kg === item.k && g === item.g
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.l}
                </button>
              ))}
            </div>

            {/* Manual Kilogram and Grams Inputs */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Kilograms (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={kg}
                  onChange={(e) => setKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Grams (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  step="50"
                  value={g}
                  onChange={(e) => setG(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 text-center"
                />
              </div>
            </div>
          </div>

          {/* Calculated Total Bar & Add Button */}
          <div className="bg-brand-50 p-5 rounded-2xl border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-brand-900 font-bold block">
                Total for {(weightInGrams / 1000).toFixed(3)} kg ({weightInGrams}g):
              </span>
              <span className="text-3xl font-black text-brand-700">₹{calculatedPrice}</span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-brand-600" />
              <div>
                <h5 className="font-bold text-xs text-slate-900">Morning Express Delivery</h5>
                <p className="text-[11px] text-slate-400">Arrives crisp within hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <div>
                <h5 className="font-bold text-xs text-slate-900">Doorstep Return</h5>
                <p className="text-[11px] text-slate-400">100% money back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
