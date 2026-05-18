// 'use client';

// import { useState, useEffect } from 'react';
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
//   FlaskConical,
//   Syringe,
//   Beaker,
//   ChevronRight,
//   ClipboardList,
//   Phone,
//   Mail,
//   MapPin,
//   CalendarDays,
//   Hash,
//   Eye,
//   Printer,
//   Download,
//   Share2,
//   Stethoscope,
//   Building,
//   GraduationCap,
//   CreditCard
// } from 'lucide-react';

// const getStatusBadge = (status) => {
//   const statusMap = {
//     collected: { bg: 'bg-blue-100', text: 'text-blue-700', icon: TestTube },
//     received: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Beaker },
//     processing: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Loader2 },
//     completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
//     registered: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
//     specimen_collected: { bg: 'bg-blue-100', text: 'text-blue-700', icon: TestTube },
//     specimen_received: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Beaker },
//     in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Loader2 },
//     partial_complete: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Activity },
//     verified: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle },
//     reported: { bg: 'bg-teal-100', text: 'text-teal-700', icon: FileText },
//     on_hold: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
//     cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: X },
//   };
//   const config = statusMap[status?.toLowerCase()] || statusMap.registered;
//   const Icon = config.icon;
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
//       <Icon className="w-3 h-3" />
//       {status?.replace(/_/g, ' ').toUpperCase()}
//     </span>
//   );
// };

// const getPriorityBadge = (priority) => {
//   const priorityMap = {
//     stat: 'bg-red-100 text-red-700',
//     urgent: 'bg-orange-100 text-orange-700',
//     routine: 'bg-blue-100 text-blue-700',
//   };
//   const color = priorityMap[priority?.toLowerCase()] || priorityMap.routine;
//   return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{priority || 'Routine'}</span>;
// };

// export default function OrderDetailsPopup({ order, isOpen, onClose, onViewSpecimens }) {
//   const [activeTab, setActiveTab] = useState('details');
//   const [isAnimating, setIsAnimating] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setIsAnimating(true);
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen]);

//   if (!isOpen || !order) return null;

//   const handleClose = () => {
//     // setIsAnima ting(false);
//     setTimeout(onClose, 200);
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

//   // Get referring physician from order data
//   const referringPhysician = order.referringPhysician || order.referring_physician;

//   // ✅ Get specimens directly from order (already coming from backend)
//   const specimens = order.specimens || [];
  
//   // Get tests from order data
//   const tests = order.orderTests || order.tests || [];


//   // Build timeline from order data
//   const timeline = [
//     { status: 'Order Registered', date: order.created_at, icon: Clock, completed: !!order.created_at },
//     { status: 'Specimen Collected', date: order.collection_completed_at, icon: TestTube, completed: specimens.some(s => s.status === 'collected') },
//     { status: 'Specimen Received', date: order.received_at, icon: Beaker, completed: specimens.some(s => s.status === 'received') },
//     { status: 'In Progress', date: order.started_at, icon: Loader2, completed: tests.some(t => t.status === 'in_progress' || t.status === 'processing') },
//     { status: 'Completed', date: order.completed_at, icon: CheckCircle, completed: !!order.completed_at },
//     { status: 'Reported', date: order.reported_at, icon: FileText, completed: !!order.reported_at },
//   ];

//   return (
//     <>
//       {/* Backdrop */}
//       <div
//         className={`fixed inset-0 !m-0 z-50 transition-all duration-300 ${
//           isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'
//         }`}
//         onClick={handleClose}
//       />

