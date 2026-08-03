// // 'use client';

// // import { useState, useEffect, useRef } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { Scanner } from '@yudiel/react-qr-scanner';
// // import 'barcode-detector/polyfill';
// // import {
// //   X,
// //   Calendar,
// //   User,
// //   FileText,
// //   Activity,
// //   AlertCircle,
// //   CheckCircle,
// //   Clock,
// //   Loader2,
// //   TestTube,
// //   Beaker,
// //   ChevronRight,
// //   ClipboardList,
// //   Phone,
// //   Mail,
// //   Hash,
// //   Printer,
// //   Download,
// //   Eye,
// //   Syringe,
// //   FlaskConical,
// //   Microscope,
// //   AlertTriangle,
// //   CheckSquare,
// //   Hourglass,
// //   TrendingUp,
// //   Package,
// //   Calendar as CalendarIcon,
// //   CreditCard,
// //   QrCode,
// //   Scan,
// //   Camera,
// //   CameraOff
// // } from 'lucide-react';
// // import { api } from '@/lib/api';

// // const getStatusColor = (status) => {
// //   const statusMap = {
// //     collected: 'bg-blue-100 text-blue-700 border-blue-200',
// //     received: 'bg-indigo-100 text-indigo-700 border-indigo-200',
// //     processing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
// //     completed: 'bg-green-100 text-green-700 border-green-200',
// //     rejected: 'bg-red-100 text-red-700 border-red-200',
// //     verified: 'bg-purple-100 text-purple-700 border-purple-200',
// //     reported: 'bg-teal-100 text-teal-700 border-teal-200',
// //   };
// //   return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
// // };

// // const getTestStatusBadge = (status) => {
// //   const statusMap = {
// //     pending: { bg: 'bg-gray-100', text: 'text-gray-600', icon: Hourglass },
// //     tech_verified: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Loader2 },
// //     path_verified: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle },
// //     reported: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckSquare },
// //     cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
// //   };
// //   const config = statusMap[status?.toLowerCase()] || statusMap.pending;
// //   const Icon = config.icon;
// //   return (
// //     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
// //       <Icon className="w-3 h-3" />
// //       {status?.replace(/_/g, ' ').toUpperCase()}
// //     </span>
// //   );
// // };

// // const getPriorityBadge = (priority) => {
// //   const priorityMap = {
// //     stat: 'bg-red-100 text-red-700',
// //     urgent: 'bg-orange-100 text-orange-700',
// //     routine: 'bg-blue-100 text-blue-700',
// //   };
// //   return <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityMap[priority?.toLowerCase()] || priorityMap.routine}`}>
// //     {priority || 'Routine'}
// //   </span>;
// // };

// // export default function SpecimenDetailsPopup({ specimen, isOpen, onClose, onViewOrder, onViewPatient }) {
// //   const router = useRouter();
// //   const [activeTab, setActiveTab] = useState('details');
// //   const [isAnimating, setIsAnimating] = useState(false);
// //   const [qrCodeUrl, setQrCodeUrl] = useState(null);
// //   const [isGeneratingQr, setIsGeneratingQr] = useState(false);
// //   const [qrError, setQrError] = useState(null);
// //   const [isScanning, setIsScanning] = useState(false);
// //   const [cameraError, setCameraError] = useState(null);
// //   const [manualBarcode, setManualBarcode] = useState('');
// //   const popupRef = useRef(null);

// //   useEffect(() => {
// //     if (specimen && specimen.qr_code) {
// //       if (specimen.qr_code.has_qr && specimen.qr_code.url) {
// //         setQrCodeUrl(specimen.qr_code.url);
// //       } else {
// //         setQrCodeUrl(null);
// //       }
// //       setQrError(null);
// //     }
// //   }, [specimen]);

// //   useEffect(() => {
// //     if (isOpen) {
// //       setIsAnimating(true);
// //       document.body.style.overflow = 'hidden';

// //       const handleEsc = (e) => {
// //         if (e.key === 'Escape') handleClose();
// //       };
// //       document.addEventListener('keydown', handleEsc);

// //       return () => {
// //         document.removeEventListener('keydown', handleEsc);
// //         setIsScanning(false);
// //       };
// //     } else {
// //       document.body.style.overflow = 'unset';
// //       setIsScanning(false);
// //     }
// //   }, [isOpen]);

// //   if (!isOpen || !specimen) return null;

// //   const handleClose = () => {
// //     setIsAnimating(false);
// //     setIsScanning(false);
// //     setTimeout(onClose, 200);
// //   };

// //   const handlePopupClick = (e) => {
// //     e.stopPropagation();
// //   };

// //   //  New scanner success handler for @yudiel/react-qr-scanner
// //   const handleScanSuccess = (detectedCodes) => {
// //     if (detectedCodes && detectedCodes.length > 0) {
// //       const scannedData = detectedCodes[0].rawValue;
// //       console.log("Scanned:", scannedData);

// //       try {
// //         let qrData;
// //         try {
// //           qrData = JSON.parse(scannedData);
// //         } catch {
// //           qrData = { barcode: scannedData };
// //         }

// //         const barcode = qrData.barcode || scannedData;
// //         const specimenId = qrData.id;

// //         // Vibrate on success
// //         if (window.navigator?.vibrate) {
// //           window.navigator.vibrate(200);
// //         }

// //         setIsScanning(false);

// //         // Navigate to the scanned specimen
// //         setTimeout(() => {        
// //           if (specimenId) {
// //             router.push(`/dashboard/specimens`);
// //           }
// //           handleClose();
// //         }, 500);

// //       } catch (error) {
// //         console.error("Error parsing QR:", error);
// //         setCameraError("Invalid QR code format");
// //         setTimeout(() => setCameraError(null), 3000);
// //       }
// //     }
// //   };

// //   //  Scanner error handler
// //   const handleScanError = (error) => {
// //     console.error("Scanner error:", error);
// //     setCameraError("Could not access camera. Please check permissions.");
// //     setTimeout(() => setCameraError(null), 5000);
// //   };

// //   const handleManualSearch = () => {
// //     if (manualBarcode.trim()) {
// //       router.push(`/specimens?search=${manualBarcode.trim()}`);
// //       handleClose();
// //     }
// //   };

// //   const handleGenerateQR = async () => {
// //     if (!specimen.qr_code?.can_generate) return;

// //     setIsGeneratingQr(true);
// //     setQrError(null);

// //     try {
// //       const response = await api.post(`/specimens/${specimen.id}/generate-qr`);

// //       if (response.data.success && response.data.data.qr_code_url) {
// //         setQrCodeUrl(response.data.data.qr_code_url);
// //         if (specimen.qr_code) {
// //           specimen.qr_code.has_qr = true;
// //           specimen.qr_code.url = response.data.data.qr_code_url;
// //         }
// //       } else {
// //         throw new Error('Invalid response from server');
// //       }
// //     } catch (error) {
// //       console.error('Error generating QR code:', error);
// //       setQrError(error.response?.data?.message || error.message);
// //     } finally {
// //       setIsGeneratingQr(false);
// //     }
// //   };

// //   const handleDownloadQR = () => {
// //     if (!qrCodeUrl) return;

// //     const link = document.createElement('a');
// //     link.download = `qr_${specimen.barcode}.png`;
// //     link.href = qrCodeUrl;
// //     link.click();
// //   };

// //   const handlePrintQR = () => {
// //     if (!qrCodeUrl) return;

// //     const printWindow = window.open('', '_blank');
// //     printWindow.document.write(`
// //       <html>
// //         <head>
// //           <title>QR Code - ${specimen.barcode}</title>
// //           <style>
// //             body {
// //               display: flex;
// //               justify-content: center;
// //               align-items: center;
// //               height: 100vh;
// //               font-family: Arial, sans-serif;
// //             }
// //             .container {
// //               text-align: center;
// //             }
// //             img {
// //               max-width: 300px;
// //               margin: 20px;
// //             }
// //             .info {
// //               margin-top: 20px;
// //               font-size: 14px;
// //               color: #666;
// //             }
// //           </style>
// //         </head>
// //         <body>
// //           <div class="container">
// //             <img src="${qrCodeUrl}" alt="QR Code" />
// //             <div class="info">
// //               <strong>Barcode:</strong> ${specimen.barcode}<br/>
// //               <strong>Specimen Type:</strong> ${specimen.specimen_type}<br/>
// //               <strong>Patient:</strong> ${specimen.patient?.name || 'N/A'}
// //             </div>
// //           </div>
// //         </body>
// //       </html>
// //     `);
// //     printWindow.document.close();
// //     printWindow.print();
// //   };

