// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Search, Plus, ChevronLeft, ChevronRight, Users, Edit, Trash2, Eye, Phone, Mail, Stethoscope } from 'lucide-react';
// import { useAuthStore } from '@/lib/auth-store';
// import ActionDropdown from '@/components/ActionDropdown';
// import { useRouter } from 'next/navigation';
// import { toast } from 'sonner';
// import { useReferringPhysician } from '@/hooks/use-referring-physician';
// import PhysicianDetailModal from '@/components/detail-popup/PhysicianDetailModal';

// export default function PhysiciansPage() {
//   const router = useRouter();
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(1);
//   const [statusFilter, setStatusFilter] = useState('');
//   const [selectedPhysician, setSelectedPhysician] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { tenant } = useAuthStore();
//   const { 
//     physicians, 
//     pagination, 
//     loading, 
//     getPhysicians, 
//     deletePhysician,
//     togglePhysicianStatus 
//   } = useReferringPhysician();

//   // Load physicians when search, page, or status filter changes
//   useEffect(() => {
//     loadPhysicians();
//   }, [search, page, statusFilter]);

//   const loadPhysicians = async () => {
//     await getPhysicians(page, 10, search, statusFilter);
//   };

//   const handleViewDetails = (physician) => {
//     setSelectedPhysician(physician);
//     setIsModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (!tenant?.id) return toast.error("Tenant not found");

//     try {
//       await deletePhysician(id);
//       toast.success("Physician deleted successfully");
//       loadPhysicians();
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to delete physician");
//     }
//   };

//   const handleToggleStatus = async (id, currentStatus) => {
//     try {
//       await togglePhysicianStatus(id);
//       toast.success(`Physician ${currentStatus ? "deactivated" : "activated"} successfully`);
//       loadPhysicians();
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to update status");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-xl font-semibold text-gray-900">Referring Physicians</h1>
//           <p className="text-sm text-gray-500">
//             {pagination?.total ?? 0} physicians registered
//           </p>
//         </div>

//         <Link
//           href="/dashboard/physician/new"
//           className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4dff] text-white rounded-xl shadow hover:shadow-lg"
//         >
//           <Plus className="w-4 h-4" /> New Physician
//         </Link>
//       </div>

//       {/* SEARCH & FILTERS */}
//       <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-4 shadow-sm">
//         <div className="flex flex-col sm:flex-row gap-3">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPage(1);
//               }}
//               placeholder="Search by name, phone, email, registration number..."
//               className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>
//           <select
//             value={statusFilter}
//             onChange={(e) => {
//               setStatusFilter(e.target.value);
//               setPage(1);
//             }}
//             className="px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
//           >
//             <option value="">All Status</option>
//             <option value="true">Active</option>
//             <option value="false">Inactive</option>
//           </select>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-xl overflow-hidden">

//         {/* HORIZONTAL SCROLL */}
//         <div className="w-full overflow-x-auto">
//           <table className="min-w-[900px] w-full text-sm">

//             {/* HEADER */}
//             <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-xs text-gray-500 uppercase tracking-wider">
//               <tr>
//                 <th className="px-5 py-3 text-left">Physician Name</th>
//                 <th className="px-5 py-3 text-left">Specialty</th>
//                 <th className="px-5 py-3 text-left">Contact</th>
//                 <th className="px-5 py-3 text-left">Facility</th>
//                 <th className="px-5 py-3 text-left">Delivery</th>
//                 <th className="px-5 py-3 text-left">Status</th>
//                 <th className="px-5 py-3 text-right">Actions</th>
//               </tr>
//             </thead>

//             {/* BODY */}
//             <tbody>
//               {loading ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <tr key={i} className="border-t">
//                     {Array.from({ length: 7 }).map((_, j) => (
//                       <td key={j} className="px-5 py-4">
//                         <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : physicians?.length > 0 ? (

//                 physicians.map((physician) => (
//                   <tr
//                     key={physician.id}
//                     className="border-t hover:bg-gradient-to-r hover:from-indigo-50 hover:to-transparent transition-all"
//                   >

//                     {/* NAME */}
//                     <td onClick={() => handleViewDetails(physician)} className="px-5 py-4 whitespace-nowrap cursor-pointer">
//                       <div className="font-semibold text-gray-900">
//                         {physician.full_name}
//                       </div>
//                       {physician.qualification && (
//                         <div className="text-xs text-gray-400 mt-0.5">
//                           {physician.qualification}
//                         </div>
//                       )}
//                       {physician.registration_number && (
//                         <div className="text-xs text-gray-400">
//                           Reg: {physician.registration_number}
//                         </div>
//                       )}
//                     </td>

