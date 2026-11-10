import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getMe } from './store/slices/authSlice';

// Components & Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ToastContainer from './components/common/ToastContainer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import CataloguePage from './pages/customer/CataloguePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import AccountPage from './pages/customer/AccountPage';
import CalculatorPage from './pages/customer/CalculatorPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// POS & Admin Pages
import PosBillingView from './components/pos/PosBillingView';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import InventoryAdminPage from './pages/admin/InventoryAdminPage';
import OrdersAdminPage from './pages/admin/OrdersAdminPage';
import InvoicesAdminPage from './pages/admin/InvoicesAdminPage';
import CustomersAdminPage from './pages/admin/CustomersAdminPage';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('gg_token');
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white">
      <Navbar />

      <div className="flex-1">
        <Routes>
          {/* Public Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<CataloguePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Customer Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          {/* POS Billing Route for Staff and Admin */}
          <Route
            path="/admin/pos"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <PosBillingView />
              </ProtectedRoute>
            }
          />

          {/* Admin Management Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ProductsAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <InventoryAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <OrdersAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoices"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <InvoicesAdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CustomersAdminPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="py-24 text-center">
                <h2 className="text-2xl font-black text-slate-800">Page Not Found</h2>
                <a href="/" className="text-sm font-bold text-brand-600 mt-2 inline-block">
                  Return to Home
                </a>
              </div>
            }
          />
        </Routes>
      </div>

      <Footer />
      <ToastContainer />
    </div>
  );
}
