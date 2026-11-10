import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Receipt,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';
import AdminSidebar from '../../components/layout/AdminSidebar';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/analytics')
        ]);
        setStats(statsRes.data.stats);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const COLORS = ['#16a34a', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Executive Business Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time sales, inventory movement, and online order metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/pos"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>Launch POS Register</span>
            </Link>
          </div>
        </div>

        {/* 6 TOP STAT METRIC CARDS */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading business statistics...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Total Revenue */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>POS + Online</span>
              </span>
            </div>

            {/* 2. Today's Sales */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Today's Sales
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-brand-700">
                  ₹{stats?.todaySales?.toLocaleString('en-IN') || 0}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Live Today</span>
            </div>

            {/* 3. Total Orders */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Online Orders
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {stats?.totalOrders || 0}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {stats?.todayOrders || 0} placed today
              </span>
            </div>

            {/* 4. POS Bills */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Store Invoices
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {stats?.posBillsCount || 0}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Walk-in bills</span>
            </div>

            {/* 5. Total Products */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Catalog Items
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">
                  {stats?.totalProducts || 0}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Active produce</span>
            </div>

            {/* 6. Low Stock Alert */}
            <div className="bg-white p-5 rounded-3xl border border-rose-200 bg-rose-50/20 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                Low Stock Alert
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-rose-700">
                  {stats?.lowStockProducts || 0}
                </span>
              </div>
              <span className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Below 3kg threshold</span>
              </span>
            </div>
          </div>
        )}

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Daily Revenue Area Chart (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Daily Revenue Trajectory (Last 7 Days)
                </h3>
                <p className="text-xs text-slate-400">Total daily earnings from POS and online orders</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700">
                ₹ Revenue / Day
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              {analytics?.dailyRevenue && analytics.dailyRevenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyRevenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      formatter={(val) => [`₹${val}`, 'Daily Revenue']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="#16a34a"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Awaiting first sales transactions
                </div>
              )}
            </div>
          </div>

          {/* Top Selling Produce Bar Chart (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Most Purchased Vegetables
                </h3>
                <p className="text-xs text-slate-400">Weight sold in kilograms</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              {analytics?.topSelling && analytics.topSelling.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topSelling}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split(' ')[0]} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      formatter={(val) => [`${val} kg`, 'Weight Sold']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                    />
                    <Bar dataKey="weightKg" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No sales recorded yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Category Distribution & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Category Distribution (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Produce Category Distribution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-56">
                {analytics?.categoryDistribution && analytics.categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryDistribution}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                      >
                        {analytics.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : null}
              </div>

              <div className="space-y-2">
                {analytics?.categoryDistribution?.map((cat, idx) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-bold text-slate-700">{cat.category}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">{cat.count} items ({cat.totalStockKg}kg)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Management Shortcuts (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Quick Administrative Actions
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/products"
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left"
              >
                <Package className="w-5 h-5 text-brand-600 mb-2" />
                <h4 className="font-extrabold text-slate-900 text-xs">Manage Products</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Add, edit rates & stock</p>
              </Link>

              <Link
                to="/admin/inventory"
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left"
              >
                <Layers className="w-5 h-5 text-brand-600 mb-2" />
                <h4 className="font-extrabold text-slate-900 text-xs">Audit Inventory</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Restock & track delta</p>
              </Link>

              <Link
                to="/admin/orders"
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left"
              >
                <ShoppingBag className="w-5 h-5 text-brand-600 mb-2" />
                <h4 className="font-extrabold text-slate-900 text-xs">Customer Orders</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Fulfill & update tracking</p>
              </Link>

              <Link
                to="/admin/invoices"
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left"
              >
                <Receipt className="w-5 h-5 text-brand-600 mb-2" />
                <h4 className="font-extrabold text-slate-900 text-xs">POS Receipts & PDFs</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Search, print & download</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
