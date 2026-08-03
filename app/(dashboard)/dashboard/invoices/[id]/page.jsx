"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import PaymentModal from "@/components/PaymentModal";
import { api } from "@/lib/api";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { color: "bg-gray-100 text-gray-800", icon: <ClockIcon className="w-4 h-4" /> },
    issued: { color: "bg-blue-100 text-blue-800", icon: <ClockIcon className="w-4 h-4" /> },
    partially_paid: { color: "bg-yellow-100 text-yellow-800", icon: <ClockIcon className="w-4 h-4" /> },
    paid: { color: "bg-green-100 text-green-800", icon: <CheckCircleIcon className="w-4 h-4" /> },
    overdue: { color: "bg-red-100 text-red-800", icon: <XCircleIcon className="w-4 h-4" /> },
    cancelled: { color: "bg-gray-100 text-gray-800", icon: <XCircleIcon className="w-4 h-4" /> },
  };

  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.icon}
      {status?.replace("_", " ") || "Draft"}
    </span>
  );
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
      fetchBalance();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invoices/${invoiceId}`);
      setInvoice(response.data.data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/balance`);
      setBalance(response.data.data);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handlePaymentSuccess = () => {
    fetchInvoice();
    fetchBalance();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Invoice not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          .print-hidden {
            display: none !important;
          }
          /* Ensure gradient and colors print properly */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 print-hidden">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Print Invoice"
            >
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <DocumentArrowDownIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <PencilIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <div id="invoice-print-area" className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Invoice</p>
                <h1 className="text-2xl font-bold text-white">{invoice.invoice_number}</h1>
              </div>
              <StatusBadge status={invoice.status} />
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-semibold text-gray-900">
                  {invoice.patient?.first_name} {invoice.patient?.last_name}
                </p>
                <p className="text-sm text-gray-600">{invoice.patient?.email}</p>
                <p className="text-sm text-gray-600">{invoice.patient?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Invoice Details</p>
                <p className="text-sm text-gray-900">Date: {formatDate(invoice.invoice_date)}</p>
                <p className="text-sm text-gray-900">Due: {formatDate(invoice.due_date)}</p>
                <p className="text-sm text-gray-900">Currency: {invoice.currency}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {formatCurrency(invoice.total_amount)}
                </p>
                {balance && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Paid: {formatCurrency(balance.paid_amount)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Outstanding: {formatCurrency(balance.outstanding)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Action */}
            {invoice.status !== "paid" && invoice.status !== "cancelled" && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl print-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Outstanding Balance: {formatCurrency(balance?.outstanding || 0)}
                    </p>
                    <p className="text-xs text-yellow-600">
                      Please complete payment to avoid overdue charges
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <CreditCardIcon className="w-5 h-5" />
                    Pay Now
                  </button>
                </div>
              </div>
            )}

            {/* Invoice Lines */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.lines?.map((line) => (
                      <tr key={line.id}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{line.description}</p>
                          {line.code && (
                            <p className="text-xs text-gray-500">Code: {line.code}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                          {line.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                          {formatCurrency(line.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                          {formatCurrency(line.discount)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                          {line.tax_rate}%
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(line.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan="5" className="px-4 py-3 text-right font-medium text-gray-600">
                        Subtotal
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(invoice.subtotal)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-right text-sm text-gray-600">
                        Tax Amount
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900">
                        {formatCurrency(invoice.tax_amount)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-right text-sm text-gray-600">
                        Discount
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900">
                        -{formatCurrency(invoice.discount_amount)}
                      </td>
                    </tr>
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan="5" className="px-4 py-3 text-right font-bold text-gray-900">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-600">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Notes</p>
                <p className="text-sm text-gray-600 mt-1">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoiceId={invoiceId}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}