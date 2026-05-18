
// 'use client';

// import { useState } from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';
// import { useReport, useGenerateReport } from '@/hooks/use-results';
// import { useOrder } from '@/hooks/use-orders';
// import { api } from '@/lib/api';
// import { toast } from 'sonner';
// import {
//   ArrowLeft, FileText, Download, Send, ShieldCheck,
//   Loader2, Printer, Mail, MessageSquare, CheckCircle
// } from 'lucide-react';
// import { usePermissions } from '@/hooks/permissions/usePermissions';
// import { PermissionDenied } from '@/components/PermissionGuard';

// export default function ReportPage() {
//           // Use permission hook
//       const {
//         canCreate,
//         canRead,
//         canUpdate,
//         canDelete,
//         isAdmin
//       } = usePermissions();
    
//       // Check if user has read access to Physicians
//       if (!canRead('Worklist')) {
//         return <PermissionDenied resource="Worklist" action="read" />;
//       }
//   const { id: orderId } = useParams();
//   const { data: order } = useOrder(orderId);
//   const generateReport = useGenerateReport(orderId);

//   const [reportId, setReportId] = useState(null);
//   const [signPassword, setSignPassword] = useState('');
//   const [showSignModal, setShowSignModal] = useState(false);
//   const [showDeliverModal, setShowDeliverModal] = useState(false);
//   const [deliverChannel, setDeliverChannel] = useState('email');
//   const [deliverRecipient, setDeliverRecipient] = useState('');

//   const { data: report } = useReport(reportId || order?.reports?.[0]?.id || '');

//   const handleGenerate = async () => {
//     try {
//       const result = await generateReport.mutateAsync();
//       setReportId(result.id);
//       toast.success('Report generated successfully');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to generate report');
//     }
//   };

//   const handleSign = async () => {
//     // if (!report?.id) return;
//     // try {
//     //   await api.post(`/reports/${report.id}/sign`, {
//     //     password: signPassword,
//     //     meaning: 'approved',
//     //   });
//     //   toast.success('Report signed successfully');
//     //   setShowSignModal(false);
//     //   setSignPassword('');
//     // } catch (err: any) {
//     //   toast.error(err.response?.data?.message || 'Signing failed');
//     // }
//   };

//   const handleDeliver = async () => {
//     // if (!report?.id) return;
//     // try {
//     //   await api.post(`/reports/${report.id}/deliver`, {
//     //     channel: deliverChannel,
//     //     recipient: deliverRecipient,
//     //   });
//     //   toast.success(`Report sent via ${deliverChannel}`);
//     //   setShowDeliverModal(false);
//     // } catch (err: any) {
//     //   toast.error(err.response?.data?.message || 'Delivery failed');
//     // }
//   };

//   const patient = order?.patient;

//   return (
//     <div className="space-y-5 animate-in">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <Link href={`/dashboard/results/${orderId}`} className="p-1.5 rounded-lg hover:bg-gray-100">
//             <ArrowLeft className="w-5 h-5 text-gray-500" />
//           </Link>
//           <div>
//             <h1 className="text-xl font-bold text-gray-900">Lab Report</h1>
//             <p className="text-sm text-gray-500">
//               {order?.orderNumber} · {patient?.firstName} {patient?.lastName} ({patient?.mrn})
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           {/* {!report?.reportContent && (
//             <button
//               onClick={handleGenerate}
//               disabled={generateReport.isPending}
//               className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
//             >
//               {generateReport.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
//               Generate Report
//             </button>
//           )}
//           {report?.reportContent && (
//             <>
//               <button
//                 onClick={() => setShowSignModal(true)}
//                 className="flex items-center gap-2 px-3 py-1.5 border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50"
//               >
//                 <ShieldCheck className="w-4 h-4" /> Sign
//               </button>
//               <button
//                 onClick={() => setShowDeliverModal(true)}
//                 className="flex items-center gap-2 px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50"
//               >
//                 <Send className="w-4 h-4" /> Deliver
//               </button>
//               <button
//                 onClick={() => {
//                   const w = window.open('', '_blank');
//                   if (w) { w.document.write(report.reportContent); w.document.close(); w.print(); }
//                 }}
//                 className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
//               >
//                 <Printer className="w-4 h-4" /> Print
//               </button>
//             </>
//           )} */}
//         </div>
//       </div>

//       {/* Report Metadata */}
//       {report && (
//         <div className="card p-4 flex items-center gap-6 text-sm">
//           <div>
//             <span className="text-gray-400">Status: </span>
//             <span className={`badge-status ${report.status === 'final' ? 'badge-verified' : 'badge-registered'}`}>{report.status}</span>
//           </div>
//           <div><span className="text-gray-400">Version: </span><span className="font-medium">{report.version}</span></div>
//           {report.generatedAt && (
//             <div><span className="text-gray-400">Generated: </span>{new Date(report.generatedAt).toLocaleString()}</div>
//           )}
//           {report.signatures?.length > 0 && (
//             <div className="flex items-center gap-1">
//               <CheckCircle className="w-4 h-4 text-green-500" />
//               <span>Signed by {report.signatures[0].user?.fullName}</span>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Report Preview */}
//       {report?.reportContent ? (
//         <div className="card overflow-hidden">
//           <iframe
//             srcDoc={report.reportContent}
//             className="w-full border-0"
//             style={{ minHeight: '800px' }}
//             title="Lab Report Preview"
//           />
//         </div>
//       ) : (
//         <div className="card p-12 text-center">
//           <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//           <p className="text-gray-500 font-medium">No report generated yet</p>
//           <p className="text-sm text-gray-400 mt-1">Click "Generate Report" to create the lab report for this order</p>
//         </div>
//       )}

//       {/* Sign Modal */}
//       {showSignModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in">
//             <h2 className="text-lg font-bold text-gray-900 mb-1">Sign Report</h2>
//             <p className="text-sm text-gray-500 mb-4">Electronic signature per 21 CFR Part 11</p>
//             <input
//               type="password"
//               value={signPassword}
//               onChange={e => setSignPassword(e.target.value)}
//               className="input-lab mb-4"
//               placeholder="Enter your password"
//               autoFocus
//             />
//             <div className="flex justify-end gap-2">
//               <button onClick={() => setShowSignModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
//               <button onClick={handleSign} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
//                 <ShieldCheck className="w-4 h-4 inline mr-1" /> Sign Report
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Deliver Modal */}
//       {showDeliverModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Deliver Report</h2>
//             <div className="mb-3">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
//               <div className="grid grid-cols-3 gap-2">
//                 {[
//                   { value: 'email', label: 'Email', icon: Mail },
//                   { value: 'sms', label: 'SMS', icon: MessageSquare },
//                   { value: 'print', label: 'Print', icon: Printer },
//                 ].map(ch => (
//                   <button
//                     key={ch.value}
//                     onClick={() => setDeliverChannel(ch.value)}
//                     className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm transition-all ${
//                       deliverChannel === ch.value ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
//                     }`}
//                   >
//                     <ch.icon className="w-4 h-4" />
//                     {ch.label}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
//               <input
//                 type="text"
//                 value={deliverRecipient}
//                 onChange={e => setDeliverRecipient(e.target.value)}
//                 className="input-lab"
//                 placeholder={deliverChannel === 'email' ? 'doctor@hospital.com' : '+91-9876543210'}
//               />
//             </div>
//             <div className="flex justify-end gap-2">
//               <button onClick={() => setShowDeliverModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
//               <button onClick={handleDeliver} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
//                 Send Report
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import React from 'react'

function page() {
  return (
    <div>
      
    </div>
  )
}

export default page