//                     {/* SPECIALTY */}
//                     <td onClick={() => handleViewDetails(physician)} className="px-5 py-4 text-gray-600 whitespace-nowrap cursor-pointer">
//                       <div className="flex items-center gap-1">
//                         <Stethoscope className="w-3 h-3" />
//                         {physician.specialty || "—"}
//                       </div>
//                     </td>

//                     {/* CONTACT */}
//                     <td onClick={() => handleViewDetails(physician)} className="px-5 py-4 cursor-pointer">
//                       <div className="flex items-center gap-1 text-sm text-gray-600">
//                         <Phone className="w-3 h-3" />
//                         {physician.phone}
//                       </div>
//                       {physician.email && (
//                         <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
//                           <Mail className="w-3 h-3" />
//                           {physician.email}
//                         </div>
//                       )}
//                     </td>

//                     {/* FACILITY */}
//                     <td onClick={() => handleViewDetails(physician)} className="px-5 py-4 cursor-pointer">
//                       <div className="text-sm text-gray-600">
//                         {physician.facility_name || "—"}
//                       </div>
//                       {physician.facility_address && (
//                         <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
//                           {physician.facility_address}
//                         </div>
//                       )}
//                     </td>

//                     {/* DELIVERY */}
//                     <td onClick={() => handleViewDetails(physician)} className="px-5 py-4 whitespace-nowrap cursor-pointer">
//                       <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
//                         {physician.preferred_delivery}
//                       </span>
//                     </td>

//                     {/* STATUS */}
//                     <td onClick={() => handleViewDetails(physician)} className="px-5 py-4 whitespace-nowrap cursor-pointer">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleToggleStatus(physician.id, physician.is_active);
//                         }}
//                         className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition ${
//                           physician.is_active
//                             ? "bg-green-100 text-green-700 hover:bg-green-200"
//                             : "bg-red-100 text-red-600 hover:bg-red-200"
//                         }`}
//                       >
//                         {physician.is_active ? "Active" : "Inactive"}
//                       </button>
//                     </td>

//                     {/* ACTIONS */}
//                     <td className="px-5 py-4 text-right whitespace-nowrap">
//                       <ActionDropdown
//                         onEdit={() => router.push(`/dashboard/physician/edit?id=${physician.id}`)}
//                         onDelete={() => handleDelete(physician.id)}
//                       />
//                     </td>

//                   </tr>
//                 ))

//               ) : (
//                 <tr>
//                   <td colSpan={7} className="text-center py-12">
//                     <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//                     <p className="text-gray-500">No physicians found</p>
//                     <Link href="/dashboard/physician/new" className="text-[#1b4dff] text-sm mt-2 inline-block">
//                       Add your first physician →
//                     </Link>
//                   </td>
//                 </tr>
//               )}
//             </tbody>

//           </table>
//         </div>

//         {/* PAGINATION */}
//         {pagination && pagination.totalPages > 1 && (
//           <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-5 py-4 border-t bg-gray-50">
//             <p className="text-sm text-gray-500">
//               Page {pagination.page} of {pagination.totalPages}
//             </p>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={pagination.page === 1}
//                 className="p-2 rounded-lg border hover:bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
//                 disabled={pagination.page === pagination.totalPages}
//                 className="p-2 rounded-lg border hover:bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}

//       </div>

//       {/* Physician Detail Modal */}
//       <PhysicianDetailModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         physicianData={selectedPhysician}
//       />
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronLeft, ChevronRight, Users, Trash2, Eye, Phone, Mail, Stethoscope, Pencil, X } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useReferringPhysician } from '@/hooks/use-referring-physician';
import PhysicianDetailModal from '@/components/detail-popup/PhysicianDetailModal';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';

