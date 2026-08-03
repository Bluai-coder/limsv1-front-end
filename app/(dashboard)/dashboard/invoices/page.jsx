'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Eye,
  CreditCard,
  FileDown,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import axios from 'axios';
import PaymentModal from '@/components/PaymentModal';
import QueryError from '@/components/common/QueryError';
import { api } from '@/lib/api';

// Status badge component with theme support
const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { 
      label: 'Draft', 
      className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
    },
    issued: { 
      label: 'Issued', 
      className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
    },
    partially_paid: { 
      label: 'Partially Paid', 
      className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
    },
    paid: { 
      label: 'Paid', 
      className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
    },
    overdue: { 
      label: 'Overdue', 
      className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
    },
    cancelled: { 
      label: 'Cancelled', 
      className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
    },
    write_off: { 
      label: 'Write Off', 
      className: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.draft;
  
  return (
    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

// View Invoice Modal Component
const ViewInvoiceModal = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{invoice.invoice_number}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {invoice.patient?.first_name} {invoice.patient?.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Patient</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {invoice.patient?.first_name} {invoice.patient?.last_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {invoice.patient?.email || 'No email'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <StatusBadge status={invoice.status} />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Invoice Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(invoice.invoice_date)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(invoice.due_date)}
              </p>
            </div>
            <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(invoice.total_amount)}
              </p>
            </div>
            {invoice.notes && (
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                <p className="text-sm text-gray-900 dark:text-white">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <button
              className="px-4 py-2 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-lg transition"
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton Component
const TableSkeleton = ({ columns = 7 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, j) => (
      <td key={j} className="px-6 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </td>
    ))}
  </tr>
);

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [amountPay ,setAmountPay]= useState(0)
  const [fetchError, setFetchError] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
  });

  const limit = 10;

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter, currentPage]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await api.get('/invoices', {
        params: {
          page: currentPage,
          limit,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });

      setInvoices(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
      
      // Calculate summary from all data (you might want to get this from API instead)
      const allInvoices = response.data.data;
      setSummary({
        total: response.data.pagination.total,
        paid: allInvoices.filter((inv) => inv.status === 'paid').length,
        pending: allInvoices.filter((inv) => inv.status === 'issued' || inv.status === 'partially_paid').length,
        overdue: allInvoices.filter((inv) => inv.status === 'overdue').length,
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setFetchError(error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (invoiceId) => {
    console.log("invoiceIdinvoiceId",invoiceId)
    setSelectedInvoiceId(invoiceId.id);
    setAmountPay(invoiceId.subtotal)
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchInvoices();
    toast.success('Payment processed successfully');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
  };

  const handleViewDetails = (invoice) => {
    setViewInvoice(invoice);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* View Invoice Modal */}
      {viewInvoice && (
        <ViewInvoiceModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoiceId={selectedInvoiceId}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        amountPay={amountPay}
      />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Invoices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalItems} invoices registered
          </p>
        </div>

        <Link
          href="/dashboard/invoices/new"
          className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.paid}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.overdue}</p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search invoices by number or patient name..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        
        {/* Filter Section */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
          </button>
          {showFilters && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
        </div>
      </div>

      {fetchError && <QueryError error={fetchError} onRetry={fetchInvoices} className="mb-4" />}
      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Invoice #</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Patient</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Date</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Due Date</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeleton key={i} columns={7} />
                ))
              ) : invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* INVOICE NUMBER - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(invoice)}
                        className="font-medium text-gray-900 dark:text-white hover:text-[#1b4dff] dark:hover:text-[#1b4dff] transition text-left"
                      >
                        {invoice.invoice_number}
                      </button>
                    </td>

                    {/* PATIENT */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs">
                          {invoice.patient?.first_name?.[0]}{invoice.patient?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.patient?.first_name} {invoice.patient?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {invoice.patient?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(invoice.invoice_date)}
                    </td>

                    {/* DUE DATE */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatDate(invoice.due_date)}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total_amount)}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>

                    {/* ACTIONS - View, Pay, Download */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Invoice Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Pay Button */}
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                          <button
                            onClick={() => handlePayNow(invoice)}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Pay Now"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}

                        {/* Download Button */}
                        <button
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Receipt className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No invoices found</p>
                    <Link href="/dashboard/invoices/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                      Create your first invoice →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min((currentPage - 1) * limit + 1, totalItems)}–{Math.min(currentPage * limit, totalItems)} of {totalItems} invoices
            </p>

            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-600 dark:text-gray-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}