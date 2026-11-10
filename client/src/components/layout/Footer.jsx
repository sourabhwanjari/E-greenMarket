import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-900/60 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Same-Day Delivery</h4>
              <p className="text-xs text-slate-400">Within 2 hours in city</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-900/60 text-brand-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Farm Fresh</h4>
              <p className="text-xs text-slate-400">Directly from growers</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-900/60 text-brand-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Weight Calculator</h4>
              <p className="text-xs text-slate-400">Precise g & kg billing</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-900/60 text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Secure Checkout</h4>
              <p className="text-xs text-slate-400">Cash, UPI & Razorpay</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-xl">
                GG
              </div>
              <div>
                <span className="text-xl font-black text-white">GREEN GROCERY</span>
                <p className="text-xs text-brand-400 font-medium">Freshness Delivered Daily</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering consumers and vegetable retail shops with high-precision weight calculations, farm-direct produce, and integrated POS retail billing.
            </p>
            <div className="text-xs text-slate-400 space-y-1.5 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>101 Orchard Boulevard, Market Complex, Bengaluru</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@greengrocery.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop?category=Leafy Vegetables" className="hover:text-brand-400 transition-colors">Leafy Vegetables</Link></li>
              <li><Link to="/shop?category=Root Vegetables" className="hover:text-brand-400 transition-colors">Root Vegetables</Link></li>
              <li><Link to="/shop?category=Fresh Fruits" className="hover:text-brand-400 transition-colors">Fresh Fruits</Link></li>
              <li><Link to="/shop?category=Seasonal Vegetables" className="hover:text-brand-400 transition-colors">Seasonal Vegetables</Link></li>
              <li><Link to="/shop?category=Organic Products" className="hover:text-brand-400 transition-colors">Organic Produce</Link></li>
            </ul>
          </div>

          {/* Shopkeeper & POS Tools */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Features & Tools</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/calculator" className="hover:text-brand-400 transition-colors">Vegetable Weight Calculator</Link></li>
              <li><Link to="/admin/pos" className="hover:text-brand-400 transition-colors">POS Shop Billing System</Link></li>
              <li><Link to="/account" className="hover:text-brand-400 transition-colors">Order Tracking & History</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-brand-400 transition-colors">Store Admin Analytics</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Stay Fresh</h4>
            <p className="text-xs text-slate-400 mb-3">
              Subscribe to get daily morning market prices and special weekend organic basket discounts.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to Green Grocery newsletter!'); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl transition-colors uppercase tracking-wider"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Green Grocery Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Engineered with care for healthy, sustainable living</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