// Delete Confirmation Modal Component with Dark Mode
const DeleteConfirmModal = ({ physician, onConfirm, onCancel }) => {
  if (!physician) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl transition-colors duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Physician</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete physician{' '}
          <span className="font-semibold">{physician.full_name}</span>?
          This will permanently remove the physician from the system.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            Delete Physician
          </button>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component with Dark Mode
const StatusBadge = ({ isActive, onToggle, canUpdate }) => {
  if (!canUpdate) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
        isActive 
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
      }`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition ${
        isActive
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
          : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
};

export default function PhysiciansPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPhysician, setSelectedPhysician] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { tenant } = useAuthStore();

  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Physicians
  if (!canRead('Physicians')) {
    return <PermissionDenied resource="Physicians" action="read" />;
  }

  const { 
    physicians, 
    pagination, 
    loading, 
    getPhysicians, 
    deletePhysician,
    togglePhysicianStatus 
  } = useReferringPhysician();

  // Load physicians when search, page, or status filter changes
  useEffect(() => {
    loadPhysicians();
  }, [search, page, statusFilter]);

  const loadPhysicians = async () => {
    await getPhysicians(page, 5, search, statusFilter);
  };

  const handleViewDetails = (physician) => {
    setSelectedPhysician(physician);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!tenant?.id) return toast.error("Tenant not found");

    // Check permission before attempting delete
    if (!canDelete('Physicians') && !isAdmin()) {
      toast.error("You don't have permission to delete physicians");
      return;
    }

    try {
      await deletePhysician(id);
      toast.success("Physician deleted successfully");
      setDeleteConfirm(null);
      loadPhysicians(); // Refresh the list
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete physician");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    // Check permission before attempting status change
    if (!canUpdate('Physicians') && !isAdmin()) {
      toast.error("You don't have permission to update physician status");
      return;
    }

    try {
      await togglePhysicianStatus(id);
      toast.success(`Physician ${currentStatus ? "deactivated" : "activated"} successfully`);
      loadPhysicians();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 space-y-6 transition-colors duration-200">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          physician={deleteConfirm}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Referring Physicians
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} physicians registered
          </p>
        </div>

        {canCreate('Physicians') && (
          <Link
            href="/dashboard/physician/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 dark:bg-[#1b4dff] dark:hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> New Physician
          </Link>
        )}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-5 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, phone, email, registration number..."
              className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base transition-colors duration-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] transition-colors duration-200"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Physician Name</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Specialty</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Contact</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Facility</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Delivery</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                {(canUpdate('Physicians') || canDelete('Physicians')) && (
                  <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : physicians?.length > 0 ? (
                physicians.map((physician) => (
                  <tr key={physician.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    {/* NAME - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(physician)}
                        className="text-left cursor-pointer w-full"
                      >
                        <div className="font-semibold text-gray-900 dark:text-white hover:text-[#1b4dff] dark:hover:text-[#1b4dff] transition">
                          {physician.full_name}
                        </div>
                        {physician.qualification && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {physician.qualification}
                          </div>
                        )}
                        {physician.registration_number && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Reg: {physician.registration_number}
                          </div>
                        )}
                      </button>
                    </td>

                    {/* SPECIALTY - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(physician)}
                        className="text-left cursor-pointer w-full"
                      >
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                          <Stethoscope className="w-3 h-3" />
                          {physician.specialty || "—"}
                        </div>
                      </button>
                    </td>

                    {/* CONTACT - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(physician)}
                        className="text-left cursor-pointer w-full"
                      >
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="w-3 h-3" />
                          {physician.phone || "—"}
                        </div>
                        {physician.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-1">
                            <Mail className="w-3 h-3" />
                            {physician.email}
                          </div>
                        )}
                      </button>
                    </td>

                    {/* FACILITY - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(physician)}
                        className="text-left cursor-pointer w-full"
                      >
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {physician.facility_name || "—"}
                        </div>
                        {physician.facility_address && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[200px]">
                            {physician.facility_address}
                          </div>
                        )}
                      </button>
                    </td>

                    {/* DELIVERY - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(physician)}
                        className="text-left cursor-pointer w-full"
                      >
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
                          {physician.preferred_delivery || "—"}
                        </span>
                      </button>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <StatusBadge 
                        isActive={physician.is_active}
                        onToggle={() => handleToggleStatus(physician.id, physician.is_active)}
                        canUpdate={canUpdate('Physicians') || isAdmin()}
                      />
                    </td>

                    {/* ACTIONS - View, Edit, Delete buttons */}
                    {(canUpdate('Physicians') || canDelete('Physicians')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewDetails(physician)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Physician Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          {canUpdate('Physicians') && (
                            <button
                              onClick={() => router.push(`/dashboard/physician/edit?id=${physician.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit Physician"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          {canDelete('Physicians') && (
                            <button
                              onClick={() => setDeleteConfirm(physician)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete Physician"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No physicians found</p>
                    {canCreate('Physicians') && (
                      <Link href="/dashboard/physician/new" className="text-[#1b4dff] dark:text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                        Add your first physician →
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION - Consistent styling with Dark Mode */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} physicians
            </p>

            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Page {page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-700 dark:text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Physician Detail Modal */}
      <PhysicianDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPhysician(null);
        }}
        physicianData={selectedPhysician}
      />
    </div>
  );
}
