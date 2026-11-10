import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShoppingBag,
  Calculator,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  ReceiptText,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartCount = cartItems.length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast({ message: 'Logged out successfully', type: 'info' }));
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      {/* Top Banner */}
      <div className="bg-brand-800 text-brand-100 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
        <span>Fresh Morning Harvest Delivered to Your Doorstep | Free Delivery over ₹500!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-2xl font-black tracking-tighter">GG</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-brand-900 tracking-tight leading-none">
                GREEN <span className="text-brand-600">GROCERY</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">
                Freshness Delivered Daily
              </span>
            </div>
          </Link>

          {/* Search bar (desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search farm-fresh vegetables, fruits, leafy greens..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link
              to="/shop"
              className="hover:text-brand-600 transition-colors py-1"
            >
              Shop Produce
            </Link>
            <Link
              to="/calculator"
              className="flex items-center gap-1.5 text-brand-700 bg-brand-50 px-3.5 py-1.5 rounded-full hover:bg-brand-100 transition-colors border border-brand-200/60"
            >
              <Calculator className="w-4 h-4 text-brand-600" />
              <span>Weight Calculator</span>
            </Link>

            {/* Staff / Admin Quick Links */}
            {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
              <Link
                to="/admin/pos"
                className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors border border-amber-200"
              >
                <ReceiptText className="w-4 h-4 text-amber-600" />
                <span>POS Billing</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 text-slate-700 hover:text-brand-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* User actions & Cart */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 transition-all flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-brand-900 text-sm font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm animate-scale-in"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-brand-100 text-brand-800">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/account"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Account & Orders</span>
                    </Link>

                    {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
                      <Link
                        to="/admin/pos"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ReceiptText className="w-4 h-4 text-slate-400" />
                        <span>POS Billing System</span>
                      </Link>
                    )}

                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 flex flex-col gap-3">
            <form onSubmit={handleSearch} className="flex items-center relative mb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vegetables & fruits..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            </form>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
            >
              Shop Produce
            </Link>
            <Link
              to="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg font-medium text-brand-700 bg-brand-50 flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Weight Calculator
            </Link>
            {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
              <Link
                to="/admin/pos"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg font-medium text-amber-800 bg-amber-50 flex items-center gap-2"
              >
                <ReceiptText className="w-4 h-4" />
                POS Billing Terminal
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
