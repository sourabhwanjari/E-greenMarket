import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Printer,
  Download,
  Calendar,
  CreditCard,
  Eye,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../../services/api';
import AdminSidebar from '../../components/layout/AdminSidebar';

export default function InvoicesAdminPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (paymentFilter !== 'ALL') params.append('paymentMethod', paymentFilter);
      params.append('limit', '100');

      const res = await api.get(`/billing?${params.toString()}`);
      setInvoices(res.data.invoices || []);
    } catch (err) {
      console.error('Failed to load invoices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [paymentFilter]);

  const handleDownloadPdf = (invoice) => {
    if (!invoice) return;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 163, 74);
    doc.text('GREEN GROCERY', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Freshness Delivered Daily', 105, 26, { align: 'center' });
    doc.text('101 Orchard Boulevard, Market Complex, Bengaluru - 560001', 105, 31, { align: 'center' });

    doc.setDrawColor(220);
    doc.line(14, 38, 196, 38);

    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 46);
    doc.text(`Date & Time: ${new Date(invoice.createdAt).toLocaleString('en-IN')}`, 14, 52);
    doc.text(`Cashier: ${invoice.cashierName || 'Staff'}`, 14, 58);

    doc.text(`Customer: ${invoice.customerDetails?.name || 'Walk-in'}`, 125, 46);
    doc.text(`Phone: ${invoice.customerDetails?.phone || 'N/A'}`, 125, 52);
    doc.text(`Payment: ${invoice.paymentMethod}`, 125, 58);

    const tableBody = invoice.items.map((it, idx) => [
      idx + 1,
      it.name,
      `₹${it.ratePerKg}`,
      `${(it.weightInGrams / 1000).toFixed(3)}kg (${it.weightInGrams}g)`,
      `₹${it.amount.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 64,
      head: [['#', 'Item', 'Rate/kg', 'Weight', 'Amount']],
      body: tableBody,
      headStyles: { fillColor: [22, 163, 74] }
    });

    const finalY = doc.lastAutoTable.finalY + 8;
    doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, 145, finalY);
    if (invoice.discount > 0) doc.text(`Discount: -₹${invoice.discount.toFixed(2)}`, 145, finalY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Grand Total: ₹${invoice.grandTotal.toFixed(2)}`, 145, finalY + 14);

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Store Invoices & Billing Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search POS transactions, reprint invoices, download PDF receipts, and audit tender methods.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()}
              placeholder="Search by invoice#, customer name, phone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'CASH', 'UPI', 'ONLINE'].map((m) => (
              <button
                key={m}
                onClick={() => setPaymentFilter(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  paymentFilter === m ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items / Net Weight</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Payment</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(inv.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{inv.customerDetails?.name || 'Walk-in'}</span>
                      <span className="text-[11px] text-slate-400">{inv.customerDetails?.phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {inv.items.length} items ({(inv.items.reduce((acc, i) => acc + i.weightInGrams, 0) / 1000).toFixed(2)}kg)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                      ₹{inv.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(inv)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-brand-700"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: Invoice Details */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-scale-in max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-xs text-slate-500">{new Date(selectedInvoice.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block">Customer: {selectedInvoice.customerDetails?.name || 'Walk-in'}</span>
                  <span className="text-slate-500">Cashier: {selectedInvoice.cashierName || 'Staff'} • Mode: {selectedInvoice.paymentMethod}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Billed Produce</span>
                  {selectedInvoice.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{it.name}</span>
                        <span className="text-slate-500 block">{(it.weightInGrams / 1000).toFixed(3)}kg @ ₹{it.ratePerKg}/kg</span>
                      </div>
                      <span className="font-black text-slate-900">₹{it.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1 text-right">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-₹{selectedInvoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200 text-slate-900">
                    <span>Grand Total:</span>
                    <span className="text-brand-700">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleDownloadPdf(selectedInvoice)}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