// //   const formatDate = (date) => {
// //     if (!date) return '—';
// //     return new Date(date).toLocaleString('en-IN', {
// //       day: '2-digit',
// //       month: 'short',
// //       year: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit',
// //     });
// //   };

// //   const formatDateOnly = (date) => {
// //     if (!date) return '—';
// //     return new Date(date).toLocaleDateString('en-IN', {
// //       day: '2-digit',
// //       month: 'short',
// //       year: 'numeric',
// //     });
// //   };

// //   const tests = specimen.tests || [];
// //   const testsSummary = specimen.tests_summary || { total: 0, completed: 0, pending: 0, completion_percentage: 0 };
// //   const patient = specimen.patient || {};
// //   const order = specimen.order || {};

// //   const timeline = [
// //     { status: 'Specimen Created', date: specimen.created_at, icon: Package, completed: !!specimen.created_at },
// //     { status: 'Specimen Collected', date: specimen.collection_time, icon: TestTube, completed: !!specimen.collection_time },
// //     { status: 'Specimen Received', date: specimen.details?.received_time, icon: Beaker, completed: specimen.status === 'received' || specimen.status === 'processing' || specimen.status === 'completed' },
// //     { status: 'Processing', date: specimen.processing_at, icon: Loader2, completed: specimen.status === 'processing' || specimen.status === 'completed' },
// //     { status: 'Completed', date: specimen.completed_at, icon: CheckCircle, completed: specimen.status === 'completed' },
// //   ];

// //   return (
// //     <>
// //       <div
// //         className={`fixed inset-0 z-50 !m-0 transition-all duration-300 ${
// //           isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'
// //         }`}
// //         onClick={handleClose}
// //       />

// //       <div
// //         ref={popupRef}
// //         onClick={handlePopupClick}
// //         className={`fixed right-0 top-0 h-full w-full mb-4 !m-0 sm:max-w-2xl lg:max-w-3xl bg-white shadow-2xl z-50 transition-transform duration-300 ease-out ${
// //           isAnimating ? 'translate-x-0' : 'translate-x-full'
// //         }`}
// //       >
// //         <div className="sticky !mt-0 bg-[#1b4dff] text-white">
// //           <div className="flex items-center justify-between p-5 border-b border-white/10">
// //             <div className="flex items-center gap-3">
// //               <div className="p-2 bg-white/10 rounded-xl">
// //                 <TestTube className="w-5 h-5" />
// //               </div>
// //               <div>
// //                 <h2 className="text-lg font-semibold">Specimen Details</h2>
// //                 <p className="text-xs text-white/70 font-mono mt-0.5">{specimen.barcode}</p>
// //               </div>
// //             </div>
// //             <button
// //               onClick={(e) => {
// //                 e.stopPropagation();
// //                 handleClose();
// //               }}
// //               className="p-2 hover:bg-white/10 rounded-lg transition-colors"
// //             >
// //               <X className="w-5 h-5" />
// //             </button>
// //           </div>

// //           <div className="px-5 py-3 bg-black/20 flex flex-wrap items-center gap-3 text-sm">
// //             <div className="flex items-center gap-2">
// //               <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.status)} bg-white/20`}>
// //                 {specimen.status?.toUpperCase()}
// //               </span>
// //             </div>
// //             <div className="w-px h-4 bg-white/20" />
// //             <div className="flex items-center gap-2">
// //               <FlaskConical className="w-3.5 h-3.5 text-white/70" />
// //               <span className="text-white/90 text-xs">{specimen.specimen_type?.toUpperCase()}</span>
// //             </div>
// //             <div className="w-px h-4 bg-white/20" />
// //             <div className="flex items-center gap-2">
// //               <Calendar className="w-3.5 h-3.5 text-white/70" />
// //               <span className="text-white/80 text-xs">{formatDateOnly(specimen.collection_time)}</span>
// //             </div>
// //             <div className="w-px h-4 bg-white/20" />
// //             <div className="flex items-center gap-2">
// //               <QrCode className="w-3.5 h-3.5 text-white/70" />
// //               <span className="text-white/80 text-xs">
// //                 {specimen.qr_code?.has_qr ? 'QR Available' : 'QR Not Generated'}
// //               </span>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
// //           <div className="flex flex-wrap gap-4 text-sm">
// //             <div className="flex items-center gap-2">
// //               <TestTube className="w-4 h-4 text-blue-500" />
// //               <span className="text-slate-600">Tests:</span>
// //               <span className="font-semibold text-slate-800">{testsSummary.total}</span>
// //               <span className="text-xs text-green-600">({testsSummary.completed} completed)</span>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <TrendingUp className="w-4 h-4 text-emerald-500" />
// //               <span className="text-slate-600">Completion:</span>
// //               <span className="font-semibold text-slate-800">{testsSummary.completion_percentage}%</span>
// //             </div>
// //             <div className="flex items-center gap-2">
// //               <Activity className="w-4 h-4 text-purple-500" />
// //               <span className="text-slate-600">Overall:</span>
// //               <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.overall_status)}`}>
// //                 {specimen.overall_status?.toUpperCase()}
// //               </span>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="border-b border-slate-200 bg-slate-50 px-5">
// //           <div className="flex gap-1 overflow-x-auto">
// //             <button
// //               onClick={() => setActiveTab('details')}
// //               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
// //                 activeTab === 'details'
// //                   ? 'border-emerald-500 text-emerald-600'
// //                   : 'border-transparent text-slate-500 hover:text-slate-700'
// //               }`}
// //             >
// //               <FileText className="w-4 h-4" />
// //               Details
// //             </button>

// //             <button
// //               onClick={() => setActiveTab('tests')}
// //               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
// //                 activeTab === 'tests'
// //                   ? 'border-emerald-500 text-emerald-600'
// //                   : 'border-transparent text-slate-500 hover:text-slate-700'
// //               }`}
// //             >
// //               <Microscope className="w-4 h-4" />
// //               Tests
// //               <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-200 text-slate-600">
// //                 {tests.length}
// //               </span>
// //             </button>

// //             <button
// //               onClick={() => setActiveTab('timeline')}
// //               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
// //                 activeTab === 'timeline'
// //                   ? 'border-emerald-500 text-emerald-600'
// //                   : 'border-transparent text-slate-500 hover:text-slate-700'
// //               }`}
// //             >
// //               <CalendarIcon className="w-4 h-4" />
// //               Timeline
// //             </button>

// //             <button
// //               onClick={() => setActiveTab('qrcode')}
// //               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
// //                 activeTab === 'qrcode'
// //                   ? 'border-emerald-500 text-emerald-600'
// //                   : 'border-transparent text-slate-500 hover:text-slate-700'
// //               }`}
// //             >
// //               <QrCode className="w-4 h-4" />
// //               QR Code
// //             </button>
// //           </div>
// //         </div>

