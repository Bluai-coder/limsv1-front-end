// 'use client';

// import { X, Phone, Mail, MapPin, Building, Stethoscope, GraduationCap, CreditCard, Send, CheckCircle, Calendar } from 'lucide-react';

// export default function PhysicianDetailModal({ isOpen, onClose, physicianData }) {
//   if (!isOpen || !physicianData) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        
//         {/* Header */}
//         <div className="sticky top-0 bg-[#1b4dff] text-white rounded-t-2xl">
//           <div className="flex items-center justify-between p-5">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white/10 rounded-xl">
//                 <Stethoscope className="w-5 h-5" />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold">Physician Details</h2>
//                 <p className="text-xs text-white/70 mt-0.5">{physicianData.full_name}</p>
//               </div>
//             </div>
//             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 space-y-6">
          
//           {/* Personal Information */}
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
//             <h3 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
//               <Stethoscope className="w-4 h-4" />
//               Personal Information
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="text-xs text-indigo-600">Full Name</label>
//                 <p className="text-sm font-medium text-gray-800">{physicianData.full_name}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-indigo-600">Specialty</label>
//                 <p className="text-sm text-gray-600">{physicianData.specialty || "—"}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-indigo-600">Qualification</label>
//                 <p className="text-sm text-gray-600">{physicianData.qualification || "—"}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-indigo-600">Registration Number</label>
//                 <p className="text-sm text-gray-600">{physicianData.registration_number || "—"}</p>
//               </div>
//               {physicianData.npi_number && (
//                 <div>
//                   <label className="text-xs text-indigo-600">NPI Number</label>
//                   <p className="text-sm text-gray-600">{physicianData.npi_number}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Contact Information */}
//           <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
//             <h3 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
//               <Phone className="w-4 h-4" />
//               Contact Information
//             </h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="text-xs text-emerald-600">Phone</label>
//                 <p className="text-sm text-gray-800">{physicianData.phone}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-emerald-600">Email</label>
//                 <p className="text-sm text-gray-600">{physicianData.email || "—"}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-emerald-600">Fax</label>
//                 <p className="text-sm text-gray-600">{physicianData.fax || "—"}</p>
//               </div>
//               <div>
//                 <label className="text-xs text-emerald-600">Preferred Delivery</label>
//                 <p className="text-sm font-medium text-emerald-700">{physicianData.preferred_delivery}</p>
//               </div>
//             </div>
//           </div>

//           {/* Facility Information */}
//           {(physicianData.facility_name || physicianData.facility_address) && (
//             <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
//               <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
//                 <Building className="w-4 h-4" />
//                 Facility Information
//               </h3>
//               <div>
//                 <label className="text-xs text-blue-600">Facility Name</label>
//                 <p className="text-sm text-gray-800">{physicianData.facility_name || "—"}</p>
//               </div>
//               {physicianData.facility_address && (
//                 <div className="mt-2">
//                   <label className="text-xs text-blue-600">Address</label>
//                   <p className="text-sm text-gray-600">{physicianData.facility_address}</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Status */}
//           <div className="bg-gray-50 rounded-xl p-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <label className="text-xs text-gray-500">Status</label>
//                 <p className="text-sm font-medium">
//                   <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
//                     physicianData.is_active
//                       ? "bg-green-100 text-green-700"
//                       : "bg-red-100 text-red-600"
//                   }`}>
//                     <CheckCircle className="w-3 h-3" />
//                     {physicianData.is_active ? "Active" : "Inactive"}
//                   </span>
//                 </p>
//               </div>
//               <div>
//                 <label className="text-xs text-gray-500">Registered On</label>
//                 <p className="text-sm text-gray-600 flex items-center gap-1">
//                   <Calendar className="w-3 h-3" />
//                   {new Date(physicianData.created_at).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="sticky bottom-0 bg-white border-t px-5 py-3 flex justify-end">
//           <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }







'use client';

import { X, Phone, Mail, MapPin, Building, Stethoscope, GraduationCap, CreditCard, Send, CheckCircle, Calendar } from 'lucide-react';

export default function PhysicianDetailModal({ isOpen, onClose, physicianData }) {
  if (!isOpen || !physicianData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#1b4dff] dark:bg-[#1b4dff] text-white rounded-t-2xl">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Physician Details</h2>
                <p className="text-xs text-white/70 mt-0.5">{physicianData.full_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Personal Information */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-indigo-600 dark:text-indigo-400">Full Name</label>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{physicianData.full_name}</p>
              </div>
              <div>
                <label className="text-xs text-indigo-600 dark:text-indigo-400">Specialty</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{physicianData.specialty || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-indigo-600 dark:text-indigo-400">Qualification</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{physicianData.qualification || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-indigo-600 dark:text-indigo-400">Registration Number</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{physicianData.registration_number || "—"}</p>
              </div>
              {physicianData.npi_number && (
                <div>
                  <label className="text-xs text-indigo-600 dark:text-indigo-400">NPI Number</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{physicianData.npi_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-emerald-600 dark:text-emerald-400">Phone</label>
                <p className="text-sm text-gray-800 dark:text-gray-200">{physicianData.phone}</p>
              </div>
              <div>
                <label className="text-xs text-emerald-600 dark:text-emerald-400">Email</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{physicianData.email || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-emerald-600 dark:text-emerald-400">Fax</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{physicianData.fax || "—"}</p>
              </div>
              <div>
                <label className="text-xs text-emerald-600 dark:text-emerald-400">Preferred Delivery</label>
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{physicianData.preferred_delivery}</p>
              </div>
            </div>
          </div>

          {/* Facility Information */}
          {(physicianData.facility_name || physicianData.facility_address) && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Facility Information
              </h3>
              <div>
                <label className="text-xs text-blue-600 dark:text-blue-400">Facility Name</label>
                <p className="text-sm text-gray-800 dark:text-gray-200">{physicianData.facility_name || "—"}</p>
              </div>
              {physicianData.facility_address && (
                <div className="mt-2">
                  <label className="text-xs text-blue-600 dark:text-blue-400">Address</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{physicianData.facility_address}</p>
                </div>
              )}
            </div>
          )}

          {/* Status */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Status</label>
                <p className="text-sm font-medium">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                    physicianData.is_active
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                  }`}>
                    <CheckCircle className="w-3 h-3" />
                    {physicianData.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">Registered On</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(physicianData.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}