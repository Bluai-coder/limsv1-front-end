'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useReport, useGenerateReport } from '@/hooks/use-results';
import { useOrder } from '@/hooks/use-orders';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft, FileText, Download, Send, ShieldCheck,
  Loader2, Printer, Mail, MessageSquare, CheckCircle, Clock
} from 'lucide-react';
import { usePermissions } from '@/hooks/permissions/usePermissions';

export default function ReportPage() {
  const { id: orderId } = useParams();
  const router = useRouter();
  
  // Permissions
  const { canRead, canUpdate, isAdmin } = usePermissions();

  const { data: orderResponse, isLoading: isLoadingOrder } = useOrder(orderId);
  const order = orderResponse?.data || orderResponse; // Handle varied API response wrapping
  
  const generateReport = useGenerateReport(orderId);

  // We look for a report in the order, or fetch one if we generated it
  const [reportId, setReportId] = useState(null);
  
  // Find existing report from order if available
  const existingReportId = order?.reports?.[0]?.id;
  const activeReportId = reportId || existingReportId;

  const { data: report, isLoading: isLoadingReport } = useReport(activeReportId);

  const [signPassword, setSignPassword] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliverChannel, setDeliverChannel] = useState('email');
  const [deliverRecipient, setDeliverRecipient] = useState('');

  const handleGenerate = async () => {
    try {
      const result = await generateReport.mutateAsync();
      // Assume the backend returns the generated report in result.report or result.data.report
      const newReport = result?.report || result?.data?.report || result;
      if (newReport?.id) {
        setReportId(newReport.id);
      } else {
        // If no ID returned, we force a refresh of the order to get the new report
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSign = async () => {
    if (!report?.id) return;
    try {
      await api.post(`/reports/${report.id}/sign`, {
        password: signPassword,
        meaning: 'approved',
      });
      toast.success('Report signed successfully');
      setShowSignModal(false);
      setSignPassword('');
      // Ideally invalidate query here
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signing failed');
    }
  };

  const handleDeliver = async () => {
    if (!report?.id) return;
    try {
      await api.post(`/reports/${report.id}/deliver`, {
        channel: deliverChannel,
        recipient: deliverRecipient,
      });
      toast.success(`Report sent via ${deliverChannel}`);
      setShowDeliverModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delivery failed');
    }
  };

  const patient = order?.patient;

  if (isLoadingOrder || isLoadingReport) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Handle case where order is missing
  if (!order && !isLoadingOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-medium text-gray-900">Order Not Found</h2>
        <p className="text-gray-500 mt-2">The order you are looking for does not exist or you lack permission.</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  // Render the Report
  return (
    <div className="space-y-6 max-w-6xl mx-auto py-6 animate-in fade-in duration-300">
      
      {/* Header section with print-hidden so it doesn't print if user hits Ctrl+P */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Laboratory Report
              {report?.status === 'final' && (
                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Final
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Order {order?.order_number || order?.orderNumber} · {patient?.name || `${patient?.firstName} ${patient?.lastName}`} ({patient?.mrn})
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!report?.report_content && !report?.reportContent && (
            <button
              onClick={handleGenerate}
              disabled={generateReport.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
            >
              {generateReport.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Generate Report
            </button>
          )}
          
          {(report?.report_content || report?.reportContent) && (
            <>
              {(canUpdate('Reports') || isAdmin()) && (
                <button
                  onClick={() => setShowSignModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 border-2 border-emerald-500 text-emerald-700 bg-emerald-50 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" /> Sign
                </button>
              )}
              
              <button
                onClick={() => setShowDeliverModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-xl text-sm font-semibold hover:bg-gray-50 shadow-sm transition-colors"
              >
                <Send className="w-4 h-4" /> Deliver
              </button>
              
              <button
                onClick={() => {
                  const content = report.report_content || report.reportContent;
                  const w = window.open('', '_blank');
                  if (w) { 
                    w.document.write(content); 
                    w.document.close(); 
                    // Add a tiny delay to let images load before printing
                    setTimeout(() => { w.print(); }, 500);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Metadata Card */}
      {report && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Status:</span>
            <span className="font-semibold text-gray-900 capitalize">{report.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Version:</span>
            <span className="font-semibold text-gray-900">{report.version || 1}</span>
          </div>
          {(report.generated_at || report.generatedAt) && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Generated:</span>
              <span className="text-gray-900 flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                {new Date(report.generated_at || report.generatedAt).toLocaleString()}
              </span>
            </div>
          )}
          {report.signatures?.length > 0 && (
            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Signed by {report.signatures[0].user?.fullName || report.signatures[0].user?.first_name}</span>
            </div>
          )}
        </div>
      )}

      {/* Report Preview */}
      {(report?.report_content || report?.reportContent) ? (
        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 ring-1 ring-black/5">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs font-mono text-gray-500 print:hidden">
            <span>A4 Document Preview</span>
            <span>100% Scale</span>
          </div>
          <iframe
            srcDoc={report.report_content || report.reportContent}
            className="w-full bg-white"
            style={{ height: '1122px', border: 'none' }} // A4 height approx at 96 DPI
            title="Lab Report Preview"
          />
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
            <FileText className="w-10 h-10 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No Report Generated Yet</h3>
          <p className="text-gray-500 mt-2 max-w-sm mb-6">
            The clinical laboratory report for this order hasn't been generated. Click the button below to compile the results into a PDF.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generateReport.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-70 disabled:shadow-none"
          >
            {generateReport.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            Generate Lab Report Now
          </button>
        </div>
      )}

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Sign Report</h2>
            <p className="text-sm text-gray-500 mb-5">Electronic signature per 21 CFR Part 11</p>
            <input
              type="password"
              value={signPassword}
              onChange={e => setSignPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-5 outline-none transition-all"
              placeholder="Enter your password"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowSignModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSign} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm shadow-emerald-600/20">
                <ShieldCheck className="w-4 h-4" /> Sign Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Modal */}
      {showDeliverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Deliver Report</h2>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Channel</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'email', label: 'Email', icon: Mail },
                  { value: 'sms', label: 'SMS', icon: MessageSquare },
                  { value: 'print', label: 'Print', icon: Printer },
                ].map(ch => (
                  <button
                    key={ch.value}
                    onClick={() => setDeliverChannel(ch.value)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                      deliverChannel === ch.value 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <ch.icon className="w-5 h-5" />
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Information</label>
              <input
                type="text"
                value={deliverRecipient}
                onChange={e => setDeliverRecipient(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder={deliverChannel === 'email' ? 'doctor@hospital.com' : '+91-9876543210'}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeliverModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleDeliver} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20">
                Send Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