// //         <div className="overflow-y-auto h-[calc(100vh-220px)] p-5">
// //           {activeTab === 'details' && (
// //             <div className="space-y-5">
// //               {/* Specimen Information */}
// //               <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
// //                 <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
// //                   <TestTube className="w-4 h-4" />
// //                   Specimen Information
// //                 </h3>
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                   <div>
// //                     <label className="text-xs text-emerald-600">Barcode</label>
// //                     <p className="text-sm font-mono font-semibold text-slate-800">{specimen.barcode}</p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-emerald-600">Specimen Type</label>
// //                     <p className="text-sm font-medium text-slate-800 capitalize">{specimen.specimen_type}</p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-emerald-600">Status</label>
// //                     <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.status)}`}>
// //                       {specimen.status?.toUpperCase()}
// //                     </span></p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-emerald-600">Overall Status</label>
// //                     <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.overall_status)}`}>
// //                       {specimen.overall_status?.toUpperCase()}
// //                     </span></p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-emerald-600">Collection Time</label>
// //                     <p className="text-sm text-slate-800 flex items-center gap-1">
// //                       <Calendar className="w-3 h-3" />
// //                       {formatDate(specimen.collection_time)}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-emerald-600">Received Time</label>
// //                     <p className="text-sm text-slate-800">
// //                       {specimen.details?.received_time ? formatDate(specimen.details.received_time) : '—'}
// //                     </p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-emerald-600">Condition</label>
// //                     <p className="text-sm capitalize">{specimen.condition || '—'}</p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-emerald-600">Has Results</label>
// //                     <p className="text-sm">
// //                       {specimen.has_results ? (
// //                         <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yes</span>
// //                       ) : (
// //                         <span className="text-gray-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No</span>
// //                       )}
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Patient Information */}
// //               <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onViewPatient && onViewPatient(patient.id)}>
// //                 <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
// //                   <User className="w-4 h-4" />
// //                   Patient Information
// //                   <span className="text-xs text-blue-500 ml-auto">Click to view →</span>
// //                 </h3>
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                   <div>
// //                     <label className="text-xs text-slate-500">Name</label>
// //                     <p className="text-sm font-medium text-slate-800">{patient.name || '—'}</p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-slate-500">MRN</label>
// //                     <p className="text-sm font-mono text-slate-800">{patient.mrn || '—'}</p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-slate-500">Gender</label>
// //                     <p className="text-sm text-slate-800 capitalize">{patient.gender || '—'}</p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-slate-500">Age</label>
// //                     <p className="text-sm text-slate-800">{patient.age || '—'} years</p>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Order Information */}
// //               <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onViewOrder && onViewOrder(order.id)}>
// //                 <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
// //                   <ClipboardList className="w-4 h-4" />
// //                   Order Information
// //                   <span className="text-xs text-blue-500 ml-auto">Click to view →</span>
// //                 </h3>
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                   <div>
// //                     <label className="text-xs text-slate-500">Order Number</label>
// //                     <p className="text-sm font-mono text-slate-800">{order.order_number || '—'}</p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-slate-500">Order Type</label>
// //                     <p className="text-sm text-slate-800 capitalize">{order.order_type || '—'}</p>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-slate-500">Priority</label>
// //                     <div>{getPriorityBadge(order.priority)}</div>
// //                   </div>
// //                   <div>
// //                     <label className="text-xs text-slate-500">Order Status</label>
// //                     <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
// //                       {order.status?.toUpperCase()}
// //                     </span></p>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Tests Summary */}
// //               <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
// //                 <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
// //                   <Activity className="w-4 h-4" />
// //                   Tests Summary
// //                 </h3>
// //                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
// //                   <div className="bg-white rounded-lg p-3">
// //                     <div className="text-2xl font-bold text-slate-800">{testsSummary.total}</div>
// //                     <div className="text-xs text-slate-500">Total Tests</div>
// //                   </div>
// //                   <div className="bg-white rounded-lg p-3">
// //                     <div className="text-2xl font-bold text-green-600">{testsSummary.completed}</div>
// //                     <div className="text-xs text-slate-500">Completed</div>
// //                   </div>
// //                   <div className="bg-white rounded-lg p-3">
// //                     <div className="text-2xl font-bold text-yellow-600">{testsSummary.pending}</div>
// //                     <div className="text-xs text-slate-500">Pending</div>
// //                   </div>
// //                   <div className="bg-white rounded-lg p-3">
// //                     <div className="text-2xl font-bold text-emerald-600">{testsSummary.completion_percentage}%</div>
// //                     <div className="text-xs text-slate-500">Completion</div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           )}

// //           {activeTab === 'tests' && (
// //             <div className="space-y-3">
// //               {tests.length === 0 ? (
// //                 <div className="text-center py-12">
// //                   <Microscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
// //                   <p className="text-gray-400">No tests found for this specimen</p>
// //                 </div>
// //               ) : (
// //                 tests.map((test, index) => (
// //                   <div
// //                     key={test.order_test_id}
// //                     className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all"
// //                   >
// //                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
// //                       <div className="flex-1">
// //                         <div className="flex items-center gap-2 mb-2">
// //                           <span className="font-semibold text-sm text-slate-800">{test.test_name}</span>
// //                           <span className="text-xs text-slate-400">#{index + 1}</span>
// //                         </div>
// //                         <div className="flex flex-wrap gap-3 text-xs">
// //                           <div className="flex items-center gap-1">
// //                             <span className="text-slate-500">Test Status:</span>
// //                             {getTestStatusBadge(test.test_status)}
// //                           </div>
// //                           <div className="flex items-center gap-1">
// //                             <span className="text-slate-500">Result Type:</span>
// //                             <span className="text-slate-700 capitalize">{test.result_type}</span>
// //                           </div>
// //                           <div className="flex items-center gap-1">
// //                             <span className="text-slate-500">Result Status:</span>
// //                             <span className="text-slate-700 capitalize">{test.result_status}</span>
// //                           </div>
// //                         </div>
// //                         {test.latest_result && (
// //                           <div className="mt-2 p-2 bg-white rounded-lg">
// //                             <span className="text-xs font-medium text-slate-600">Latest Result:</span>
// //                             <span className="text-sm font-semibold text-slate-800 ml-2">{test.latest_result}</span>
// //                           </div>
// //                         )}
// //                       </div>
// //                       <div className="flex items-center gap-2">
// //                         {test.test_status === 'reported' && (
// //                           <button className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
// //                             View Report
// //                           </button>
// //                         )}
// //                         <ChevronRight className="w-4 h-4 text-slate-400" />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))
// //               )}
// //             </div>
// //           )}

// //           {activeTab === 'timeline' && (
// //             <div className="relative">
// //               <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
// //               <div className="space-y-6">
// //                 {timeline.map((item, index) => {
// //                   const Icon = item.icon;
// //                   return (
// //                     <div key={index} className="relative flex gap-4">
// //                       <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
// //                         item.completed
// //                           ? 'bg-green-100 text-green-600'
// //                           : 'bg-slate-100 text-slate-400'
// //                       }`}>
// //                         <Icon className={`w-5 h-5 ${item.completed ? '' : 'opacity-50'}`} />
// //                       </div>
// //                       <div className="flex-1 pb-2">
// //                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
// //                           <h4 className={`font-medium text-sm ${item.completed ? 'text-slate-800' : 'text-slate-400'}`}>
// //                             {item.status}
// //                           </h4>
// //                           {item.date && (
// //                             <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
// //                           )}
// //                         </div>
// //                         {item.completed && item.date && (
// //                           <p className="text-xs text-slate-500 mt-1">
// //                             Completed on {formatDate(item.date)}
// //                           </p>
// //                         )}
// //                       </div>
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             </div>
// //           )}

// //           {activeTab === 'qrcode' && (
// //             <div className="space-y-5">
// //               {/* Scanner Section */}
// //               <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-100">
// //                 <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
// //                   <Scan className="w-4 h-4" />
// //                   Scan QR Code
// //                 </h3>

// //                 {!isScanning ? (
// //                   <div className="text-center">
// //                     <button
// //                       onClick={() => setIsScanning(true)}
// //                       className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
// //                     >
// //                       <Camera className="w-4 h-4" />
// //                       Start Scanning
// //                     </button>
// //                     <p className="text-xs text-gray-500 mt-2">
// //                       Position QR code within the frame to scan
// //                     </p>
// //                     <p className="text-xs text-gray-400 mt-1">
// //                       Make sure you have granted camera permissions
// //                     </p>
// //                   </div>
// //                 ) : (
// //                   <div>
// //                     <div className="relative">
// //                       <Scanner
// //                         onScan={handleScanSuccess}
// //                         onError={handleScanError}
// //                         constraints={{ facingMode: "environment" }}
// //                         scanDelay={500}
// //                         style={{ width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}
// //                       />
// //                       {/* Scanning guide overlay */}
// //                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
// //                         <div className="border-2 border-green-500 rounded-lg w-48 h-48"></div>
// //                       </div>
// //                     </div>

// //                     <div className="text-center mt-3">
// //                       <button
// //                         onClick={() => setIsScanning(false)}
// //                         className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
// //                       >
// //                         Stop Scanning
// //                       </button>
// //                     </div>
// //                     <p className="text-xs text-center text-green-600 mt-2">
// //                       📷 Camera active. Position QR code in the green frame.
// //                     </p>
// //                   </div>
// //                 )}

// //                 {cameraError && (
// //                   <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
// //                     <p className="text-sm text-red-700 flex items-center gap-2">
// //                       <AlertCircle className="w-4 h-4" />
// //                       {cameraError}
// //                     </p>
// //                   </div>
// //                 )}

// //                 {/* Manual Barcode Input */}
// //                 <div className="mt-4 pt-4 border-t border-green-200">
// //                   <p className="text-xs text-gray-500 text-center mb-2">
// //                     Or enter barcode manually:
// //                   </p>
// //                   <div className="flex gap-2">
// //                     <input
// //                       type="text"
// //                       placeholder="Enter barcode"
// //                       value={manualBarcode}
// //                       onChange={(e) => setManualBarcode(e.target.value)}
// //                       onKeyPress={(e) => {
// //                         if (e.key === 'Enter') {
// //                           handleManualSearch();
// //                         }
// //                       }}
// //                       className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
// //                     />
// //                     <button
// //                       onClick={handleManualSearch}
// //                       className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
// //                     >
// //                       Search
// //                     </button>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* QR Code Display Section */}
// //               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
// //                 <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
// //                   <QrCode className="w-5 h-5" />
// //                   Specimen QR Code
// //                 </h3>