//       {/* Drawer/Popup */}
//       <div
//         className={`fixed right-0 top-0 h-full w-full sm:max-w-2xl lg:max-w-3xl bg-white shadow-2xl z-50 transition-transform duration-300 ease-out ${
//           isAnimating ? 'translate-x-0' : 'translate-x-full'
//         }`}
//       >
//         {/* Header */}
//         <div className="sticky top-0 z-10 bg-[#1b4dff] text-white">
//           <div className="flex items-center justify-between p-5 border-b border-white/10">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white/10 rounded-xl">
//                 <ClipboardList className="w-5 h-5" />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold">Order Details</h2>
//                 <p className="text-xs text-white/70 font-mono mt-0.5">{order.order_number}</p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => onViewSpecimens?.(order.id)}
//                 className="p-2 hover:bg-white/10 rounded-lg transition-colors"
//                 title="View Specimens"
//               >
//                 <TestTube className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={handleClose}
//                 className="p-2 hover:bg-white/10 rounded-lg transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           {/* Quick Info Bar */}
//           <div className="px-5 py-3 bg-black/20 flex flex-wrap items-center gap-3 text-sm">
//             <div className="flex items-center gap-2">
//               <User className="w-3.5 h-3.5 text-white/70" />
//               <span className="text-white/90">
//                 {order.patient?.firstName} {order.patient?.lastName}
//               </span>
//             </div>
//             <div className="w-px h-4 bg-white/20" />
//             <div className="flex items-center gap-2">
//               <Hash className="w-3.5 h-3.5 text-white/70" />
//               <span className="text-white/90 font-mono text-xs">MRN: {order.patient?.mrn}</span>
//             </div>
//             <div className="w-px h-4 bg-white/20" />
//             <div className="flex items-center gap-2">
//               <Calendar className="w-3.5 h-3.5 text-white/70" />
//               <span className="text-white/90 text-xs">{formatDate(order.created_at)}</span>
//             </div>
//             <div className="w-px h-4 bg-white/20" />
//             <div className="flex items-center gap-2">
//               <Stethoscope className="w-3.5 h-3.5 text-white/70" />
//               <span className="text-white/90 text-xs">
//                 {referringPhysician?.full_name || 'No Referring Physician'}
//               </span>
//             </div>
//             <div className="w-px h-4 bg-white/20" />
//             <div className="flex items-center gap-2">
//               <TestTube className="w-3.5 h-3.5 text-white/70" />
//               <span className="text-white/90 text-xs">
//                 {specimens.length} Specimen(s)
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="border-b border-slate-200 bg-slate-50 px-5">
//           <div className="flex gap-1 overflow-x-auto">
//             {[
//               { id: 'details', label: 'Details', icon: FileText },
//               { id: 'specimens', label: 'Specimens', icon: TestTube, count: specimens?.length || 0 },
//               { id: 'tests', label: 'Tests', icon: Activity, count: tests?.length || 0 },
//               { id: 'timeline', label: 'Timeline', icon: Calendar },
//             ].map((tab) => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
//                     isActive
//                       ? 'border-emerald-500 text-emerald-600'
//                       : 'border-transparent text-slate-500 hover:text-slate-700'
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {tab.label}
//                   {tab.count !== undefined && tab.count > 0 && (
//                     <span className={`px-1.5 py-0.5 rounded-full text-xs ${
//                       isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
//                     }`}>
//                       {tab.count}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="overflow-y-auto h-[calc(100vh-220px)] p-5">
//           {/* Details Tab */}
//           {activeTab === 'details' && (
//             <div className="space-y-5">
//               {/* Patient Information */}
//               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
//                 <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
//                   <User className="w-4 h-4" />
//                   Patient Information
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs text-blue-600">Full Name</label>
//                     <p className="text-sm font-medium text-slate-800">
//                       {order.patient?.firstName} {order.patient?.lastName}
//                     </p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-blue-600">MRN / UHID</label>
//                     <p className="text-sm font-mono text-slate-800">{order.patient?.mrn || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-blue-600">Date of Birth</label>
//                     <p className="text-sm text-slate-800">
//                       {order.patient?.dateOfBirth ? new Date(order.patient.dateOfBirth).toLocaleDateString() : '—'}
//                     </p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-blue-600">Gender</label>
//                     <p className="text-sm text-slate-800">{order.patient?.gender || '—'}</p>
//                   </div>
//                   <div className="sm:col-span-2">
//                     <label className="text-xs text-blue-600">Contact</label>
//                     <div className="flex flex-wrap items-center gap-3 mt-1">
//                       {order.patient?.phonePrimary && (
//                         <span className="text-sm text-slate-800 flex items-center gap-1">
//                           <Phone className="w-3 h-3" /> {order.patient.phonePrimary}
//                         </span>
//                       )}
//                       {order.patient?.email && (
//                         <span className="text-sm text-slate-800 flex items-center gap-1">
//                           <Mail className="w-3 h-3" /> {order.patient.email}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Referring Physician Information */}
//               <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
//                 <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
//                   <Stethoscope className="w-4 h-4" />
//                   Referring Physician
//                 </h3>
//                 {referringPhysician ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                       <label className="text-xs text-emerald-600">Doctor Name</label>
//                       <p className="text-sm font-medium text-slate-800">
//                         Dr. {referringPhysician.full_name}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="text-xs text-emerald-600">Specialty</label>
//                       <p className="text-sm text-slate-800">{referringPhysician.specialty || '—'}</p>
//                     </div>
//                     <div>
//                       <label className="text-xs text-emerald-600">Qualification</label>
//                       <p className="text-sm text-slate-800">{referringPhysician.qualification || '—'}</p>
//                     </div>
//                     <div>
//                       <label className="text-xs text-emerald-600">Registration Number</label>
//                       <p className="text-sm font-mono text-slate-800">{referringPhysician.registration_number || '—'}</p>
//                     </div>
//                     <div>
//                       <label className="text-xs text-emerald-600">Phone</label>
//                       <p className="text-sm text-slate-800 flex items-center gap-1">
//                         <Phone className="w-3 h-3" /> {referringPhysician.phone || '—'}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="text-xs text-emerald-600">Email</label>
//                       <p className="text-sm text-slate-800 flex items-center gap-1">
//                         <Mail className="w-3 h-3" /> {referringPhysician.email || '—'}
//                       </p>
//                     </div>
//                     {referringPhysician.facility_name && (
//                       <div className="sm:col-span-2">
//                         <label className="text-xs text-emerald-600">Facility/Hospital</label>
//                         <p className="text-sm text-slate-800 flex items-center gap-1">
//                           <Building className="w-3 h-3" /> {referringPhysician.facility_name}
//                         </p>
//                       </div>
//                     )}
//                     {referringPhysician.facility_address && (
//                       <div className="sm:col-span-2">
//                         <label className="text-xs text-emerald-600">Facility Address</label>
//                         <p className="text-sm text-slate-800 flex items-center gap-1">
//                           <MapPin className="w-3 h-3" /> {referringPhysician.facility_address}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <div className="text-center py-4 text-gray-500">
//                     <Stethoscope className="w-8 h-8 mx-auto mb-2 text-gray-300" />
//                     <p className="text-sm">No referring physician assigned</p>
//                   </div>
//                 )}
//               </div>

