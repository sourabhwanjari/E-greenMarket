import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Store,
  Sparkles
} from 'lucide-react';
import { loginUser, clearAuthError } from '../../store/slices/authSlice';
import { addToast } from '../../store/slices/uiSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const result = await dispatch(loginUser({ email, password }));
    if (!result.error) {
      dispatch(addToast({ message: 'Welcome back to Green Grocery!', type: 'success' }));
      const role = result.payload.user?.role;
      if (redirect !== '/') {
        navigate(redirect);
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (role === 'STAFF') {
        navigate('/admin/pos');
      } else {
        navigate('/shop');
      }
    }
  };

  const handleQuickFill = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    dispatch(clearAuthError());
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md shadow-brand-500/25">
            GG
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Sign In to Green Grocery
          </h2>
          <p className="text-xs text-slate-500">
            Access your orders, weight calculations, or shopkeeper POS register
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* 1-Click Demo Logins for Testing */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">
            ⚡ Quick-Fill Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@greengrocery.com', 'Admin@12345')}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:border-brand-500 text-[11px] font-bold text-slate-800 text-center transition-all shadow-sm"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('staff@greengrocery.com', 'Staff@12345')}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:border-brand-500 text-[11px] font-bold text-slate-800 text-center transition-all shadow-sm"
            >
              🏪 Cashier
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('customer@greengrocery.com', 'Customer@12345')}
              className="p-2 bg-white rounded-xl border border-slate-200 hover:border-brand-500 text-[11px] font-bold text-slate-800 text-center transition-all shadow-sm"
            >
              🛒 Customer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-brand-700 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