// //                 <div className="flex flex-col items-center justify-center space-y-5">
// //                   <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200">
// //                     {qrCodeUrl ? (
// //                       <div className="text-center">
// //                         <img 
// //                           src={qrCodeUrl} 
// //                           alt={`QR Code for ${specimen.barcode}`}
// //                           className="w-48 h-48 mx-auto mb-3"
// //                         />
// //                         <p className="text-xs text-gray-500 font-mono mt-2">{specimen.barcode}</p>
// //                         <p className="text-xs text-green-600 mt-1">✓ QR Code Ready</p>
// //                       </div>
// //                     ) : (
// //                       <div className="w-48 h-48 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
// //                         {isGeneratingQr ? (
// //                           <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
// //                         ) : (
// //                           <>
// //                             <QrCode className="w-12 h-12 text-gray-400 mb-2" />
// //                             <p className="text-xs text-gray-500 text-center px-4">
// //                               {specimen.qr_code?.has_qr === false 
// //                                 ? "Click 'Generate QR Code' to create" 
// //                                 : "No QR code available"}
// //                             </p>
// //                           </>
// //                         )}
// //                       </div>
// //                     )}
// //                   </div>

// //                   <div className="text-center space-y-2">
// //                     <div className="flex items-center gap-2 justify-center">
// //                       <span className={`px-2 py-1 rounded text-xs font-medium ${
// //                         qrCodeUrl ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
// //                       }`}>
// //                         {qrCodeUrl ? '✓ QR Code Ready' : '⚠ QR Code Pending'}
// //                       </span>
// //                     </div>
// //                     <p className="text-sm text-gray-600 max-w-md">
// //                       Scan this QR code to quickly access specimen information, track status, and view results.
// //                     </p>
// //                   </div>

// //                   <div className="flex flex-wrap gap-3 justify-center">
// //                     {!qrCodeUrl && specimen.qr_code?.can_generate && (
// //                       <button
// //                         onClick={handleGenerateQR}
// //                         disabled={isGeneratingQr}
// //                         className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
// //                       >
// //                         {isGeneratingQr ? (
// //                           <>
// //                             <Loader2 className="w-4 h-4 animate-spin" />
// //                             Generating...
// //                           </>
// //                         ) : (
// //                           <>
// //                             <QrCode className="w-4 h-4" />
// //                             Generate QR Code
// //                           </>
// //                         )}
// //                       </button>
// //                     )}

// //                     {qrCodeUrl && (
// //                       <>
// //                         <button
// //                           onClick={handleDownloadQR}
// //                           className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
// //                         >
// //                           <Download className="w-4 h-4" />
// //                           Download
// //                         </button>
// //                         <button
// //                           onClick={handlePrintQR}
// //                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
// //                         >
// //                           <Printer className="w-4 h-4" />
// //                           Print
// //                         </button>
// //                         <button
// //                           onClick={() => window.open(qrCodeUrl, '_blank')}
// //                           className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
// //                         >
// //                           <Eye className="w-4 h-4" />
// //                           View Full Size
// //                         </button>
// //                       </>
// //                     )}
// //                   </div>

// //                   {qrError && (
// //                     <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
// //                       <p className="text-sm text-red-600 flex items-center gap-2">
// //                         <AlertCircle className="w-4 h-4" />
// //                         {qrError}
// //                       </p>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
// //                 <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
// //                   <AlertCircle className="w-4 h-4" />
// //                   How to Use
// //                 </h4>
// //                 <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
// //                   <li>Click "Start Scanning" and grant camera permission when prompted</li>
// //                   <li>Position the QR code within the green frame for automatic detection</li>
// //                   <li>Make sure the QR code is well-lit and clearly visible</li>
// //                   <li>The scanner will automatically detect and process the QR code</li>
// //                   <li>You can also manually enter the barcode using the input field below</li>
// //                   <li>Print and attach QR code label to specimen container for tracking</li>
// //                 </ul>
// //               </div>
// //             </div>
// //           )}
// //         </div>

// //       </div>
// //     </>
// //   );
// // }








// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { Scanner } from '@yudiel/react-qr-scanner';
// import 'barcode-detector/polyfill';
// import {
//   X,
//   Calendar,
//   User,
//   FileText,
//   Activity,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   Loader2,
//   TestTube,
//   Beaker,
//   ChevronRight,
//   ClipboardList,
//   Phone,
//   Mail,
//   Hash,
//   Printer,
//   Download,
//   Eye,
//   Syringe,
//   FlaskConical,
//   Microscope,
//   AlertTriangle,
//   CheckSquare,
//   Hourglass,
//   TrendingUp,
//   Package,
//   Calendar as CalendarIcon,
//   CreditCard,
//   QrCode,
//   Scan,
//   Camera,
//   CameraOff
// } from 'lucide-react';
// import { api } from '@/lib/api';
// import { toast } from 'sonner';

// const getStatusColor = (status) => {
//   const statusMap = {
//     collected: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
//     received: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
//     processing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
//     completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
//     rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
//     verified: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
//     reported: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
//   };
//   return statusMap[status?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
// };

// const getTestStatusBadge = (status) => {
//   const statusMap = {
//     pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: Hourglass },
//     tech_verified: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Loader2 },
//     path_verified: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: CheckCircle },
//     reported: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: CheckSquare },
//     cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: AlertCircle },
//   };
//   const config = statusMap[status?.toLowerCase()] || statusMap.pending;
//   const Icon = config.icon;
//   return (
//     <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
//       <Icon className="w-3 h-3" />
//       {status?.replace(/_/g, ' ').toUpperCase()}
//     </span>
//   );
// };

// const getPriorityBadge = (priority) => {
//   const priorityMap = {
//     stat: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
//     urgent: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
//     routine: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
//   };
//   return <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityMap[priority?.toLowerCase()] || priorityMap.routine}`}>
//     {priority || 'Routine'}
//   </span>;
// };

// export default function SpecimenDetailsPopup({ specimen, isOpen, refetch, onClose, onViewOrder, onViewPatient }) {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('details');
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [qrCodeUrl, setQrCodeUrl] = useState(null);
//   const [isGeneratingQr, setIsGeneratingQr] = useState(false);
//   const [qrError, setQrError] = useState(null);
//   const [isScanning, setIsScanning] = useState(false);
//   const [cameraError, setCameraError] = useState(null);
//   const [manualBarcode, setManualBarcode] = useState('');
//   const popupRef = useRef(null);

//   useEffect(() => {
//     if (specimen && specimen.qr_code) {
//       if (specimen.qr_code.has_qr && specimen.qr_code.url) {
//         setQrCodeUrl(specimen.qr_code.url);
//       } else {
//         setQrCodeUrl(null);
//       }
//       setQrError(null);
//     }
//   }, [specimen]);

//   useEffect(() => {
//     if (isOpen) {
//       setIsAnimating(true);
//       document.body.style.overflow = 'hidden';

//       const handleEsc = (e) => {
//         if (e.key === 'Escape') handleClose();
//       };
//       document.addEventListener('keydown', handleEsc);

//       return () => {
//         document.removeEventListener('keydown', handleEsc);
//         setIsScanning(false);
//       };
//     } else {
//       document.body.style.overflow = 'unset';
//       setIsScanning(false);
//     }
//   }, [isOpen]);

//   if (!isOpen || !specimen) return null;

//   const handleClose = () => {
//     setIsAnimating(false);
//     setIsScanning(false);
//     setTimeout(onClose, 200);
//   };

//   const handlePopupClick = (e) => {
//     e.stopPropagation();
//   };
//   const handleScanSuccess = async (detectedCodes) => {
//     if (detectedCodes && detectedCodes.length > 0) {
//       const scannedData = detectedCodes[0].rawValue;
//       console.log("Scanned:", scannedData);

//       try {
//         let qrData;
//         try {
//           qrData = JSON.parse(scannedData);
//         } catch {
//           qrData = { barcode: scannedData };
//         }

//         const barcode = qrData.barcode || scannedData;
//         const specimenId = qrData.id;

//         // ✅ CHECK IF IT'S ALIQUOT OR SPECIMEN
//         // if (barcode && barcode.includes('-A')) {
//         //   console.log("tttttttttttttttttttttttttttttttttttt")
//         //   // Aliquot scan - call aliquot API
//         //   setIsScanning(false);