//               {/* Order Information */}
//               <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
//                 <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
//                   <ClipboardList className="w-4 h-4" />
//                   Order Information
//                 </h3>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-xs text-slate-500">Order Number</label>
//                     <p className="text-sm font-mono text-slate-800">{order.order_number}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-slate-500">Accession Number</label>
//                     <p className="text-sm font-mono text-slate-800">{order.accession_number || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-slate-500">Priority</label>
//                     <div>{getPriorityBadge(order.priority)}</div>
//                   </div>
//                   <div>
//                     <label className="text-xs text-slate-500">Status</label>
//                     <div>{getStatusBadge(order.status)}</div>
//                   </div>
//                   <div>
//                     <label className="text-xs text-slate-500">Ordered By</label>
//                     <p className="text-sm text-slate-800">{order.ordered_by?.name || '—'}</p>
//                   </div>
//                   <div>
//                     <label className="text-xs text-slate-500">Ordered At</label>
//                     <p className="text-sm text-slate-800">{formatDate(order.created_at)}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Specimens Summary */}
//               {specimens.length > 0 && (
//                 <div className="bg-purple-50 rounded-xl  p-4 border border-purple-100">
//                   <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
//                     <TestTube className="w-4 h-4" />
//                     Specimens Summary
//                   </h3>
//                   <div className="space-y-2">
//                     {specimens.map((specimen, idx) => (
//                       <div key={specimen.id || idx} className="flex justify-between items-center p-2 bg-white rounded-lg">
//                         <div>
//                           <span className="font-mono text-sm">{specimen.barcode}</span>
//                           <span className="ml-2 text-xs text-gray-500">{specimen.specimen_type}</span>
//                         </div>
//                         {getStatusBadge(specimen.status)}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Clinical Information */}
//               {order.clinical_info && (
//                 <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
//                   <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
//                     <FileText className="w-4 h-4" />
//                     Clinical Information
//                   </h3>
//                   <p className="text-sm text-amber-800">{order.clinical_info}</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Specimens Tab - Detailed View */}
//           {activeTab === 'specimens' && (
//             <div className="space-y-3">
//               {specimens?.length > 0 ? (
//                 specimens.map((specimen, index) => (
//                   <div
//                     key={specimen.id || index}
//                     className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all"
//                   >
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="font-mono text-sm font-semibold text-slate-800">{specimen.barcode}</span>
//                           <span className="px-2 py-0.5 bg-white rounded text-xs text-slate-600 border border-slate-200">
//                             {specimen.specimen_type}
//                           </span>
//                         </div>
//                         <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
//                           {specimen.collection_time && (
//                             <span>Collected: {formatDate(specimen.collection_time)}</span>
//                           )}
//                           {specimen.received_time && (
//                             <span>Received: {formatDate(specimen.received_time)}</span>
//                           )}
//                           {specimen.volume_ml && <span>Volume: {specimen.volume_ml} mL</span>}
//                           {specimen.container_type && <span>Container: {specimen.container_type}</span>}
//                         </div>
//                         {specimen.condition && specimen.condition !== 'acceptable' && (
//                           <div className="mt-2 text-xs text-red-600">
//                             Condition: {specimen.condition}
//                             {specimen.rejection_reason && ` - ${specimen.rejection_reason}`}
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-3">
//                         {getStatusBadge(specimen.status)}
//                         <ChevronRight className="w-4 h-4 text-slate-400" />
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-12">
//                   <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-400">No specimens found for this order</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Tests Tab */}
//           {activeTab === 'tests' && (
//             <div className="space-y-3">
//               {tests?.length > 0 ? (
//                 tests.map((test, index) => (
//                   <div
//                     key={test.id || index}
//                     className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all"
//                   >
//                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="font-medium text-sm text-slate-800">
//                             {test.test?.display_name || test.test?.name || test.name}
//                           </span>
//                           <span className="text-xs text-slate-400">#{index + 1}</span>
//                         </div>
//                         {test.test?.department && (
//                           <p className="text-xs text-slate-500">Department: {test.test.department}</p>
//                         )}
//                         {test.test?.price && (
//                           <p className="text-xs text-slate-500">Price: ₹{test.test.price}</p>
//                         )}
//                       </div>
//                       <div className="flex items-center gap-3">
//                         {getStatusBadge(test.status)}
//                         <ChevronRight className="w-4 h-4 text-slate-400" />
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-12">
//                   <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-400">No tests found for this order</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Timeline Tab */}
//           {activeTab === 'timeline' && (
//             <div className="relative">
//               <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
//               <div className="space-y-6">
//                 {timeline.map((item, index) => {
//                   const Icon = item.icon;
//                   return (
//                     <div key={index} className="relative flex gap-4">
//                       <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
//                         item.completed
//                           ? 'bg-green-100 text-green-600'
//                           : 'bg-slate-100 text-slate-400'
//                       }`}>
//                         <Icon className={`w-5 h-5 ${item.completed ? '' : 'opacity-50'}`} />
//                       </div>
//                       <div className="flex-1 pb-2">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
//                           <h4 className={`font-medium text-sm ${item.completed ? 'text-slate-800' : 'text-slate-400'}`}>
//                             {item.status}
//                           </h4>
//                           {item.date && (
//                             <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
//                           )}
//                         </div>
//                         {item.completed && item.date && (
//                           <p className="text-xs text-slate-500 mt-1">
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
//         </div>

