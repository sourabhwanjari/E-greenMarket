import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Package,
  Layers,
  ShoppingBag,
  FileText,
  Users,
  Store,
  ChevronRight
} from 'lucide-react';

export default function AdminSidebar() {
  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Analytics Dashboard' },
    { to: '/admin/pos', icon: Receipt, label: 'POS Billing Register' },
    { to: '/admin/products', icon: Package, label: 'Products Management' },
    { to: '/admin/inventory', icon: Layers, label: 'Stock & Inventory Audit' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Online Customer Orders' },
    { to: '/admin/invoices', icon: FileText, label: 'Invoices & Reports' },
    { to: '/admin/customers', icon: Users, label: 'Customer Directory' }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 p-5 flex flex-col justify-between min-h-[calc(100vh-80px)] border-r border-slate-800">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Store Management Console
          </span>
          <h2 className="text-lg font-black text-white tracking-tight">Green Grocery Ops</h2>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
        <span className="font-bold text-white block">System Status</span>
        <div className="flex items-center gap-2 text-emerald-400 text-[11px] mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>MongoDB Live • 127.0.0.1</span>
        </div>
      </div>
    </aside>
  );
}
