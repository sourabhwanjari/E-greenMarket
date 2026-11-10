# GREEN GROCERY — Freshness Delivered Daily
### Production-Grade Full-Stack Grocery Shopping & Store Management Platform

[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-16a34a.svg)](#)
[![Backend: Node.js + Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-052e16.svg)](#)
[![Database: MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248.svg)](#)
[![State: Redux Toolkit](https://img.shields.io/badge/State-Redux%20Toolkit-764ABC.svg)](#)
[![Security: JWT + Helmet + Bcrypt](https://img.shields.io/badge/Security-JWT%20%7C%20Helmet%20%7C%20Bcrypt-black.svg)](#)

A complete, production-grade grocery ecosystem that seamlessly bridges online grocery delivery with physical retail vegetable shop operations using a single shared MongoDB database, real-time inventory tracking, authoritative weight-price calculations, and an integrated Point of Sale (POS) billing terminal.

---

## 🌟 Key Functional Pillars

### 1. Online Grocery Shopping Platform
- **Modern Farm-Fresh Homepage**: Hero section, category aisles, featured vegetables & fruits, discount bundles, and customer reviews.
- **Produce Catalogue & Filtering**: High-definition vegetable photography, price per kg, stock availability badges, search bar, and category filters (*Leafy Vegetables, Root Vegetables, Fresh Fruits, Seasonal Vegetables, Organic Products*).
- **Interactive Product Details**: Live quantity & weight selector with instant price previews.
- **Persistent Shopping Cart**: Gram-level precision adjustments (±250g steppers), subtotal calculation, discount coupon support (`FRESH10`, `ORGANIC15`), and free delivery threshold progress (free delivery over ₹500).
- **Secure Customer Checkout**: Real-time address validation, Cash on Delivery (COD), Instant UPI QR, and online card payments.
- **Account & Order Tracking Stepper**: Visual delivery timeline tracking (*PLACED $\to$ CONFIRMED $\to$ PACKED $\to$ OUT_FOR_DELIVERY $\to$ DELIVERED*), saved addresses, and past purchase receipts.

### 2. Advanced Vegetable Weight Calculator (Core Module)
- **Authoritative Mathematical Engine**:
  $$\text{weightInGrams} = (\text{kilograms} \times 1000) + \text{grams}$$
  $$\text{totalPrice} = \frac{\text{pricePerKg} \times \text{weightInGrams}}{1000}$$
- **Integer Paise Arithmetic**: Currency calculations use integer paise internally to eliminate JavaScript floating-point rounding errors.
- **Supported Weights**: One-click presets for **100g, 250g, 500g, 750g, 1kg, 1.5kg, 2kg**, plus custom kilogram & gram manual inputs.
- **Multi-Item Batch Support**: Add unlimited produce items into a single calculation table. Edit, update, delete entries, and view total transaction weight.
- **Direct Workflow Integration**: One-click transfer of calculated items directly to the customer shopping cart or directly to the physical POS billing register.

### 3. Professional POS Billing System (`/admin/pos`)
- **Dual-Pane Register**: Left pane features instantaneous produce search and category pills; right pane maintains the active customer ticket.
- **Stock Guard**: Prevents billing quantities exceeding currently available warehouse stock.
- **Change Calculation**: Real-time calculation of change to return for cash transactions.
- **Tender Options**: Support for **Cash, UPI QR, and Online Card** payments.
- **Instant Receipt Printing & PDF Export**: Native browser receipt printing support and automated PDF invoice generation with **jsPDF** and **AutoTable**.
- **Archive & Reprinting**: Search, inspect, and reprint previous POS invoices by number, date, or customer name.

### 4. Administrative Console & Analytics (`/admin/dashboard`)
- **Executive Metrics**: Total Revenue, Today's Sales, Online Orders Count, POS Bills Count, Total Catalog Items, and Low-Stock (< 3kg) alerts.
- **Interactive Visualizations (Recharts)**:
  - 7-Day Daily Revenue area charts.
  - Most purchased vegetables (weight in kg sold) bar charts.
  - Category-wise stock distribution pie charts.
- **Product Management**: Add, edit, delete produce, update per-kg pricing, and set featured status.
- **Stock Audit & Inventory Adjustment**: Real-time warehouse balance in kilograms and grams, restock entries, damage/spoilage deductions, and comprehensive movement audit history.
- **Customer Directory**: Customer order loyalty counts and lifetime spending summaries.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Framer Motion, Redux Toolkit, React Router DOM v7, Axios, Lucide React Icons |
| **Backend** | Node.js, Express.js 4, RESTful APIs, JWT Authentication, bcryptjs, Helmet, CORS, Express Rate Limit, Express Validator, Morgan |
| **Database** | MongoDB 8.x / Atlas, Mongoose ODM with Schema Validation and Virtuals |
| **PDF & Printing** | jsPDF, jsPDF-AutoTable |
| **Analytics** | Recharts Data Visualization |

---

## 📂 Project Directory Structure

```
green-grocery/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Static assets and icons
│   │   ├── components/
│   │   │   ├── admin/           # Admin widgets
│   │   │   ├── calculator/      # VegetableCalculator.jsx
│   │   │   ├── common/          # ToastContainer, ProtectedRoute, etc.
│   │   │   ├── layout/          # Navbar, Footer, AdminSidebar
│   │   │   └── pos/             # PosBillingView.jsx (POS Terminal)
│   │   ├── pages/
│   │   │   ├── admin/           # Dashboard, Products, Inventory, Orders, Invoices, Customers
│   │   │   ├── auth/            # LoginPage, RegisterPage
│   │   │   └── customer/        # HomePage, CataloguePage, ProductDetailPage, CartPage, CheckoutPage, AccountPage, CalculatorPage
│   │   ├── services/            # Axios API client with JWT interceptor
│   │   ├── store/               # Redux store, authSlice, cartSlice, calculatorSlice, uiSlice
│   │   ├── styles/              # Tailwind CSS index.css
│   │   ├── App.jsx              # Application router & layout
│   │   └── main.jsx             # React DOM root
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/                  # db.js (MongoDB connection & transaction helper)
│   ├── controllers/             # auth, product, cart, order, billing, inventory, admin, payment
│   ├── middleware/              # auth.js (JWT protect & RBAC), validate.js, errorHandler.js
│   ├── models/                  # User, Product, Category, Cart, Order, Invoice, InventoryTransaction
│   ├── routes/                  # REST API route handlers
│   ├── tests/                   # run-tests.js (Automated test runner)
│   ├── utils/                   # weightCalculator, invoiceGenerator, seed.js
│   ├── validators/              # express-validator schemas
│   ├── app.js                   # Express app configuration & static server
│   ├── server.js                # Server entry point
│   ├── package.json
│   ├── .env                     # Active environment variables
│   └── .env.example             # Template environment variables
│
├── .gitignore
├── package.json                 # Monorepo root scripts
└── README.md
```

---

## 🔑 Default Credentials (Seed Data)

The system includes pre-configured demo users across all roles:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Super Admin** | `admin@greengrocery.com` | `Admin@12345` | Full administrative access, analytics, products, inventory, orders, invoices, and customers |
| **Cashier / Staff** | `staff@greengrocery.com` | `Staff@12345` | POS Billing Terminal (`/admin/pos`), inventory adjustments, and order processing |
| **Customer** | `customer@greengrocery.com` | `Customer@12345` | Catalogue browsing, weight calculator, shopping cart, checkout, and order tracking |

*(Quick-fill 1-click buttons are also provided on the Login page for convenient testing)*

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local daemon or MongoDB Atlas URI)

### 2. Clone & Install Dependencies
```bash
# Navigate to project folder
cd green-grocery

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration
Check `server/.env` (or copy from `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/green_grocery
JWT_SECRET=green_grocery_production_secret_key_98234871928374
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 4. Seed Initial Grocery Products & Users
```bash
cd green-grocery/server
npm run seed
```
This populates 19 fresh vegetables and fruits across 5 categories with high-definition imagery, verified pricing (₹/kg), initial inventory balances, and sample transactions.

### 5. Run Automated Tests
```bash
cd green-grocery/server
npm test
```
Executes the comprehensive test suite verifying:
- 500g, 750g, 1kg vegetable calculations
- Decimal weight calculations & batch totals
- Zero weight and negative weight input rejection
- Integer paise financial accuracy
- Unique Invoice (`GG-INV-`) and Order (`GG-ORD-`) IDs
- MongoDB schema validation and bcrypt password hashing

### 6. Start Development Servers
**Terminal 1 (Backend API):**
```bash
cd green-grocery/server
npm start
# Server listens on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd green-grocery/client
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🌐 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register customer
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Current user profile
- `PUT /api/auth/profile` - Update profile & addresses

### Products (`/api/products`)
- `GET /api/products` - List products (filters: category, search, sort, pagination)
- `GET /api/products/categories` - Category counts
- `GET /api/products/:id` - Single product details
- `POST /api/products` - Create produce *(Admin)*
- `PUT /api/products/:id` - Update produce *(Admin)*
- `DELETE /api/products/:id` - Delete produce *(Admin)*

### Vegetable Cart (`/api/cart`)
- `GET /api/cart` - User's active shopping cart
- `POST /api/cart` - Add item with weight in grams
- `PUT /api/cart/:itemId` - Update item weight in grams
- `DELETE /api/cart/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### POS Billing (`/api/billing`)
- `POST /api/billing` - Create POS bill, atomically decrement inventory, generate invoice *(Staff/Admin)*
- `GET /api/billing` - List all previous invoices (search, date range, pagination)
- `GET /api/billing/:id` - Single invoice details

### Inventory (`/api/inventory`)
- `GET /api/inventory` - Live warehouse stock in kg/g with low-stock alerts *(Staff/Admin)*
- `POST /api/inventory/adjust` - Restock, damage, or audit adjustments *(Staff/Admin)*
- `GET /api/inventory/history` - Stock movement audit log *(Staff/Admin)*

### Orders (`/api/orders`)
- `POST /api/orders` - Place online order (validates stock, deducts inventory, clears cart)
- `GET /api/orders/my` - Customer order history
- `GET /api/orders/:id` - Single order tracking
- `GET /api/orders` - All store orders *(Staff/Admin)*
- `PATCH /api/orders/:id/status` - Update delivery status *(Staff/Admin)*

### Admin Analytics (`/api/admin`)
- `GET /api/admin/dashboard` - Executive stats (revenue, sales, orders, products, low stock)
- `GET /api/admin/analytics` - Daily revenue, top-selling vegetables, category distributions
- `GET /api/admin/customers` - Customer directory with spending metrics
- `GET /api/admin/sales` - Tender type revenue breakdown

---

## 🚢 Production Deployment

### Frontend (Vercel)
1. Link the `green-grocery/client` directory to Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variable: `VITE_API_BASE_URL` pointing to the deployed backend URL.

### Backend (Render / Railway)
1. Link the `green-grocery/server` directory.
2. Build command: `npm install`
3. Start command: `node server.js`
4. Set environment variables:
   - `NODE_ENV=production`
   - `MONGO_URI=<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET=<secure-random-secret>`
   - `CLIENT_URL=<your-vercel-domain>`

### Unified Single-Service Deployment
The backend Express app includes built-in static serving for `client/dist`. When building the client into `dist`, running `npm start` in the server serves both the REST API and the production React frontend on port 5000.

---

## 📄 License
This project is licensed under the MIT License.