//         {/* Footer */}
//         <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 flex justify-between items-center">
//           <div className="text-xs text-slate-400">
//             Order ID: {order.id?.slice(0, 8)}... | Last updated: {formatDate(order.updated_at)}
//           </div>
        
//         </div>
//       </div>
//     </>
//   );
// }



'use client';

import { useState, useEffect } from 'react';
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
  FlaskConical,
  Syringe,
  Beaker,
  ChevronRight,
  ClipboardList,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Hash,
  Eye,
  Printer,
  Download,
  Share2,
  Stethoscope,
  Building,
  GraduationCap,
  CreditCard
} from 'lucide-react';

const getStatusBadge = (status) => {
  const statusMap = {
    collected: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: TestTube },
    received: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', icon: Beaker },
    processing: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Loader2 },
    completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: CheckCircle },
    registered: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', icon: Clock },
    specimen_collected: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: TestTube },
    specimen_received: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', icon: Beaker },
    in_progress: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Loader2 },
    partial_complete: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', icon: Activity },
    verified: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', icon: CheckCircle },
    reported: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', icon: FileText },
    on_hold: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: AlertCircle },
    cancelled: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', icon: X },
  };
  const config = statusMap[status?.toLowerCase()] || statusMap.registered;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}>
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
  const color = priorityMap[priority?.toLowerCase()] || priorityMap.routine;
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{priority || 'Routine'}</span>;
};