//         //   try {
//         //     const response = await api.post('/specimens/aliquots/scan', { barcode });
//         //     console.log("responseresponse", response)
//         //     if (response?.data?.data) {
//         //       toast.success(`Aliquot ${barcode} status updated to ${response.data.data.status}`);
//         //       console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK")
//         //       handleClose();
//         //       router.push(`/dashboard/specimens`);
//         //     }
//         //   } catch (error) {
//         //     toast.error(error.response?.data?.message || 'Failed to scan aliquot');
//         //     setCameraError(error.response?.data?.message || 'Failed to scan aliquot');
//         //     setTimeout(() => setCameraError(null), 3000);
//         //   }
//         // }
//         // else {
//         // ✅ SPECIMEN SCAN - Call scanSpecimen API (same as barcode input)
//         // setIsScanning(false);

//         try {
//           const response = await api.post('/specimens/scan', { barcode });

//           if (response?.data?.data) {

//             const newStatus = response.data.data.orderStatus;
//             toast.success(`Specimen ${barcode} status updated to ${newStatus}`);

//             // Vibrate on success   
//             if (window.navigator?.vibrate) {
//               window.navigator.vibrate(200);
//             }
//             handleClose();
//             refetch();


//           }
//         } catch (error) {
//           console.error("Scan API error:", error);
//           const errorMsg = error.response?.data?.message || 'Failed to scan specimen';
//           toast.error(errorMsg);
//           setCameraError(errorMsg);
//           setTimeout(() => setCameraError(null), 3000);
//         }
//         // }

//       } catch (error) {
//         console.error("Error parsing QR:", error);
//         setCameraError("Invalid QR code format");
//         setTimeout(() => setCameraError(null), 3000);
//       }
//     }
//   };

//   const handleScanError = (error) => {
//     console.error("Scanner error:", error);
//     setCameraError("Could not access camera. Please check permissions.");
//     setTimeout(() => setCameraError(null), 5000);
//   };

//   const handleManualSearch = () => {
//     if (manualBarcode.trim()) {
//       handleClose();
//     }
//   };

//   const handleGenerateQR = async () => {
//     if (!specimen.qr_code?.can_generate) return;

//     setIsGeneratingQr(true);
//     setQrError(null);

//     try {
//       const response = await api.post(`/specimens/${specimen.id}/generate-qr`);

//       if (response.data.success && response.data.data.qr_code_url) {
//         setQrCodeUrl(response.data.data.qr_code_url);
//         if (specimen.qr_code) {
//           specimen.qr_code.has_qr = true;
//           specimen.qr_code.url = response.data.data.qr_code_url;
//         }
//       } else {
//         throw new Error('Invalid response from server');
//       }
//     } catch (error) {
//       console.error('Error generating QR code:', error);
//       setQrError(error.response?.data?.message || error.message);
//     } finally {
//       setIsGeneratingQr(false);
//     }
//   };

//   const handleDownloadQR = () => {
//     if (!qrCodeUrl) return;

//     const link = document.createElement('a');
//     link.download = `qr_${specimen.barcode}.png`;
//     link.href = qrCodeUrl;
//     link.click();
//   };

//   const handlePrintQR = () => {
//     if (!qrCodeUrl) return;

//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>QR Code - ${specimen.barcode}</title>
//           <style>
//             body {
//               display: flex;
//               justify-content: center;
//               align-items: center;
//               height: 100vh;
//               font-family: Arial, sans-serif;
//             }
//             .container {
//               text-align: center;
//             }
//             img {
//               max-width: 300px;
//               margin: 20px;
//             }
//             .info {
//               margin-top: 20px;
//               font-size: 14px;
//               color: #666;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <img src="${qrCodeUrl}" alt="QR Code" />
//             <div class="info">
//               <strong>Barcode:</strong> ${specimen.barcode}<br/>
//               <strong>Specimen Type:</strong> ${specimen.specimen_type}<br/>
//               <strong>Patient:</strong> ${specimen.patient?.name || 'N/A'}
//             </div>
//           </div>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const formatDate = (date) => {
//     if (!date) return '—';
//     return new Date(date).toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const formatDateOnly = (date) => {
//     if (!date) return '—';
//     return new Date(date).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const tests = specimen.tests || [];
//   const testsSummary = specimen.tests_summary || { total: 0, completed: 0, pending: 0, completion_percentage: 0 };
//   const patient = specimen.patient || {};
//   const order = specimen.order || {};

//   const timeline = [
//     { status: 'Specimen Created', date: specimen.created_at, icon: Package, completed: !!specimen.created_at },
//     { status: 'Specimen Collected', date: specimen.collection_time, icon: TestTube, completed: !!specimen.collection_time },
//     { status: 'Specimen Received', date: specimen.details?.received_time, icon: Beaker, completed: specimen.status === 'received' || specimen.status === 'processing' || specimen.status === 'completed' },
//     { status: 'Processing', date: specimen.processing_at, icon: Loader2, completed: specimen.status === 'processing' || specimen.status === 'completed' },
//     { status: 'Completed', date: specimen.completed_at, icon: CheckCircle, completed: specimen.status === 'completed' },
//   ];

//   return (
//     <>
//       <div
//         className={`fixed inset-0 z-50 !m-0 transition-all duration-300 ${isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'
//           }`}
//         onClick={handleClose}
//       />

//       <div
//         ref={popupRef}
//         onClick={handlePopupClick}
//         className={`fixed right-0 top-0 h-full w-full mb-4 !m-0 sm:max-w-2xl lg:max-w-3xl bg-white dark:bg-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-out ${isAnimating ? 'translate-x-0' : 'translate-x-full'
//           }`}
//       >
//         <div className="sticky !mt-0 bg-[#1b4dff] dark:bg-[#1b4dff] text-white">
//           <div className="flex items-center justify-between p-5 border-b border-white/10">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white/10 rounded-xl">
//                 <TestTube className="w-5 h-5" />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold">Specimen Details</h2>
//                 <p className="text-xs text-white/70 font-mono mt-0.5">{specimen.barcode}</p>
//               </div>
//             </div>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleClose();
//               }}
//               className="p-2 hover:bg-white/10 rounded-lg transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="px-5 py-3 bg-black/20 flex flex-wrap items-center gap-3 text-sm">
//             <div className="flex items-center gap-2">
//               <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.status)} bg-white/20`}>
//                 {specimen.status?.toUpperCase()}
//               </span>
//             </div>
//             <div className="w-px h-4 bg-white/20" />
//             <div className="flex items-center gap-2">
//               <FlaskConical className="w-3.5 h-3.5 text-white/70" />
//               <span className="text-white/90 text-xs">{specimen.specimen_type?.toUpperCase()}</span>
//             </div>
//             <div className="w-px h-4 bg-white/20" />
//             <div className="flex items-center gap-2">
//               <Calendar className="w-3.5 h-3.5 text-white/70" />
//               <span className="text-white/80 text-xs">{formatDateOnly(specimen.collection_time)}</span>
//             </div>
//             <div className="w-px h-4 bg-white/20" />
//             <div className="flex items-center gap-2">
//               <QrCode className="w-3.5 h-3.5 text-white/70" />
//               <span className="text-white/80 text-xs">
//                 {specimen.qr_code?.has_qr ? 'QR Available' : 'QR Not Generated'}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
//           <div className="flex flex-wrap gap-4 text-sm">
//             <div className="flex items-center gap-2">
//               <TestTube className="w-4 h-4 text-blue-500 dark:text-blue-400" />
//               <span className="text-gray-600 dark:text-gray-400">Tests:</span>
//               <span className="font-semibold text-gray-800 dark:text-gray-200">{testsSummary.total}</span>
//               <span className="text-xs text-green-600 dark:text-green-400">({testsSummary.completed} completed)</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
//               <span className="text-gray-600 dark:text-gray-400">Completion:</span>
//               <span className="font-semibold text-gray-800 dark:text-gray-200">{testsSummary.completion_percentage}%</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Activity className="w-4 h-4 text-purple-500 dark:text-purple-400" />
//               <span className="text-gray-600 dark:text-gray-400">Overall:</span>
//               <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.overall_status)}`}>
//                 {specimen.overall_status?.toUpperCase()}
//               </span>
//             </div>
//           </div>
//         </div>

//         <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5">
//           <div className="flex gap-1 overflow-x-auto">
//             <button
//               onClick={() => setActiveTab('details')}
//               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'details'
//                 ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
//                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                 }`}
//             >
//               <FileText className="w-4 h-4" />
//               Details
//             </button>

//             <button
//               onClick={() => setActiveTab('tests')}
//               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'tests'
//                 ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
//                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                 }`}
//             >
//               <Microscope className="w-4 h-4" />
//               Tests
//               <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
//                 {tests.length}
//               </span>
//             </button>

//             <button
//               onClick={() => setActiveTab('timeline')}
//               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'timeline'
//                 ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
//                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                 }`}
//             >
//               <CalendarIcon className="w-4 h-4" />
//               Timeline
//             </button>

