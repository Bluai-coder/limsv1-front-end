'use client';

import { useState, useId } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  FileCheck2,
  Shield,
  Clock,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Percent,
  Coins,
  ArrowRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' },
  { id: 'razorpay', label: 'Razorpay (Online)', icon: CreditCard, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200' },
];

export default function OrderBillingModal({
  isOpen,
  onClose,
  patient,
  physician,
  tests = [],
  currency = 'INR',
  subtotal = 0,
  priority = 'routine',
  onConfirmOrder,
  isSubmitting = false,
  createdOrderResult = null,
  onResetOrder,
  onViewOrders,
}) {
  const [discountType, setDiscountType] = useState('amount'); // 'amount' | 'percent'
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(0); // 0, 5, 12, 18
  const [paymentPolicy, setPaymentPolicy] = useState('pay_now'); // 'pay_now' | 'bill_later'
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Payment form states
  const [amountTendered, setAmountTendered] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [reference, setReference] = useState('');
  const [billingNotes, setBillingNotes] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  // Calculations
  const calculatedDiscount = discountType === 'percent'
    ? Math.round((subtotal * (Number(discountValue) || 0)) / 100)
    : Math.min(subtotal, Math.max(0, Number(discountValue) || 0));

  const afterDiscount = Math.max(0, subtotal - calculatedDiscount);
  const calculatedTax = Math.round((afterDiscount * (Number(taxRate) || 0)) / 100);
  const netTotal = Math.max(0, afterDiscount + calculatedTax);

  // Default paid amount to netTotal when not set or when policy changes
  const effectivePaidAmount = paymentPolicy === 'bill_later'
    ? 0
    : (paidAmount === '' ? netTotal : Math.max(0, Number(paidAmount)));

  const changeDue = paymentMethod === 'cash' && Number(amountTendered) > effectivePaidAmount
    ? (Number(amountTendered) - effectivePaidAmount).toFixed(2)
    : 0;

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(Number(val) || 0);
  };

  const handleConfirm = () => {
    const billingPayload = {
      subtotal,
      discount: calculatedDiscount,
      discount_amount: calculatedDiscount,
      tax_rate: Number(taxRate) || 0,
      tax_amount: calculatedTax,
      total_amount: netTotal,
      currency,
      status: paymentPolicy === 'bill_later' ? 'issued' : (effectivePaidAmount >= netTotal ? 'paid' : 'partially_paid'),
      notes: billingNotes || undefined,
      due_date: dueDate || undefined,
    };

    const paymentPayload = paymentPolicy === 'pay_now' && effectivePaidAmount > 0 ? {
      method: paymentMethod,
      amount: effectivePaidAmount,
      reference: reference || (paymentMethod === 'cash' ? `CASH-REC-${Date.now().toString().slice(-6)}` : undefined),
      status: 'completed',
      payment_date: new Date().toISOString(),
    } : null;

    onConfirmOrder({
      billing: billingPayload,
      payment: paymentPayload,
    });
  };

  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const handlePrintReceipt = () => {
    window.print();
  };

  if (!isOpen) return null;

  // ---------------- SUCCESS SCREEN ----------------
  if (createdOrderResult) {
    let orderData = createdOrderResult;
    while (orderData && orderData.data && !orderData.order_number) {
      orderData = orderData.data;
    }
    const inv = orderData?.invoice || (orderData && typeof orderData === 'object' && 'invoice' in orderData ? orderData.invoice : null);
    const orderNumber = orderData?.order_number || orderData?.accession_number || 'N/A';
    const invoiceNumber = inv?.invoice_number || orderData?.invoice_number || (orderNumber !== 'N/A' ? `INV-${orderNumber.replace(/^ORD[-_]?/i, '')}` : 'Pending');
    const invoiceStatus = inv?.status || (paymentPolicy === 'bill_later' ? 'issued' : (effectivePaidAmount >= netTotal ? 'paid' : 'partially_paid'));
    const totalBilled = inv?.total_amount ? Number(inv.total_amount) : netTotal;

    const handleViewInvoice = async () => {
      let targetInvId = inv?.id || orderData?.invoice?.id || orderData?.invoice_id;
      if (!targetInvId && orderData?.id) {
        try {
          setLoadingInvoice(true);
          const { api } = await import('@/lib/api');
          const res = await api.get(`/orders/${orderData.id}`);
          const ord = res.data?.data || res.data;
          if (ord?.invoice?.id) {
            targetInvId = ord.invoice.id;
          }
        } catch (err) {
          console.warn("Could not fetch order invoice:", err);
        } finally {
          setLoadingInvoice(false);
        }
      }

      if (targetInvId) {
        window.open(`/dashboard/invoices/${targetInvId}`, '_blank');
      } else if (orderNumber && orderNumber !== 'N/A') {
        window.open(`/dashboard/invoices?search=${encodeURIComponent(orderNumber)}`, '_blank');
      } else {
        window.open('/dashboard/invoices', '_blank');
      }
    };

    return (
      <>
        {/* Print Styles for Dedicated Medical Slip */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }
            html, body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            header, nav, aside, [role="dialog"], .fixed {
              background: transparent !important;
            }
            #order-billing-receipt, #order-billing-receipt * {
              visibility: visible !important;
            }
            #order-billing-receipt {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 24px 32px !important;
              background: #ffffff !important;
              color: #000000 !important;
              display: block !important;
              box-shadow: none !important;
              border: none !important;
              z-index: 99999999 !important;
            }
          }
        `}</style>

        {/* Modal Dialog for User Display */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order & Invoice Created!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Accession recorded with billing clearing
            </p>

            {/* Details Card */}
            <div className="mt-6 bg-gray-50 dark:bg-gray-900/60 rounded-2xl p-4 text-left border border-gray-200/60 dark:border-gray-700 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Order Number</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{orderNumber}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Invoice Number</span>
                <button
                  type="button"
                  onClick={handleViewInvoice}
                  disabled={loadingInvoice}
                  className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 transition"
                  title="Click to view full invoice"
                >
                  <span>{invoiceNumber}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Invoice Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  invoiceStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : invoiceStatus === 'partially_paid'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {invoiceStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Total Billed</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatMoney(totalBilled)}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Patient</span>
                <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                  {patient?.firstName} {patient?.lastName} ({patient?.mrn || 'N/A'})
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={handleViewInvoice}
                disabled={loadingInvoice}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-medium text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition shadow-sm"
              >
                {loadingInvoice ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Receipt className="w-4 h-4" />
                )}
                View Invoice
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onViewOrders}
                className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-xl font-medium text-sm transition"
              >
                Go to Orders List
              </button>
              <button
                type="button"
                onClick={onResetOrder}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium text-sm transition"
              >
                + Create Another Order
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Printable Medical Slip & Receipt */}
        <div id="order-billing-receipt" className="hidden print:block text-black bg-white p-6 font-sans">
          {/* Receipt Header */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-gray-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-gray-900 uppercase">
                  {orderData?.tenant?.lab?.name || orderData?.tenant?.name || 'Pathology & Clinical Laboratory'}
                </span>
              </div>
              <p className="text-xs text-gray-600 max-w-sm">
                {orderData?.tenant?.lab?.address || 'Clinical Laboratory Diagnostic Services'}
              </p>
              <p className="text-xs text-gray-600">
                {orderData?.tenant?.lab?.phone && `Phone: ${orderData.tenant.lab.phone} | `}
                {orderData?.tenant?.lab?.email && `Email: ${orderData.tenant.lab.email}`}
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded mb-1">
                Accession & Payment Receipt
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Powered by <strong>bluLIMS</strong>
              </div>
            </div>
          </div>

          {/* Receipt Meta & Patient Information */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-gray-300 text-xs">
            <div className="space-y-1">
              <div>
                <span className="text-gray-500 font-medium">Patient Name: </span>
                <span className="font-bold text-gray-900">
                  {patient?.firstName} {patient?.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">MRN: </span>
                <span className="font-mono font-semibold text-gray-900">{patient?.mrn || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Age / Gender: </span>
                <span className="text-gray-900">
                  {patient?.age ? `${patient.age} Y` : ''} {patient?.gender ? `/ ${patient.gender}` : ''}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Contact: </span>
                <span className="text-gray-900">{patient?.phonePrimary || patient?.phoneSecondary || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1 text-right">
              <div>
                <span className="text-gray-500 font-medium">Receipt / Inv #: </span>
                <span className="font-mono font-bold text-gray-900">{invoiceNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Order #: </span>
                <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Date & Time: </span>
                <span className="text-gray-900">
                  {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Ref. Doctor: </span>
                <span className="font-semibold text-gray-900">{physician?.full_name || 'Self / Hospital Direct'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Priority: </span>
                <span className="font-bold text-gray-900 uppercase">{orderData?.priority || priority || 'ROUTINE'}</span>
              </div>
            </div>
          </div>

          {/* Test Items Table */}
          <div className="py-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-gray-300 text-gray-600 uppercase font-semibold">
                  <th className="py-2 w-10">#</th>
                  <th className="py-2">Test / Service Description</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tests.map((test, idx) => (
                  <tr key={test.id || idx}>
                    <td className="py-2 text-gray-500">{idx + 1}</td>
                    <td className="py-2">
                      <span className="font-semibold text-gray-900">{test.name}</span>
                      {test.code && <span className="font-mono text-gray-500 ml-2">({test.code})</span>}
                    </td>
                    <td className="py-2 text-right">1</td>
                    <td className="py-2 text-right">{formatMoney(test.price || 0)}</td>
                    <td className="py-2 text-right font-medium">{formatMoney(test.price || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Breakdown */}
          <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-start text-xs">
            {/* Payment Details */}
            <div className="space-y-1.5 max-w-xs">
              <div className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">Payment Clearance</div>
              <div>
                <span className="text-gray-500">Method: </span>
                <span className="font-semibold uppercase text-gray-900">
                  {paymentPolicy === 'bill_later' ? 'Credit / Bill Later' : (paymentMethod === 'cash' ? 'Cash' : 'Razorpay')}
                </span>
              </div>
              {reference && (
                <div>
                  <span className="text-gray-500">Reference: </span>
                  <span className="font-mono text-gray-800">{reference}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Status: </span>
                <span className="font-bold uppercase text-gray-900">
                  {invoiceStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="pt-2">
                <QRCodeSVG
                  value={orderNumber !== 'N/A' ? orderNumber : (inv?.id || 'LIMS')}
                  size={64}
                  level="M"
                />
                <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                  Accession QR
                </span>
              </div>
            </div>

            {/* Totals Calculation */}
            <div className="w-56 space-y-1 text-right">
              <div className="flex justify-between py-0.5">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatMoney(subtotal)}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between py-0.5 text-emerald-700">
                  <span>Discount:</span>
                  <span>-{formatMoney(calculatedDiscount)}</span>
                </div>
              )}
              {calculatedTax > 0 && (
                <div className="flex justify-between py-0.5">
                  <span className="text-gray-600">Tax / GST:</span>
                  <span className="text-gray-900">+{formatMoney(calculatedTax)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-t border-gray-400 font-bold text-sm">
                <span>Net Total:</span>
                <span>{formatMoney(totalBilled)}</span>
              </div>
              <div className="flex justify-between py-0.5 text-gray-700">
                <span>Amount Paid:</span>
                <span className="font-semibold">{formatMoney(effectivePaidAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-gray-300 font-bold text-xs">
                <span>Balance Due:</span>
                <span className={netTotal - effectivePaidAmount > 0 ? "text-rose-700" : "text-gray-900"}>
                  {formatMoney(Math.max(0, netTotal - effectivePaidAmount))}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-8 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500 space-y-0.5">
            <p>This is a computer-generated medical payment and accession receipt.</p>
            <p>Thank you for choosing {orderData?.tenant?.lab?.name || orderData?.tenant?.name || 'our laboratory services'}. For questions, contact lab administration.</p>
          </div>
        </div>
      </>
    );
  }

  // ---------------- BILLING & PAYWALL MODAL ----------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1b4dff]/10 dark:bg-[#1b4dff]/20 text-[#1b4dff] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Order Billing & Payment Clearance
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold uppercase">
                  Upfront Paywall
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Patient: <span className="font-semibold text-gray-800 dark:text-gray-200">{patient?.firstName} {patient?.lastName}</span> ({patient?.mrn || 'N/A'})
                {physician && <> • Ref: <span className="font-medium text-gray-700 dark:text-gray-300">{physician.full_name}</span></>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Test Items Breakdown */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Tests & Services Included ({tests.length})
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/60 max-h-48 overflow-y-auto">
              {tests.map((test, idx) => (
                <div key={test.id || idx} className="px-4 py-2.5 flex items-center justify-between text-sm hover:bg-gray-50/50 dark:hover:bg-gray-700/20">
                  <div className="min-w-0 pr-3">
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium mr-2">
                      {test.code || `TEST-${idx + 1}`}
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                      {test.name}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {formatMoney(test.price || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Discounts & Tax Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discount */}
            <div className="p-4 bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-gray-200/60 dark:border-gray-700">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                <span>Discount / Concession</span>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setDiscountType('amount')}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${discountType === 'amount' ? 'bg-[#1b4dff] text-white' : 'text-gray-500'}`}
                  >
                    ₹ Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${discountType === 'percent' ? 'bg-[#1b4dff] text-white' : 'text-gray-500'}`}
                  >
                    % Percent
                  </button>
                </div>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#1b4dff] focus:outline-none"
                />
              </div>
              {calculatedDiscount > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1.5">
                  Savings: -{formatMoney(calculatedDiscount)}
                </p>
              )}
            </div>

            {/* Tax / GST */}
            <div className="p-4 bg-gray-50/70 dark:bg-gray-900/40 rounded-2xl border border-gray-200/60 dark:border-gray-700">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                <span>Tax / GST Rate</span>
                <span className="text-xs text-gray-500">CGST + SGST</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 5, 12, 18].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setTaxRate(rate)}
                    className={`py-2 rounded-xl text-xs font-bold transition ${
                      taxRate === rate
                        ? 'bg-[#1b4dff] text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
              {calculatedTax > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  GST amount: +{formatMoney(calculatedTax)}
                </p>
              )}
            </div>
          </div>

          {/* 3. Financial Summary Card */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Billed Amount</div>
              <div className="text-2xl font-extrabold text-[#1b4dff] dark:text-blue-400">
                {formatMoney(netTotal)}
              </div>
            </div>
            <div className="text-right text-xs space-y-0.5 text-gray-600 dark:text-gray-300">
              <div>Subtotal: <span className="font-semibold text-gray-800 dark:text-gray-200">{formatMoney(subtotal)}</span></div>
              {calculatedDiscount > 0 && (
                <div className="text-emerald-600 dark:text-emerald-400">
                  Discount: -{formatMoney(calculatedDiscount)}
                </div>
              )}
              {calculatedTax > 0 && (
                <div>Tax ({taxRate}%): +{formatMoney(calculatedTax)}</div>
              )}
            </div>
          </div>

          {/* 4. Payment Policy Toggle (Pay Now vs Bill Later) */}
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setPaymentPolicy('pay_now')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border-2 font-semibold text-sm transition ${
                  paymentPolicy === 'pay_now'
                    ? 'border-[#1b4dff] bg-blue-50/50 dark:bg-blue-950/30 text-[#1b4dff] dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Pay Now (Collect Payment)
              </button>

              <button
                type="button"
                onClick={() => setPaymentPolicy('bill_later')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border-2 font-semibold text-sm transition ${
                  paymentPolicy === 'bill_later'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                Bill Later / Credit
              </button>
            </div>

            {/* If Pay Now: Methods and inputs */}
            {paymentPolicy === 'pay_now' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Method selector */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                          isSelected
                            ? 'border-[#1b4dff] bg-blue-50 dark:bg-blue-950/40 text-[#1b4dff] font-bold shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Specific Method UI */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                  {paymentMethod === 'cash' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                          Amount Tendered / Given by Patient
                        </label>
                        <input
                          type="number"
                          placeholder={String(netTotal)}
                          value={amountTendered}
                          onChange={(e) => setAmountTendered(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#1b4dff] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                          Change Due Back
                        </label>
                        <div className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatMoney(changeDue)}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'razorpay' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-[#1b4dff] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                            Razorpay Payment Gateway
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">
                            Customer can pay via UPI (GPay, PhonePe, Paytm), Debit/Credit Cards, NetBanking, or Wallets.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                            Razorpay Payment ID / Reference (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. pay_Nabc123456"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-[#1b4dff] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                            Amount Collected Now
                          </label>
                          <input
                            type="number"
                            placeholder={String(netTotal)}
                            value={paidAmount}
                            onChange={(e) => setPaidAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#1b4dff] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Partial payment hint */}
                  {effectivePaidAmount < netTotal && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium pt-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      Partial Payment: Balance of {formatMoney(netTotal - effectivePaidAmount)} will remain outstanding.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* If Bill Later */}
            {paymentPolicy === 'bill_later' && (
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    An unpaid invoice for <strong>{formatMoney(netTotal)}</strong> will be generated. The order will be registered with payment status <strong>UNPAID</strong>.
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                      Payment Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                      Billing / Credit Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Corporate monthly billing, Camp order"
                      value={billingNotes}
                      onChange={(e) => setBillingNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium text-sm transition"
          >
            Back to Order
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1b4dff] hover:bg-[#153ecc] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Order & Invoice...
              </>
            ) : (
              <>
                Confirm & Create Order ({formatMoney(paymentPolicy === 'pay_now' ? effectivePaidAmount : netTotal)})
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
