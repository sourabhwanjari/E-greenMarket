import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  Scale,
  Star,
  CheckCircle,
  Tag,
  Clock,
  Heart
} from 'lucide-react';
import api from '../../services/api';
import { addLocalItem } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function HomePage() {
  const dispatch = useDispatch();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredFruits, setFeaturedFruits] = useState([]);
  const [seasonalVegetables, setSeasonalVegetables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, fruitsRes, seasonalRes] = await Promise.all([
          api.get('/products?isFeatured=true&limit=8'),
          api.get('/products?category=Fresh Fruits&limit=4'),
          api.get('/products?category=Seasonal Vegetables&limit=4')
        ]);
        setFeaturedProducts(featRes.data.products || []);
        setFeaturedFruits(fruitsRes.data.products || []);
        setSeasonalVegetables(seasonalRes.data.products || []);
      } catch (err) {
        console.error('Error fetching home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleQuickAdd = (product, defaultGrams = 1000) => {
    dispatch(addLocalItem({ product, weightInGrams: defaultGrams }));
    dispatch(
      addToast({
        message: `Added 1kg of ${product.name} to cart!`,
        type: 'success'
      })
    );
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-mint-50/40 to-white pt-10 sm:pt-16 pb-20 border-b border-emerald-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs sm:text-sm font-bold border border-brand-200 shadow-sm animate-fade-in">
                <Leaf className="w-4 h-4 text-brand-600" />
                <span>100% Farm-Direct Harvest • Zero Preservatives</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-950 tracking-tight leading-[1.15]">
                Fresh Vegetables, <br />
                <span className="text-brand-600 underline decoration-brand-300 decoration-wavy decoration-2">
                  Delivered with Care.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Shop fresh vegetables and fruits at the best prices. Quality you can trust, freshness you can taste. From regional family farms directly to your kitchen within hours.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-brand-600/25 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/calculator"
                  className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-brand-50 text-brand-800 border-2 border-brand-200 font-extrabold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Scale className="w-4 h-4 text-brand-600" />
                  <span>Vegetable Calculator</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <span className="text-2xl font-black text-brand-800">20+</span>
                  <p className="text-xs text-slate-500 font-medium">Daily Harvests</p>
                </div>
                <div className="text-center lg:text-left">
                  <span className="text-2xl font-black text-brand-800">100%</span>
                  <p className="text-xs text-slate-500 font-medium">Precision Weighing</p>
                </div>
                <div className="text-center lg:text-left">
                  <span className="text-2xl font-black text-brand-800">4.9 ★</span>
                  <p className="text-xs text-slate-500 font-medium">Happy Shoppers</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80"
                    alt="Fresh organic grocery basket"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Metric Card 1 */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-emerald-100 flex items-center gap-3 animate-float">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Express Delivery</span>
                    <span className="text-[11px] text-slate-500">Free over ₹500</span>
                  </div>
                </div>

                {/* Floating Metric Card 2 */}
                <div className="absolute -top-4 -right-4 bg-brand-700 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span className="text-xs font-bold">Today's Fresh Picked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY QUICK EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
              Produce Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore Our Farm Aisles
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1.5"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              name: 'Leafy Vegetables',
              img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80',
              desc: 'Spinach, Mint, Coriander'
            },
            {
              name: 'Root Vegetables',
              img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80',
              desc: 'Potato, Onion, Carrot'
            },
            {
              name: 'Fresh Fruits',
              img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&auto=format&fit=crop&q=80',
              desc: 'Apples, Bananas, Oranges'
            },
            {
              name: 'Seasonal Vegetables',
              img: 'https://images.unsplash.com/photo-1597362075604-be6a88b8f2c2?w=400&auto=format&fit=crop&q=80',
              desc: 'Tomatoes, Peas, Capsicum'
            },
            {
              name: 'Organic Products',
              img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
              desc: 'Pesticide-Free Certified'
            }
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-brand-500 hover:shadow-md transition-all text-center"
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED VEGETABLES & POPULAR PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Daily Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Farm Vegetables
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>See All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/90 text-brand-800 backdrop-blur-sm shadow-sm">
                    {p.category}
                  </span>
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
                  <span className="text-xs text-slate-400 block font-medium">Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-brand-700">₹{p.pricePerKg}</span>
                    <span className="text-xs text-slate-400 font-medium">/kg</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickAdd(p, 1000)}
                  className="px-3.5 py-2 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 hover:border-brand-600 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
                >
                  + 1kg Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TODAY'S SPECIAL OFFERS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-emerald-800 to-brand-700 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Tag className="w-3.5 h-3.5 text-yellow-300" />
              Special Weekend Fresh Offer
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Farm-to-Kitchen Combo Basket at 15% Off
            </h2>
            <p className="text-sm sm:text-base text-brand-100 font-normal leading-relaxed">
              Curated bundle including 1kg Tomatoes, 2kg Potatoes, 1kg Onions, and 500g Fresh Spinach. Sourced this morning!
            </p>
            <div className="pt-2">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-brand-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-brand-50 transition-colors uppercase tracking-wider"
              >
                <span>Calculate Custom Basket</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FRESH FRUITS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
              Sweet & Juicy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Fresh Orchard Fruits
            </h2>
          </div>
          <Link
            to="/shop?category=Fresh Fruits"
            className="text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All Fruits</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredFruits.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3.5">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-brand-700">₹{p.pricePerKg}</span>
                    <span className="text-xs text-slate-400 font-medium">/kg</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(p, 1000)}
                  className="px-3.5 py-2 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 hover:border-brand-600 font-bold text-xs rounded-xl transition-all"
                >
                  + 1kg Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE GREEN GROCERY */}
      <section className="bg-brand-50/60 py-16 sm:py-20 border-y border-emerald-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
              Our Core Promise
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Why Choose Green Grocery?
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Combining traditional street-market freshness with modern precision weight calculators and retail inventory tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Direct Farm Harvest</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vegetables are harvested at sunrise and transported directly to city hubs, bypassing stale multi-day warehouse storage.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Honest Gram-Level Pricing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our advanced weight calculator guarantees exact integer paise pricing for any weight: 250g, 750g, 1.5kg, or custom weights.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">100% Quality Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If any produce does not meet your crispness standards, return it at delivery for a 100% immediate doorstep refund.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
            Community Love
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'The vegetable weight calculator is amazing! I can order 250g of ginger and 750g of tomatoes and see the exact price before buying.',
              author: 'Priya Sharma',
              role: 'Home Cook, Bengaluru'
            },
            {
              quote:
                'As a local grocery store owner, having the POS billing synced with our online inventory has saved us hours of daily manual stock auditing.',
              author: 'Rajesh Patil',
              role: 'Patil Fresh Veggies'
            },
            {
              quote:
                'The spinach and coriander arrived crisp with the morning dew still on the leaves. Unbeatable quality compared to supermarkets.',
              author: 'Dr. Ananya Rao',
              role: 'Nutritionist'
            }
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs">{t.author}</h4>
                <p className="text-[11px] text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