//             <button
//               onClick={() => setActiveTab('qrcode')}
//               className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'qrcode'
//                 ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
//                 : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//                 }`}
//             >
//               <QrCode className="w-4 h-4" />
//               QR Code
//             </button>
//           </div>
//         </div>

//         <div className="overflow-y-auto h-[calc(100vh-220px)] p-5">
//           {activeTab === 'details' && (
//             <div className="space-y-5">
//               {/* Specimen Information */}
//               <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
//                 <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
//                   <TestTube className="w-4 h-4" />
//                   Specimen Information
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs text-emerald-600 dark:text-emerald-400">Barcode</label>
//                     <p className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200">{specimen.barcode}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-emerald-600 dark:text-emerald-400">Specimen Type</label>
//                     <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{specimen.specimen_type}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-emerald-600 dark:text-emerald-400">Status</label>
//                     <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.status)}`}>
//                       {specimen.status?.toUpperCase()}
//                     </span></p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-emerald-600 dark:text-emerald-400">Overall Status</label>
//                     <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.overall_status)}`}>
//                       {specimen.overall_status?.toUpperCase()}
//                     </span></p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-emerald-600 dark:text-emerald-400">Collection Time</label>
//                     <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
//                       <Calendar className="w-3 h-3" />
//                       {formatDate(specimen.collection_time)}
//                     </p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-emerald-600 dark:text-emerald-400">Received Time</label>
//                     <p className="text-sm text-gray-800 dark:text-gray-200">
//                       {specimen.details?.received_time ? formatDate(specimen.details.received_time) : '—'}
//                     </p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-emerald-600 dark:text-emerald-400">Condition</label>
//                     <p className="text-sm capitalize text-gray-800 dark:text-gray-200">{specimen.condition || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-emerald-600 dark:text-emerald-400">Has Results</label>
//                     <p className="text-sm">
//                       {specimen.has_results ? (
//                         <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yes</span>
//                       ) : (
//                         <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No</span>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Patient Information */}
//               <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => onViewPatient && onViewPatient(patient.id)}>
//                 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
//                   <User className="w-4 h-4" />
//                   Patient Information
//                   <span className="text-xs text-blue-500 dark:text-blue-400 ml-auto">Click to view →</span>
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
//                     <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{patient.name || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 dark:text-gray-400">MRN</label>
//                     <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{patient.mrn || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 dark:text-gray-400">Gender</label>
//                     <p className="text-sm text-gray-800 dark:text-gray-200 capitalize">{patient.gender || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 dark:text-gray-400">Age</label>
//                     <p className="text-sm text-gray-800 dark:text-gray-200">{patient.age || '—'} years</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Information */}
//               <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => onViewOrder && onViewOrder(order.id)}>
//                 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
//                   <ClipboardList className="w-4 h-4" />
//                   Order Information
//                   <span className="text-xs text-blue-500 dark:text-blue-400 ml-auto">Click to view →</span>
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs text-gray-500 dark:text-gray-400">Order Number</label>
//                     <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{order.order_number || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 dark:text-gray-400">Order Type</label>
//                     <p className="text-sm text-gray-800 dark:text-gray-200 capitalize">{order.order_type || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 dark:text-gray-400">Priority</label>
//                     <div>{getPriorityBadge(order.priority)}</div>
//                   </div>
//                   <div>
//                     <label className="text-xs text-gray-500 dark:text-gray-400">Order Status</label>
//                     <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
//                       {order.status?.toUpperCase()}
//                     </span></p>
//                   </div>
//                 </div>
//               </div>

