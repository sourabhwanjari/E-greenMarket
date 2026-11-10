import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  Download,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  History,
  RotateCcw,
  Sparkles,
  Receipt,
  User,
  Phone,
  Scale
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../services/api';
import { addToast } from '../../store/slices/uiSlice';

export default function PosBillingView() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Products and Category State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Current Transaction / Cart State
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountReceived, setAmountReceived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoice & Print State
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [invoicesHistory, setInvoicesHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');

  // Weight entry modal for product click
  const [activeProductForWeight, setActiveProductForWeight] = useState(null);
  const [weightKg, setWeightKg] = useState('0');
  const [weightG, setWeightG] = useState('500');

  // Load products & categories from server
  const loadInventory = async () => {
    try {
      setLoadingProducts(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/products/categories')
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
      dispatch(addToast({ message: 'Failed to load inventory catalog', type: 'error' }));
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadInventory();

    // Check if items were transferred from calculator
    const imported = sessionStorage.getItem('gg_pos_import');
    if (imported) {
      try {
        const parsed = JSON.parse(imported);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const transformed = parsed.map((item) => ({
            productId: item.productId,
            name: item.name,
            ratePerKg: item.ratePerKg,
            weightInGrams: item.weightInGrams,
            amount: item.amount
          }));
          setCartItems(transformed);
          sessionStorage.removeItem('gg_pos_import');
          dispatch(
            addToast({
              message: `Imported ${transformed.length} calculated items into POS bill!`,
              type: 'success'
            })
          );
        }
      } catch (e) {
        console.error('Error importing items to POS', e);
      }
    }
  }, []);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Open quick weight modal for product
  const handleProductClick = (product) => {
    if (product.stockInGrams <= 0) {
      dispatch(addToast({ message: `${product.name} is currently out of stock!`, type: 'error' }));
      return;
    }
    setActiveProductForWeight(product);
    setWeightKg('0');
    setWeightG('500');
  };

  // Add selected weight to transaction
  const handleConfirmWeightAdd = () => {
    if (!activeProductForWeight) return;

    const totalGrams = Math.round(Number(weightKg) * 1000) + Math.round(Number(weightG));
    if (totalGrams <= 0) {
      dispatch(addToast({ message: 'Weight must be greater than zero', type: 'error' }));
      return;
    }

    if (activeProductForWeight.stockInGrams < totalGrams) {
      dispatch(
        addToast({
          message: `Only ${activeProductForWeight.stockInKg}kg available in stock!`,
          type: 'error'
        })
      );
      return;
    }

    const pricePaise = Math.round(activeProductForWeight.pricePerKg * 100);
    const amountPaise = Math.round((pricePaise * totalGrams) / 1000);
    const amount = parseFloat((amountPaise / 100).toFixed(2));

    const existingIdx = cartItems.findIndex(
      (item) => item.productId === activeProductForWeight._id
    );

    if (existingIdx > -1) {
      const newWeight = cartItems[existingIdx].weightInGrams + totalGrams;
      if (activeProductForWeight.stockInGrams < newWeight) {
        dispatch(
          addToast({
            message: `Total requested (${(newWeight / 1000).toFixed(2)}kg) exceeds stock!`,
            type: 'error'
          })
        );
        return;
      }
      const newAmountPaise = Math.round((pricePaise * newWeight) / 1000);
      const updated = [...cartItems];
      updated[existingIdx].weightInGrams = newWeight;
      updated[existingIdx].amount = parseFloat((newAmountPaise / 100).toFixed(2));
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: activeProductForWeight._id,
          name: activeProductForWeight.name,
          ratePerKg: activeProductForWeight.pricePerKg,
          weightInGrams: totalGrams,
          amount
        }
      ]);
    }

    setActiveProductForWeight(null);
  };

  // Adjust item weight directly in cart
  const handleUpdateItemWeight = (index, deltaGrams) => {
    const item = cartItems[index];
    const product = products.find((p) => p._id === item.productId);
    const newWeight = item.weightInGrams + deltaGrams;

    if (newWeight <= 0) {
      handleRemoveItem(index);
      return;
    }

    if (product && product.stockInGrams < newWeight) {
      dispatch(addToast({ message: `Cannot exceed available stock of ${product.stockInKg}kg`, type: 'error' }));
      return;
    }

    const pricePaise = Math.round(item.ratePerKg * 100);
    const amountPaise = Math.round((pricePaise * newWeight) / 1000);

    const updated = [...cartItems];
    updated[index].weightInGrams = newWeight;
    updated[index].amount = parseFloat((amountPaise / 100).toFixed(2));
    setCartItems(updated);
  };

  const handleRemoveItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Calculate bill totals
  const subtotalPaise = cartItems.reduce((acc, curr) => acc + Math.round(curr.amount * 100), 0);
  const subtotal = parseFloat((subtotalPaise / 100).toFixed(2));

  const discountPaise = Math.round((subtotalPaise * (Number(discountPercent) || 0)) / 100);
  const discountAmount = parseFloat((discountPaise / 100).toFixed(2));

  const discountedSubtotalPaise = Math.max(0, subtotalPaise - discountPaise);
  const taxPaise = Math.round((discountedSubtotalPaise * (Number(taxPercent) || 0)) / 100);
  const taxAmount = parseFloat((taxPaise / 100).toFixed(2));

  const grandTotalPaise = discountedSubtotalPaise + taxPaise;
  const grandTotal = parseFloat((grandTotalPaise / 100).toFixed(2));

  const parsedReceived = Number(amountReceived) || 0;
  const changeReturned =
    paymentMethod === 'CASH' && parsedReceived >= grandTotal
      ? parseFloat((parsedReceived - grandTotal).toFixed(2))
      : 0;

  // Process and save invoice in backend
  const handleCheckoutAndGenerateBill = async () => {
    if (cartItems.length === 0) {
      dispatch(addToast({ message: 'No items in cart to bill', type: 'error' }));
      return;
    }

    if (paymentMethod === 'CASH' && parsedReceived > 0 && parsedReceived < grandTotal) {
      dispatch(
        addToast({
          message: `Amount received (₹${parsedReceived}) is less than grand total (₹${grandTotal})`,
          type: 'error'
        })
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerDetails: {
          name: customerName || 'Walk-in Customer',
          phone: customerPhone || ''
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          weightInGrams: item.weightInGrams
        })),
        discountPercent: Number(discountPercent) || 0,
        taxPercent: Number(taxPercent) || 0,
        paymentMethod,
        amountReceived: paymentMethod === 'CASH' ? (parsedReceived || grandTotal) : grandTotal
      };

      const res = await api.post('/billing', payload);
      const invoice = res.data.invoice;

      setLastCreatedInvoice(invoice);
      setShowInvoiceModal(true);

      // Refresh inventory to show updated stock
      await loadInventory();

      // Clear bill draft
      setCartItems([]);
      setAmountReceived('');
      setCustomerName('Walk-in Customer');
      setCustomerPhone('');
      setDiscountPercent(0);

      dispatch(
        addToast({
          message: `Invoice #${invoice.invoiceNumber} created & inventory updated!`,
          type: 'success'
        })
      );
    } catch (err) {
      console.error('Billing error', err);
      dispatch(
        addToast({
          message: err.response?.data?.message || 'Failed to create bill',
          type: 'error'
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate and download PDF Invoice with jsPDF
  const handleDownloadPdf = (invoice = lastCreatedInvoice) => {
    if (!invoice) return;

    const doc = new jsPDF();

    // Store Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74); // Green brand color
    doc.text('GREEN GROCERY', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Freshness Delivered Daily', 105, 26, { align: 'center' });
    doc.text('101 Orchard Boulevard, Market Complex, Bengaluru - 560001', 105, 31, { align: 'center' });
    doc.text('GSTIN: 29AABCU9603R1ZM | Phone: +91 98765 43210', 105, 36, { align: 'center' });

    doc.setDrawColor(220);
    doc.line(14, 40, 196, 40);

    // Invoice Meta Information
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 48);
    doc.text(`Date & Time: ${new Date(invoice.createdAt).toLocaleString('en-IN')}`, 14, 54);
    doc.text(`Cashier: ${invoice.cashierName || user?.name || 'Cashier'}`, 14, 60);

    doc.text(`Customer Name: ${invoice.customerDetails?.name || 'Walk-in'}`, 125, 48);
    doc.text(`Customer Phone: ${invoice.customerDetails?.phone || 'N/A'}`, 125, 54);
    doc.text(`Payment Mode: ${invoice.paymentMethod} (${invoice.paymentStatus})`, 125, 60);

    // Table Data
    const tableBody = invoice.items.map((item, index) => [
      index + 1,
      item.name,
      `₹${item.ratePerKg}`,
      `${(item.weightInGrams / 1000).toFixed(3)} kg (${item.weightInGrams}g)`,
      `₹${item.amount.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 66,
      head: [['#', 'Vegetable / Item', 'Rate / kg', 'Weight', 'Amount']],
      body: tableBody,
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 45, halign: 'center' },
        4: { cellWidth: 35, halign: 'right' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Financial Totals Box
    doc.setFontSize(10);
    doc.text(`Subtotal:`, 130, finalY);
    doc.text(`₹${invoice.subtotal.toFixed(2)}`, 195, finalY, { align: 'right' });

    if (invoice.discount > 0) {
      doc.text(`Discount:`, 130, finalY + 6);
      doc.text(`-₹${invoice.discount.toFixed(2)}`, 195, finalY + 6, { align: 'right' });
    }

    if (invoice.tax > 0) {
      doc.text(`Tax:`, 130, finalY + 12);
      doc.text(`₹${invoice.tax.toFixed(2)}`, 195, finalY + 12, { align: 'right' });
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Grand Total:`, 130, finalY + 20);
    doc.text(`₹${invoice.grandTotal.toFixed(2)}`, 195, finalY + 20, { align: 'right' });

    if (invoice.paymentMethod === 'CASH') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Amount Received: ₹${invoice.amountReceived || invoice.grandTotal}`, 130, finalY + 27);
      doc.text(`Change Returned: ₹${invoice.changeReturned || 0}`, 130, finalY + 32);
    }

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text('Thank you for shopping with Green Grocery!', 105, finalY + 45, { align: 'center' });
    doc.text('Quality you can trust, freshness you can taste.', 105, finalY + 50, { align: 'center' });

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  // Browser Print trigger
  const handlePrint = () => {
    window.print();
  };

  // Load Previous Invoices History
  const loadInvoiceHistory = async () => {
    try {
      const res = await api.get('/billing?limit=50');
      setInvoicesHistory(res.data.invoices || []);
      setShowHistoryModal(true);
    } catch (err) {
      dispatch(addToast({ message: 'Failed to fetch invoice history', type: 'error' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Top POS Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                POS Retail Billing Terminal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-200">
                Live Register
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cashier: <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.role}) | Store ID: GG-BLR-01
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadInvoiceHistory}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            <History className="w-4 h-4 text-slate-500" />
            Previous Invoices
          </button>
          <button
            onClick={() => {
              setCartItems([]);
              setAmountReceived('');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors border border-rose-200/60"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Bill
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* LEFT SECTION: Product Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vegetable or fruit by name, code or category..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Produce
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
            {loadingProducts ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                Loading products catalog...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                No matching produce found
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isOutOfStock = p.stockInGrams <= 0;
                const isLowStock = p.stockInGrams > 0 && p.stockInGrams <= 3000;

                return (
                  <button
                    key={p._id}
                    onClick={() => handleProductClick(p)}
                    disabled={isOutOfStock}
                    className={`p-3.5 bg-white rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed border-slate-200'
                        : 'border-slate-200/90 hover:border-brand-500 hover:shadow-md hover:scale-[1.02] active:scale-95'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isOutOfStock ? (
                          <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">
                            Low Stock
                          </span>
                        ) : null}
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                          {p.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {p.category}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-brand-700">
                          ₹{p.pricePerKg}
                        </span>
                        <span className="text-[11px] text-slate-400">/kg</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {p.stockInKg}kg left
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT SECTION: Active Bill & Checkout Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Customer Information inputs */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Customer Information
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Selected Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Selected Produce ({cartItems.length})</span>
                <span>Total Items Weight: {(cartItems.reduce((acc, c) => acc + c.weightInGrams, 0) / 1000).toFixed(3)} kg</span>
              </div>

              <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold">Bill is currently empty</p>
                    <p className="text-[11px] text-slate-400">Click produce on the left to add weight</p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs truncate">
                          {item.name}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          ₹{item.ratePerKg}/kg • <span className="font-semibold text-brand-700">{(item.weightInGrams / 1000).toFixed(3)} kg</span> ({item.weightInGrams}g)
                        </p>
                      </div>

                      {/* Weight stepper controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateItemWeight(idx, -250)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          title="-250g"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 w-12 text-center">
                          {item.weightInGrams >= 1000 ? `${(item.weightInGrams / 1000).toFixed(2)}k` : `${item.weightInGrams}g`}
                        </span>
                        <button
                          onClick={() => handleUpdateItemWeight(idx, 250)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          title="+250g"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[65px]">
                        <span className="font-black text-slate-900 text-sm block">
                          ₹{item.amount.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Discount & Tax Row */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">
                  Tax GST (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="28"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </button>
              </div>
            </div>

            {/* Cash Received & Change Return Calculator */}
            {paymentMethod === 'CASH' && (
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-900">Cash Received (₹):</label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder={String(grandTotal)}
                    className="w-28 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-sm font-black text-right text-brand-800"
                  />
                </div>
                {parsedReceived > 0 && (
                  <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-emerald-200/60">
                    <span className="text-slate-600">Change to Return:</span>
                    <span className={`text-sm font-black ${changeReturned >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      ₹{changeReturned.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bill Totals Summary & Submit Button */}
          <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({taxPercent}%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-xl font-black text-brand-700">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckoutAndGenerateBill}
              disabled={cartItems.length === 0 || isSubmitting}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <span>Generating Invoice...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Complete Sale & Generate Bill</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Weight Selector Modal when clicking a vegetable */}
      {activeProductForWeight && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-slate-100">
              <img
                src={activeProductForWeight.image}
                alt={activeProductForWeight.name}
                className="w-14 h-14 rounded-2xl object-cover"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                  {activeProductForWeight.name}
                </h3>
                <p className="text-xs font-semibold text-brand-700 mt-0.5">
                  ₹{activeProductForWeight.pricePerKg}/kg • In Stock: {activeProductForWeight.stockInKg}kg
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Quick Weight Presets
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: '100g', k: '0', g: '100' },
                  { l: '250g', k: '0', g: '250' },
                  { l: '500g', k: '0', g: '500' },
                  { l: '750g', k: '0', g: '750' },
                  { l: '1 kg', k: '1', g: '0' },
                  { l: '1.5kg', k: '1', g: '500' },
                  { l: '2 kg', k: '2', g: '0' },
                  { l: '3 kg', k: '3', g: '0' }
                ].map((item) => (
                  <button
                    key={item.l}
                    type="button"
                    onClick={() => {
                      setWeightKg(item.k);
                      setWeightG(item.g);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      weightKg === item.k && weightG === item.g
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom kg & g Entry */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kilograms (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Grams (g)
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  step="50"
                  value={weightG}
                  onChange={(e) => setWeightG(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-center font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Live Amount Calculation Preview */}
            <div className="bg-brand-50 p-3.5 rounded-xl border border-brand-200 flex items-center justify-between mb-5">
              <span className="text-xs font-bold text-brand-900">Calculated Item Amount:</span>
              <span className="text-xl font-black text-brand-700">
                ₹{(((activeProductForWeight.pricePerKg * (Math.round(Number(weightKg) * 1000) + Math.round(Number(weightG)))) / 1000) || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveProductForWeight(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWeightAdd}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Add to Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Bill Receipt & Print Preview Modal */}
      {showInvoiceModal && lastCreatedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-in my-8">
            {/* Action buttons (hidden on print) */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 no-print">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Invoice Generated Successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(lastCreatedInvoice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Receipt Canvas */}
            <div id="printable-receipt" className="text-slate-800 font-mono text-xs space-y-4 p-4 border border-slate-200 rounded-2xl bg-white">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-brand-800 tracking-tight font-sans">
                  GREEN GROCERY
                </h2>
                <p className="text-[11px] font-sans font-bold text-emerald-600">
                  Freshness Delivered Daily
                </p>
                <p className="text-[10px] text-slate-500">
                  101 Orchard Boulevard, Market Complex, Bengaluru - 560001
                </p>
                <p className="text-[10px] text-slate-500">
                  Phone: +91 98765 43210 | GSTIN: 29AABCU9603R1ZM
                </p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
                <div className="flex justify-between">
                  <span>Invoice: {lastCreatedInvoice.invoiceNumber}</span>
                  <span>{new Date(lastCreatedInvoice.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer: {lastCreatedInvoice.customerDetails?.name || 'Walk-in'}</span>
                  <span>{new Date(lastCreatedInvoice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {lastCreatedInvoice.customerDetails?.phone && (
                  <div>Phone: {lastCreatedInvoice.customerDetails.phone}</div>
                )}
                <div>Cashier: {lastCreatedInvoice.cashierName || user?.name || 'Staff'}</div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-300 text-[11px]">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-center">Weight</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lastCreatedInvoice.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-1.5 font-bold">{it.name}</td>
                      <td className="py-1.5 text-right">₹{it.ratePerKg}</td>
                      <td className="py-1.5 text-center">{(it.weightInGrams / 1000).toFixed(3)}kg</td>
                      <td className="py-1.5 text-right font-bold">₹{it.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-right">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{lastCreatedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {lastCreatedInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-₹{lastCreatedInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                {lastCreatedInvoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{lastCreatedInvoice.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-300 text-slate-900 font-sans">
                  <span>Grand Total:</span>
                  <span>₹{lastCreatedInvoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>Payment Mode:</span>
                  <span className="font-bold">{lastCreatedInvoice.paymentMethod}</span>
                </div>
                {lastCreatedInvoice.paymentMethod === 'CASH' && (
                  <>
                    <div className="flex justify-between text-[11px]">
                      <span>Amount Received:</span>
                      <span>₹{lastCreatedInvoice.amountReceived || lastCreatedInvoice.grandTotal}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Change Returned:</span>
                      <span>₹{lastCreatedInvoice.changeReturned || 0}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-0.5 text-[10px] text-slate-500">
                <p className="font-bold font-sans text-slate-700">
                  Thank you for shopping with Green Grocery!
                </p>
                <p>Eat Fresh • Stay Healthy • Live Better</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Invoices History & Search */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-brand-600" />
                Previous POS Invoices
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <div className="my-4">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by invoice number, customer name or phone..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5">
              {invoicesHistory
                .filter(
                  (inv) =>
                    inv.invoiceNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
                    inv.customerDetails?.name?.toLowerCase().includes(historySearch.toLowerCase())
                )
                .map((inv) => (
                  <div
                    key={inv._id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {inv.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {inv.customerDetails?.name || 'Walk-in'} • {new Date(inv.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-black text-brand-700">₹{inv.grandTotal.toFixed(2)}</span>
                      <button
                        onClick={() => {
                          setLastCreatedInvoice(inv);
                          setShowInvoiceModal(true);
                        }}
                        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
                        title="View / Print"
                      >
                        <Printer className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(inv)}
                        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