export default function OrderDetailsPopup({ order, isOpen, onClose, onViewSpecimens }) {
  const [activeTab, setActiveTab] = useState('details');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleClose = () => {
    setTimeout(onClose, 200);
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

  // Get referring physician from order data
  const referringPhysician = order.referringPhysician || order.referring_physician;

  // ✅ Get specimens directly from order (already coming from backend)
  const specimens = order.specimens || [];
  
  // Get tests from order data
  const tests = order.orderTests || order.tests || [];

  // Build timeline from order data
  const timeline = [
    { status: 'Order Registered', date: order.created_at, icon: Clock, completed: !!order.created_at },
    { status: 'Specimen Collected', date: order.collection_completed_at, icon: TestTube, completed: specimens.some(s => s.status === 'collected') },
    { status: 'Specimen Received', date: order.received_at, icon: Beaker, completed: specimens.some(s => s.status === 'received') },
    { status: 'In Progress', date: order.started_at, icon: Loader2, completed: tests.some(t => t.status === 'in_progress' || t.status === 'processing') },
    { status: 'Completed', date: order.completed_at, icon: CheckCircle, completed: !!order.completed_at },
    { status: 'Reported', date: order.reported_at, icon: FileText, completed: !!order.reported_at },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 !m-0 z-50 transition-all duration-300 ${
          isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer/Popup */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:max-w-2xl lg:max-w-3xl bg-white dark:bg-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1b4dff] dark:bg-[#1b4dff] text-white">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Order Details</h2>
                <p className="text-xs text-white/70 font-mono mt-0.5">{order.order_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewSpecimens?.(order.id)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="View Specimens"
              >
                <TestTube className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="px-5 py-3 bg-black/20 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/90">
                {order.patient?.firstName} {order.patient?.lastName}
              </span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/90 font-mono text-xs">MRN: {order.patient?.mrn}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/90 text-xs">{formatDate(order.created_at)}</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/90 text-xs">
                {referringPhysician?.full_name || 'No Referring Physician'}
              </span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <TestTube className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/90 text-xs">
                {specimens.length} Specimen(s)
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'details', label: 'Details', icon: FileText },
              { id: 'specimens', label: 'Specimens', icon: TestTube, count: specimens?.length || 0 },
              { id: 'tests', label: 'Tests', icon: Activity, count: tests?.length || 0 },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 ${
                    isActive
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isActive 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-220px)] p-5">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Patient Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-blue-600 dark:text-blue-400">Full Name</label>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {order.patient?.firstName} {order.patient?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-600 dark:text-blue-400">MRN / UHID</label>
                    <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{order.patient?.mrn || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-600 dark:text-blue-400">Date of Birth</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {order.patient?.dateOfBirth ? new Date(order.patient.dateOfBirth).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-600 dark:text-blue-400">Gender</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{order.patient?.gender || '—'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-blue-600 dark:text-blue-400">Contact</label>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      {order.patient?.phonePrimary && (
                        <span className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {order.patient.phonePrimary}
                        </span>
                      )}
                      {order.patient?.email && (
                        <span className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {order.patient.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Referring Physician Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Referring Physician
                </h3>
                {referringPhysician ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-emerald-600 dark:text-emerald-400">Doctor Name</label>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Dr. {referringPhysician.full_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-emerald-600 dark:text-emerald-400">Specialty</label>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{referringPhysician.specialty || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-emerald-600 dark:text-emerald-400">Qualification</label>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{referringPhysician.qualification || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-emerald-600 dark:text-emerald-400">Registration Number</label>
                      <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{referringPhysician.registration_number || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-emerald-600 dark:text-emerald-400">Phone</label>
                      <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {referringPhysician.phone || '—'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-emerald-600 dark:text-emerald-400">Email</label>
                      <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {referringPhysician.email || '—'}
                      </p>
                    </div>
                    {referringPhysician.facility_name && (
                      <div className="sm:col-span-2">
                        <label className="text-xs text-emerald-600 dark:text-emerald-400">Facility/Hospital</label>
                        <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <Building className="w-3 h-3" /> {referringPhysician.facility_name}
                        </p>
                      </div>
                    )}
                    {referringPhysician.facility_address && (
                      <div className="sm:col-span-2">
                        <label className="text-xs text-emerald-600 dark:text-emerald-400">Facility Address</label>
                        <p className="text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {referringPhysician.facility_address}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <Stethoscope className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No referring physician assigned</p>
                  </div>
                )}
              </div>

              {/* Order Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Order Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Order Number</label>
                    <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{order.order_number}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Accession Number</label>
                    <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{order.accession_number || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Priority</label>
                    <div>{getPriorityBadge(order.priority)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Ordered By</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{order.ordered_by?.name || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Ordered At</label>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{formatDate(order.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Specimens Summary */}
              {specimens.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                  <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                    <TestTube className="w-4 h-4" />
                    Specimens Summary
                  </h3>
                  <div className="space-y-2">
                    {specimens.map((specimen, idx) => (
                      <div key={specimen.id || idx} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <div>
                          <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{specimen.barcode}</span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{specimen.specimen_type}</span>
                        </div>
                        {getStatusBadge(specimen.status)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Information */}
              {order.clinical_info && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Clinical Information
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{order.clinical_info}</p>
                </div>
              )}
            </div>
          )}

          {/* Specimens Tab - Detailed View */}
          {activeTab === 'specimens' && (
            <div className="space-y-3">
              {specimens?.length > 0 ? (
                specimens.map((specimen, index) => (
                  <div
                    key={specimen.id || index}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{specimen.barcode}</span>
                          <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                            {specimen.specimen_type}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {specimen.collection_time && (
                            <span>Collected: {formatDate(specimen.collection_time)}</span>
                          )}
                          {specimen.received_time && (
                            <span>Received: {formatDate(specimen.received_time)}</span>
                          )}
                          {specimen.volume_ml && <span>Volume: {specimen.volume_ml} mL</span>}
                          {specimen.container_type && <span>Container: {specimen.container_type}</span>}
                        </div>
                        {specimen.condition && specimen.condition !== 'acceptable' && (
                          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                            Condition: {specimen.condition}
                            {specimen.rejection_reason && ` - ${specimen.rejection_reason}`}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(specimen.status)}
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <TestTube className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-gray-500">No specimens found for this order</p>
                </div>
              )}
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === 'tests' && (
            <div className="space-y-3">
              {tests?.length > 0 ? (
                tests.map((test, index) => (
                  <div
                    key={test.id || index}
                    className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                            {test.test?.display_name || test.test?.name || test.name}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">#{index + 1}</span>
                        </div>
                        {test.test?.department && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">Department: {test.test.department}</p>
                        )}
                        {test.test?.price && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">Price: ₹{test.test.price}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(test.status)}
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-gray-500">No tests found for this order</p>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-6">
                {timeline.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="relative flex gap-4">
                      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        item.completed
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
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex justify-between items-center">
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Order ID: {order.id?.slice(0, 8)}... | Last updated: {formatDate(order.updated_at)}
          </div>
        </div>
      </div>
    </>
  );
}