//               {/* Tests Summary */}
//               <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
//                 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
//                   <Activity className="w-4 h-4" />
//                   Tests Summary
//                 </h3>
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
//                   <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
//                     <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{testsSummary.total}</div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">Total Tests</div>
//                   </div>
//                   <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
//                     <div className="text-2xl font-bold text-green-600 dark:text-green-400">{testsSummary.completed}</div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
//                   </div>
//                   <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
//                     <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{testsSummary.pending}</div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
//                   </div>
//                   <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
//                     <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{testsSummary.completion_percentage}%</div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">Completion</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'tests' && (
//             <div className="space-y-3">
//               {tests.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Microscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
//                   <p className="text-gray-400 dark:text-gray-500">No tests found for this specimen</p>
//                 </div>
//               ) : (
//                 tests.map((test, index) => (
//                   <div
//                     key={test.order_test_id}
//                     className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all"
//                   >
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-2">
//                           <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{test.test_name}</span>
//                           <span className="text-xs text-gray-400 dark:text-gray-500">#{index + 1}</span>
//                         </div>
//                         <div className="flex flex-wrap gap-3 text-xs">
//                           <div className="flex items-center gap-1">
//                             <span className="text-gray-500 dark:text-gray-400">Test Status:</span>
//                             {getTestStatusBadge(test.test_status)}
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <span className="text-gray-500 dark:text-gray-400">Result Type:</span>
//                             <span className="text-gray-700 dark:text-gray-300 capitalize">{test.result_type}</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             <span className="text-gray-500 dark:text-gray-400">Result Status:</span>
//                             <span className="text-gray-700 dark:text-gray-300 capitalize">{test.result_status}</span>
//                           </div>
//                         </div>
//                         {test.latest_result && (
//                           <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
//                             <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Latest Result:</span>
//                             <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 ml-2">{test.latest_result}</span>
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {test.test_status === 'reported' && (
//                           <button className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition">
//                             View Report
//                           </button>
//                         )}
//                         <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           )}

//           {activeTab === 'timeline' && (
//             <div className="relative">
//               <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
//               <div className="space-y-6">
//                 {timeline.map((item, index) => {
//                   const Icon = item.icon;
//                   return (
//                     <div key={index} className="relative flex gap-4">
//                       <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.completed
//                         ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
//                         : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
//                         }`}>
//                         <Icon className={`w-5 h-5 ${item.completed ? '' : 'opacity-50'}`} />
//                       </div>
//                       <div className="flex-1 pb-2">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
//                           <h4 className={`font-medium text-sm ${item.completed ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
//                             {item.status}
//                           </h4>
//                           {item.date && (
//                             <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(item.date)}</span>
//                           )}
//                         </div>
//                         {item.completed && item.date && (
//                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                             Completed on {formatDate(item.date)}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {activeTab === 'qrcode' && (
//             <div className="space-y-5">
//               {/* Scanner Section */}
//               <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-green-100 dark:border-green-800">
//                 <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
//                   <Scan className="w-4 h-4" />
//                   Scan QR Code
//                 </h3>

//                 {!isScanning ? (
//                   <div className="text-center">
//                     <button
//                       onClick={() => setIsScanning(true)}
//                       className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
//                     >
//                       <Camera className="w-4 h-4" />
//                       Start Scanning
//                     </button>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                       Position QR code within the frame to scan
//                     </p>
//                     <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
//                       Make sure you have granted camera permissions
//                     </p>
//                   </div>
//                 ) : (
//                    <div className="flex flex-col items-center">
//                     <div className="relative w-full max-w-[300px]">
//                       <Scanner
//                         onScan={handleScanSuccess}
//                         onError={handleScanError}
//                         constraints={{ facingMode: "environment" }}
//                         scanDelay={500}
//                         style={{ width: '100%', borderRadius: '0.5rem', height: '150px' }}
//                       />
//                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                         <div className="border-2 border-green-500 rounded-md w-24 h-24"></div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setIsScanning(false)}
//                       className="mt-1.5 px-2.5 py-0.5 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded-md"
//                     >
//                       Stop
//                     </button>
//                   </div>
//                 )}

//                 {cameraError && (
//                   <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                     <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4" />
//                       {cameraError}
//                     </p>
//                   </div>
//                 )}

//                 {/* Manual Barcode Input */}
//                 <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
//                   <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
//                     Or enter barcode manually:
//                   </p>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       placeholder="Enter barcode"
//                       value={manualBarcode}
//                       onChange={(e) => setManualBarcode(e.target.value)}
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter') {
//                           handleManualSearch();
//                         }
//                       }}
//                       className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
//                     />
//                     <button
//                       onClick={handleManualSearch}
//                       className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
//                     >
//                       Search
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* QR Code Display Section */}
//               <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800">
//                 <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
//                   <QrCode className="w-5 h-5" />
//                   Specimen QR Code
//                 </h3>

//                 <div className="flex flex-col items-center justify-center space-y-5">
//                   <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
//                     {qrCodeUrl ? (
//                       <div className="text-center">
//                         <img
//                           src={qrCodeUrl}
//                           alt={`QR Code for ${specimen.barcode}`}
//                           className="w-48 h-48 mx-auto mb-3"
//                         />
//                         <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-2">{specimen.barcode}</p>
//                         <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ QR Code Ready</p>
//                       </div>
//                     ) : (
//                       <div className="w-48 h-48 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
//                         {isGeneratingQr ? (
//                           <Loader2 className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-spin" />
//                         ) : (
//                           <>
//                             <QrCode className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
//                             <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
//                               {specimen.qr_code?.has_qr === false
//                                 ? "Click 'Generate QR Code' to create"
//                                 : "No QR code available"}
//                             </p>
//                           </>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   <div className="text-center space-y-2">
//                     <div className="flex items-center gap-2 justify-center">
//                       <span className={`px-2 py-1 rounded text-xs font-medium ${qrCodeUrl
//                         ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
//                         : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
//                         }`}>
//                         {qrCodeUrl ? '✓ QR Code Ready' : '⚠ QR Code Pending'}
//                       </span>
//                     </div>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
//                       Scan this QR code to quickly access specimen information, track status, and view results.
//                     </p>
//                   </div>

//                   <div className="flex flex-wrap gap-3 justify-center">
//                     {!qrCodeUrl && specimen.qr_code?.can_generate && (
//                       <button
//                         onClick={handleGenerateQR}
//                         disabled={isGeneratingQr}
//                         className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                       >
//                         {isGeneratingQr ? (
//                           <>
//                             <Loader2 className="w-4 h-4 animate-spin" />
//                             Generating...
//                           </>
//                         ) : (
//                           <>
//                             <QrCode className="w-4 h-4" />
//                             Generate QR Code
//                           </>
//                         )}
//                       </button>
//                     )}

//                     {qrCodeUrl && (
//                       <>
//                         <button
//                           onClick={handleDownloadQR}
//                           className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
//                         >
//                           <Download className="w-4 h-4" />
//                           Download
//                         </button>
//                         <button
//                           onClick={handlePrintQR}
//                           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
//                         >
//                           <Printer className="w-4 h-4" />
//                           Print
//                         </button>
//                         <button
//                           onClick={() => window.open(qrCodeUrl, '_blank')}
//                           className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
//                         >
//                           <Eye className="w-4 h-4" />
//                           View Full Size
//                         </button>
//                       </>
//                     )}
//                   </div>

//                   {qrError && (
//                     <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                       <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
//                         <AlertCircle className="w-4 h-4" />
//                         {qrError}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
//                 <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4" />
//                   How to Use
//                 </h4>
//                 <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
//                   <li>Click "Start Scanning" and grant camera permission when prompted</li>
//                   <li>Position the QR code within the green frame for automatic detection</li>
//                   <li>Make sure the QR code is well-lit and clearly visible</li>
//                   <li>The scanner will automatically detect and process the QR code</li>
//                   <li>You can also manually enter the barcode using the input field below</li>
//                   <li>Print and attach QR code label to specimen container for tracking</li>
//                 </ul>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }


'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';
import 'barcode-detector/polyfill';
import {
  X,
  Calendar,
  User,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  TestTube,
  Beaker,
  ChevronRight,
  ClipboardList,
  Phone,
  Mail,
  Hash,
  Printer,
  Download,
  Eye,
  Syringe,
  FlaskConical,
  Microscope,
  AlertTriangle,
  CheckSquare,
  Hourglass,
  TrendingUp,
  Package,
  Calendar as CalendarIcon,
  CreditCard,
  QrCode,
  Scan,
  Camera,
  CameraOff
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import LabelPrintModal from '@/components/labels/LabelPrintModal';

const getStatusColor = (status) => {
  const statusMap = {
    collected: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    received: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    processing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    verified: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    reported: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  };
  return statusMap[status?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
};

const getTestStatusBadge = (status) => {
  const statusMap = {
    pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', icon: Hourglass },
    tech_verified: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Loader2 },
    path_verified: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: CheckCircle },
    reported: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: CheckSquare },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: AlertCircle },
  };
  const config = statusMap[status?.toLowerCase()] || statusMap.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {status?.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

const getPriorityBadge = (priority) => {
  const priorityMap = {
    stat: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    urgent: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    routine: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityMap[priority?.toLowerCase()] || priorityMap.routine}`}>
    {priority || 'Routine'}
  </span>;
};

export default function SpecimenDetailsPopup({ specimen, isOpen, refetch, onClose, onViewOrder, onViewPatient }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const [isAnimating, setIsAnimating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (specimen && specimen.qr_code) {
      if (specimen.qr_code.has_qr && specimen.qr_code.url) {
        setQrCodeUrl(specimen.qr_code.url);
      } else {
        setQrCodeUrl(null);
      }
      setQrError(null);
    }
  }, [specimen]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';

      const handleEsc = (e) => {
        if (e.key === 'Escape') handleClose();
      };
      document.addEventListener('keydown', handleEsc);

      return () => {
        document.removeEventListener('keydown', handleEsc);
        setIsScanning(false);
      };
    } else {
      document.body.style.overflow = 'unset';
      setIsScanning(false);
    }
  }, [isOpen]);

  if (!isOpen || !specimen) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setIsScanning(false);
    setTimeout(onClose, 200);
  };

  const handlePopupClick = (e) => {
    e.stopPropagation();
  };
  
  const handleScanSuccess = async (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedData = detectedCodes[0].rawValue;
      console.log("Scanned:", scannedData);

      try {
        let qrData;
        try {
          qrData = JSON.parse(scannedData);
        } catch {
          qrData = { barcode: scannedData };
        }

        const barcode = qrData.barcode || scannedData;
        const specimenId = qrData.id;

        try {
          const response = await api.post('/specimens/scan', { barcode });

          if (response?.data?.data) {
            const newStatus = response.data.data.orderStatus;
            toast.success(`Specimen ${barcode} status updated to ${newStatus}`);

            if (window.navigator?.vibrate) {
              window.navigator.vibrate(200);
            }
            handleClose();
            refetch();
          }
        } catch (error) {
          console.error("Scan API error:", error);
          const errorMsg = error.response?.data?.message || 'Failed to scan specimen';
          toast.error(errorMsg);
          setCameraError(errorMsg);
          setTimeout(() => setCameraError(null), 3000);
        }

      } catch (error) {
        console.error("Error parsing QR:", error);
        setCameraError("Invalid QR code format");
        setTimeout(() => setCameraError(null), 3000);
      }
    }
  };

  const handleScanError = (error) => {
    console.error("Scanner error:", error);
    setCameraError("Could not access camera. Please check permissions.");
    setTimeout(() => setCameraError(null), 5000);
  };

  const handleManualSearch = () => {
    if (manualBarcode.trim()) {
      handleClose();
    }
  };

  const handleGenerateQR = async () => {
    if (!specimen.qr_code?.can_generate) return;

    setIsGeneratingQr(true);
    setQrError(null);

    try {
      const response = await api.post(`/specimens/${specimen.id}/generate-qr`);

      if (response.data.success && response.data.data.qr_code_url) {
        setQrCodeUrl(response.data.data.qr_code_url);
        if (specimen.qr_code) {
          specimen.qr_code.has_qr = true;
          specimen.qr_code.url = response.data.data.qr_code_url;
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrError(error.response?.data?.message || error.message);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    // Renaming to "label" because it now contains a barcode and text too
    link.download = `label_${specimen.barcode}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handlePrintQR = () => {
    printWindow.onload = () => {
        printWindow.print();
        // printWindow.close(); // Optional: close after printing
    };
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const tests = specimen.tests || [];
  const testsSummary = specimen.tests_summary || { total: 0, completed: 0, pending: 0, completion_percentage: 0 };
  const patient = specimen.patient || {};
  const order = specimen.order || {};

  const timeline = [
    { status: 'Specimen Created', date: specimen.created_at, icon: Package, completed: !!specimen.created_at },
    { status: 'Specimen Collected', date: specimen.collection_time, icon: TestTube, completed: !!specimen.collection_time },
    { status: 'Specimen Received', date: specimen.details?.received_time, icon: Beaker, completed: specimen.status === 'received' || specimen.status === 'processing' || specimen.status === 'completed' },
    { status: 'Processing', date: specimen.processing_at, icon: Loader2, completed: specimen.status === 'processing' || specimen.status === 'completed' },
    { status: 'Completed', date: specimen.completed_at, icon: CheckCircle, completed: specimen.status === 'completed' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-50 !m-0 transition-all duration-300 ${isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'
          }`}
        onClick={handleClose}
      />

      <div
        ref={popupRef}
        onClick={handlePopupClick}
        className={`fixed right-0 top-0 h-full w-full mb-4 !m-0 sm:max-w-2xl lg:max-w-3xl bg-white dark:bg-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-out ${isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="sticky !mt-0 bg-[#1b4dff] dark:bg-[#1b4dff] text-white">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <TestTube className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Specimen Details</h2>
                <p className="text-xs text-white/70 font-mono mt-0.5">{specimen.barcode}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-3 bg-black/20 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.status)} bg-white/20`}>
                {specimen.status?.toUpperCase()}
              </span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/90 text-xs">{specimen.specimen_type?.toUpperCase()}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/80 text-xs">{formatDateOnly(specimen.collection_time)}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <QrCode className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/80 text-xs">
                {specimen.qr_code?.has_qr ? 'QR Available' : 'QR Not Generated'}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TestTube className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-gray-600 dark:text-gray-400">Tests:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{testsSummary.total}</span>
              <span className="text-xs text-green-600 dark:text-green-400">({testsSummary.completed} completed)</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-gray-600 dark:text-gray-400">Completion:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{testsSummary.completion_percentage}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span className="text-gray-600 dark:text-gray-400">Overall:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.overall_status)}`}>
                {specimen.overall_status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'details'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <FileText className="w-4 h-4" />
              Details
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'tests'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <Microscope className="w-4 h-4" />
              Tests
              <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {tests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'timeline'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Timeline
            </button>

            <button
              onClick={() => setActiveTab('qrcode')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${activeTab === 'qrcode'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-220px)] p-5">
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Specimen Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                  <TestTube className="w-4 h-4" />
                  Specimen Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Barcode</label>
                    <p className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200">{specimen.barcode}</p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Specimen Type</label>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{specimen.specimen_type}</p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Status</label>
                    <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.status)}`}>
                      {specimen.status?.toUpperCase()}
                    </span></p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Overall Status</label>
                    <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(specimen.overall_status)}`}>
                      {specimen.overall_status?.toUpperCase()}
                    </span></p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Collection Time</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(specimen.collection_time)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Received Time</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {specimen.details?.received_time ? formatDate(specimen.details.received_time) : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Condition</label>
                    <p className="text-sm capitalize text-gray-800 dark:text-gray-200">{specimen.condition || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-emerald-600 dark:text-emerald-400">Has Results</label>
                    <p className="text-sm">
                      {specimen.has_results ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Yes</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> No</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => onViewPatient && onViewPatient(patient.id)}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Patient Information
                  <span className="text-xs text-blue-500 dark:text-blue-400 ml-auto">Click to view →</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{patient.name || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">MRN</label>
                    <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{patient.mrn || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Gender</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200 capitalize">{patient.gender || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Age</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{patient.age || '—'} years</p>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => onViewOrder && onViewOrder(order.id)}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Order Information
                  <span className="text-xs text-blue-500 dark:text-blue-400 ml-auto">Click to view →</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Order Number</label>
                    <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{order.order_number || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Order Type</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200 capitalize">{order.order_type || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Priority</label>
                    <div>{getPriorityBadge(order.priority)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Order Status</label>
                    <p><span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status?.toUpperCase()}
                    </span></p>
                  </div>
                </div>
              </div>

              {/* Tests Summary */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Tests Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{testsSummary.total}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Tests</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{testsSummary.completed}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{testsSummary.pending}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{testsSummary.completion_percentage}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Completion</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-3">
              {tests.length === 0 ? (
                <div className="text-center py-12">
                  <Microscope className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-gray-500">No tests found for this specimen</p>
                </div>
              ) : (
                tests.map((test, index) => (
                  <div
                    key={test.order_test_id}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{test.test_name}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">#{index + 1}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Test Status:</span>
                            {getTestStatusBadge(test.test_status)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Result Type:</span>
                            <span className="text-gray-700 dark:text-gray-300 capitalize">{test.result_type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 dark:text-gray-400">Result Status:</span>
                            <span className="text-gray-700 dark:text-gray-300 capitalize">{test.result_status}</span>
                          </div>
                        </div>
                        {test.latest_result && (
                          <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Latest Result:</span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 ml-2">{test.latest_result}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {test.test_status === 'reported' && (
                          <button className="px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition">
                            View Report
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-6">
                {timeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="relative flex gap-4">
                      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.completed
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                        }`}>
                        <Icon className={`w-5 h-5 ${item.completed ? '' : 'opacity-50'}`} />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className={`font-medium text-sm ${item.completed ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                            {item.status}
                          </h4>
                          {item.date && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(item.date)}</span>
                          )}
                        </div>
                        {item.completed && item.date && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Completed on {formatDate(item.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'qrcode' && (
            <div className="space-y-5">
              {/* Scanner Section */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-green-100 dark:border-green-800">
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                  <Scan className="w-4 h-4" />
                  Scan QR Code
                </h3>

                {!isScanning ? (
                  <div className="text-center">
                    <button
                      onClick={() => setIsScanning(true)}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Camera className="w-4 h-4" />
                      Start Scanning
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Position QR code within the frame to scan
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Make sure you have granted camera permissions
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-[300px]">
                      {/* Safe rendering for scanner - avoids Next.js hydration/camera crashes */}
                      {typeof window !== 'undefined' && (
                        <Scanner
                          onScan={handleScanSuccess}
                          onError={handleScanError}
                          constraints={{ facingMode: "environment" }}
                          scanDelay={500}
                          style={{ width: '100%', borderRadius: '0.5rem', height: '150px' }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border-2 border-green-500 rounded-md w-24 h-24"></div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsScanning(false)}
                      className="mt-1.5 px-2.5 py-0.5 text-[10px] bg-red-600 hover:bg-red-700 text-white rounded-md"
                    >
                      Stop
                    </button>
                  </div>
                )}

                {cameraError && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {cameraError}
                    </p>
                  </div>
                )}

                {/* Manual Barcode Input */}
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                    Or enter barcode manually:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter barcode"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleManualSearch();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={handleManualSearch}
                      className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* ✅ UPDATED QR CODE / LABEL DISPLAY SECTION ✅ */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800">
                <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Specimen Label
                </h3>

                <div className="flex flex-col items-center justify-center space-y-5">
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-md flex justify-center">
                    {qrCodeUrl ? (
                      <div className="text-center w-full">
                        {/* Removed w-48 h-48 square constraint so Barcode can show correctly */}
                        <img 
                          src={qrCodeUrl} 
                          alt={`Label for ${specimen.barcode}`}
                          className="mx-auto max-w-full h-auto object-contain rounded-md mb-3"
                          // Centers image to its actual aspect ratio
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-2">{specimen.barcode}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Label Ready</p>
                      </div>
                    ) : (
                      <div className="w-48 h-48 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        {isGeneratingQr ? (
                          <Loader2 className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-spin" />
                        ) : (
                          <>
                            <QrCode className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-4">
                              {specimen.qr_code?.has_qr === false
                                ? "Click 'Generate Label' to create"
                                : "No label available"}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <div className="flex items-center gap-2 justify-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${qrCodeUrl
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        }`}>
                        {qrCodeUrl ? '✓ Label Ready' : '⚠ Label Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                      Scan this label to quickly access specimen information, track status, and view results.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center">
                    {!qrCodeUrl && specimen.qr_code?.can_generate && (
                      <button
                        onClick={handleGenerateQR}
                        disabled={isGeneratingQr}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isGeneratingQr ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" />
                            Generate Label
                          </>
                        )}
                      </button>
                    )}

                    {qrCodeUrl && (
                      <>
                        <button
                          onClick={handleDownloadQR}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={handlePrintQR}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          Print
                        </button>
                        <button
                          onClick={() => window.open(qrCodeUrl, '_blank')}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Size
                        </button>
                      </>
                    )}
                  </div>

                  {qrError && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {qrError}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  How to Use
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Click "Start Scanning" and grant camera permission when prompted</li>
                  <li>Position the QR code within the green frame for automatic detection</li>
                  <li>Make sure the QR code is well-lit and clearly visible</li>
                  <li>The scanner will automatically detect and process the QR code</li>
                  <li>You can also manually enter the barcode using the input field below</li>
                  <li>Print and attach QR code label to specimen container for tracking</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <LabelPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        labelType="specimen"
        labelData={{
          specimenId: specimen?.specimen_id || specimen?.id,
          patientName: specimen?.patient_name,
          mrn: specimen?.mrn,
          specimenType: specimen?.specimen_type,
          collectionDate: specimen?.collection_date ? new Date(specimen.collection_date).toLocaleString() : null,
          barcode: specimen?.barcode,
          qrCodeUrl: qrCodeUrl,
          priority: specimen?.priority
        }}
      />
    </>
  );
}