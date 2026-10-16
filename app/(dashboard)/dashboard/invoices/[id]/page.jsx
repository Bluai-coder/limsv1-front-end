"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BuildingOffice2Icon,
  UserIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import PaymentModal from "@/components/PaymentModal";
import { api } from "@/lib/api";
import { toast } from "sonner";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    draft: { color: "bg-gray-100 text-gray-800 border-gray-300", icon: <ClockIcon className="w-3.5 h-3.5" /> },
    issued: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: <ClockIcon className="w-3.5 h-3.5" /> },
    partially_paid: { color: "bg-amber-100 text-amber-800 border-amber-300", icon: <ClockIcon className="w-3.5 h-3.5" /> },
    paid: { color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <CheckCircleIcon className="w-3.5 h-3.5" /> },
    overdue: { color: "bg-rose-100 text-rose-800 border-rose-300", icon: <XCircleIcon className="w-3.5 h-3.5" /> },
    cancelled: { color: "bg-gray-100 text-gray-700 border-gray-300", icon: <XCircleIcon className="w-3.5 h-3.5" /> },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${config.color}`}>
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [balance, setBalance] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    due_date: "",
    status: "issued",
    notes: "",
    discount_amount: 0,
  });

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
      const invData = response.data.data;
      setInvoice(invData);
      setEditForm({
        due_date: invData.due_date ? new Date(invData.due_date).toISOString().split("T")[0] : "",
        status: invData.status || "issued",
        notes: invData.notes || "",
        discount_amount: invData.discount_amount || 0,
      });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to load invoice details");
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
    toast.success("Payment recorded successfully");
    fetchInvoice();
    fetchBalance();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      toast.info("Generating invoice PDF...");

      // Try direct blob download first (most reliable)
      try {
        const response = await api.get(`/invoices/${invoiceId}/pdf?download=true`, {
          responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice_${invoice?.invoice_number || invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Invoice PDF downloaded successfully");
        return;
      } catch (blobErr) {
        console.warn("Direct blob download failed, trying download URL:", blobErr);
      }

      // Fallback to json downloadUrl
      const response = await api.get(`/invoices/${invoiceId}/pdf`);
      
      if (response.data?.downloadUrl) {
        const downloadPath = response.data.downloadUrl;
        const fullUrl = downloadPath.startsWith("http")
          ? downloadPath
          : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") || "http://localhost:8000"}${downloadPath}`;
        
        const link = document.createElement("a");
        link.href = fullUrl;
        link.setAttribute("download", `invoice_${invoice?.invoice_number || invoiceId}.pdf`);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Invoice PDF downloaded successfully");
      } else {
        toast.error("Could not generate PDF URL");
      }
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error(error.response?.data?.message || "Failed to download invoice PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const payload = {
        due_date: editForm.due_date || null,
        status: editForm.status,
        notes: editForm.notes,
        discount_amount: Number(editForm.discount_amount) || 0,
      };

      await api.put(`/invoices/${invoiceId}`, payload);
      toast.success("Invoice updated successfully");
      setShowEditModal(false);
      await fetchInvoice();
      await fetchBalance();
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast.error(error.response?.data?.message || "Failed to update invoice");
    } finally {
      setSavingEdit(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(Number(amount) || 0);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-sm text-gray-500 font-medium">Loading medical invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 font-medium">Invoice not found</p>
          <button
            onClick={() => router.push("/dashboard/invoices")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  // Lab details from tenant settings or defaults
  const lab = invoice.tenant?.lab || {};
  const labName = lab.name || invoice.tenant?.branding?.companyName || invoice.tenant?.name || "Laboratory Diagnostic Center";
  const labAddressParts = [
    lab.address,
    lab.city,
    lab.state ? `${lab.state} - ${lab.zip || ""}` : lab.zip,
    lab.country || "India",
  ].filter(Boolean);
  const labFullAddress = labAddressParts.join(", ") || "Diagnostic & Pathology Services";
  const labPhone = lab.phone || "";
  const labEmail = lab.email || invoice.tenant?.billingEmail || "";
  const labLicense = lab.license || lab.nabl || "";

  // Patient details
  const pt = invoice.patient || {};
  const patientName = pt.full_name || `${pt.firstName || pt.first_name || ""} ${pt.lastName || pt.last_name || ""}`.trim() || "Walk-in Patient";
  const patientAddressParts = [pt.addressLine1, pt.city, pt.state, pt.postalCode].filter(Boolean);
  const patientFullAddress = patientAddressParts.join(", ");

  // Order details
  const ord = invoice.order || {};
  const referringPhysician = ord.referringPhysician?.full_name || ord.referring_physician || "Self / Hospital Direct";

  // Financials
  const subtotal = Number(invoice.subtotal || invoice.total_amount || 0);
  const discount = Number(invoice.discount_amount || 0);
  const tax = Number(invoice.tax_amount || 0);
  const totalAmount = Number(invoice.total_amount || 0);

  const totalPaid = balance ? Number(balance.paid_amount || 0) : (
    invoice.payments && invoice.payments.length > 0
      ? invoice.payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0)
      : (invoice.status === "paid" ? totalAmount : 0)
  );
  const balanceDue = balance ? Number(balance.outstanding || 0) : Math.max(0, totalAmount - totalPaid);

  return (
    <div className="min-h-screen bg-gray-100/70 dark:bg-gray-950 py-8">
      <style>{`
        @media print {
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, nav, aside, .print-hidden, [role="navigation"] {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible;
          }
          #invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            z-index: 9999999 !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Action Bar */}
        <div className="flex items-center justify-between mb-6 print-hidden">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Invoices
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl shadow-sm transition"
              title="Print Invoice"
            >
              <PrinterIcon className="w-4 h-4 text-gray-500" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl shadow-sm transition disabled:opacity-50"
              title="Download PDF"
            >
              {downloading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <DocumentArrowDownIcon className="w-4 h-4 text-indigo-600" />
              )}
              <span>{downloading ? "Generating..." : "Download PDF"}</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl shadow-sm transition"
              title="Edit Invoice"
            >
              <PencilIcon className="w-4 h-4 text-amber-600" />
              <span>Edit</span>
            </button>

            {invoice.status !== "paid" && invoice.status !== "cancelled" && balanceDue > 0 && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
              >
                <CreditCardIcon className="w-4 h-4" />
                <span>Pay Balance ({formatCurrency(balanceDue)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Real Medical Tax Invoice Container */}
        <div
          id="invoice-print-area"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 p-8 sm:p-10 space-y-8"
        >
          {/* Header: Logo, Lab Details & Tax Invoice Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
            {/* Lab Info */}
            <div className="space-y-3 max-w-md">
              <div className="flex items-center gap-3">
                <img
                  src="/blu-lims.png"
                  alt="bluLIMS Logo"
                  className="h-9 w-auto object-contain"
                />
                <span className="text-xs font-mono font-medium tracking-tight text-gray-400 dark:text-gray-500 uppercase">
                  Powered by bluLIMS
                </span>
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  {labName}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  {labFullAddress}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  {labPhone && (
                    <span className="inline-flex items-center gap-1">
                      <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                      {labPhone}
                    </span>
                  )}
                  {labEmail && (
                    <span className="inline-flex items-center gap-1">
                      <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                      {labEmail}
                    </span>
                  )}
                  {labLicense && (
                    <span className="inline-flex items-center gap-1 font-mono">
                      Reg/NABL: {labLicense}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="text-left sm:text-right space-y-2">
              <div className="inline-block">
                <span className="text-2xl font-black text-indigo-950 dark:text-indigo-200 tracking-wider">
                  TAX INVOICE
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                  Invoice #: {invoice.invoice_number}
                </p>
                <p>Date: {formatDate(invoice.invoice_date)}</p>
                <p>Due Date: <span className="font-semibold">{formatDate(invoice.due_date)}</span></p>
              </div>
              <div className="pt-1">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>

          {/* Patient Details & Order Details (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Patient (Billed To) */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/80 dark:border-gray-700/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <UserIcon className="w-4 h-4" />
                <span>Billed To (Patient)</span>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {patientName}
                </p>
                {pt.mrn && (
                  <p className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    MRN / UHID: {pt.mrn}
                  </p>
                )}
                {(pt.gender || pt.bloodGroup) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 capitalize">
                    {[pt.gender, pt.bloodGroup ? `Blood: ${pt.bloodGroup}` : null].filter(Boolean).join(" • ")}
                  </p>
                )}
                {(pt.phonePrimary || pt.phone || pt.email) && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {[pt.phonePrimary || pt.phone, pt.email].filter(Boolean).join(" | ")}
                  </p>
                )}
                {patientFullAddress && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {patientFullAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Clinical & Order Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/80 dark:border-gray-700/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <DocumentTextIcon className="w-4 h-4" />
                <span>Clinical & Order Details</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Order Number:</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    {ord.order_number || invoice.order_id || "N/A"}
                  </span>
                </div>
                {ord.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Order Date:</span>
                    <span>{formatDate(ord.created_at)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                  <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                    {ord.priority || "Routine"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Referring Physician:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-right">
                    {referringPhysician}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Diagnostic Services / Line Items
            </h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3 w-12 text-center">#</th>
                    <th className="px-4 py-3">Test / Service Description</th>
                    <th className="px-4 py-3 w-28">Code</th>
                    <th className="px-4 py-3 w-16 text-center">Qty</th>
                    <th className="px-4 py-3 w-28 text-right">Unit Rate</th>
                    <th className="px-4 py-3 w-28 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs">
                  {invoice.lines && invoice.lines.length > 0 ? (
                    invoice.lines.map((line, idx) => (
                      <tr
                        key={line.id || idx}
                        className={idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50/50 dark:bg-gray-850"}
                      >
                        <td className="px-4 py-3 text-center text-gray-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {line.description}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">
                          {line.code || "-"}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                          {line.quantity || 1}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300 font-mono">
                          {formatCurrency(line.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white font-mono">
                          {formatCurrency(line.line_total || line.unit_price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                        Diagnostic Testing Services ({formatCurrency(invoice.total_amount)})
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section: Notes & Terms (Left) + Totals Box (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
            {/* Terms and Notes */}
            <div className="sm:col-span-7 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Payment Instructions & Notes
                </p>
                {invoice.notes && (
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {invoice.notes}
                  </p>
                )}
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Accepted Payment Methods: <strong>Cash</strong> and <strong>Razorpay</strong> (Cards, UPI, NetBanking).</li>
                  <li>Payments are due by the specified due date ({formatDate(invoice.due_date)}).</li>
                  <li>Please retain this invoice for your medical insurance and record-keeping purposes.</li>
                </ul>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pt-1">
                  This is a computer-generated medical invoice and does not require a physical signature.
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="sm:col-span-5 space-y-2">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatCurrency(discount)}</span>
                  </div>
                )}

                {tax > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax / GST:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Total Amount:
                  </span>
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline font-bold pt-1">
                  <span className="text-xs text-gray-900 dark:text-white">Balance Due:</span>
                  <span className={`text-sm font-mono ${balanceDue > 0 ? "text-rose-600 dark:text-rose-400 font-extrabold" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {formatCurrency(balanceDue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Footer */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-2">
            <span>bluLIMS Cloud Diagnostic System • {labName}</span>
            <span>Generated on {new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity" onClick={() => setShowEditModal(false)} />

            <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <PencilIcon className="w-5 h-5" />
                  <h3 className="text-base font-bold">Edit Invoice #{invoice.invoice_number}</h3>
                </div>
                <button onClick={() => setShowEditModal(false)} className="hover:opacity-80">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Invoice Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="issued">Issued (Unpaid)</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Default credit term for hospital orders is Net 15 days.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.discount_amount}
                    onChange={(e) => setEditForm({ ...editForm, discount_amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    Invoice Notes / Terms
                  </label>
                  <textarea
                    rows="3"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Enter any billing remarks or terms..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (Cash & Razorpay Only) */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        invoiceId={invoiceId}
        onSuccess={handlePaymentSuccess}
        amountPay={balanceDue}
      />
    </div>
  );
}