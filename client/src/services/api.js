import axios from 'axios';
import { fallbackProducts, fallbackCategories } from '../utils/fallbackData';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with graceful fallback if deployed standalone on Vercel without active backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if network error or 404 on API endpoint
    const isNetworkOr404 =
      !error.response ||
      error.response.status === 404 ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED';

    const url = error.config?.url || '';

    if (isNetworkOr404) {
      // Graceful fallback for products
      if (url.includes('/products/categories')) {
        return Promise.resolve({
          data: { success: true, categories: fallbackCategories }
        });
      }

      if (url.startsWith('/products/') && !url.includes('?')) {
        const id = url.split('/products/')[1];
        const match = fallbackProducts.find((p) => p._id === id) || fallbackProducts[0];
        return Promise.resolve({
          data: { success: true, product: match }
        });
      }

      if (url.startsWith('/products')) {
        return Promise.resolve({
          data: {
            success: true,
            products: fallbackProducts,
            total: fallbackProducts.length,
            totalPages: 1
          }
        });
      }

      if (url.includes('/admin/dashboard')) {
        return Promise.resolve({
          data: {
            success: true,
            stats: {
              totalRevenue: 28450,
              todaySales: 3420,
              totalOrders: 42,
              todayOrders: 5,
              posBillsCount: 88,
              totalCustomers: 26,
              totalProducts: fallbackProducts.length,
              lowStockProducts: 2
            }
          }
        });
      }

      if (url.includes('/admin/analytics')) {
        return Promise.resolve({
          data: {
            success: true,
            dailyRevenue: [
              { day: 'Mon', totalRevenue: 3200 },
              { day: 'Tue', totalRevenue: 4100 },
              { day: 'Wed', totalRevenue: 3800 },
              { day: 'Thu', totalRevenue: 4600 },
              { day: 'Fri', totalRevenue: 5200 },
              { day: 'Sat', totalRevenue: 6400 },
              { day: 'Sun', totalRevenue: 5900 }
            ],
            topSelling: [
              { name: 'Fresh Potato (Aloo)', weightKg: 120 },
              { name: 'Red Onion (Pyaaz)', weightKg: 95 },
              { name: 'Hybrid Tomato (Tamatar)', weightKg: 85 },
              { name: 'Fresh Spinach (Palak)', weightKg: 60 }
            ],
            categoryDistribution: fallbackCategories.map((c) => ({
              category: c.name,
              count: c.count,
              totalStockKg: c.count * 25
            }))
          }
        });
      }
    }

    if (error.response && error.response.status === 401) {
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        localStorage.removeItem('gg_token');
        localStorage.removeItem('gg_user');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
