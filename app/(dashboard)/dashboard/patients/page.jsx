
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePatientDelete, usePatients } from '@/hooks/use-patients';
import { Search, Plus, ChevronLeft, ChevronRight, Users, Pencil, Trash2, Eye } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { PermissionDenied } from '@/components/PermissionGuard';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import PatientDetailsPopup from '@/components/detail-popup/PatientDetailsPopup';

// Delete Confirmation Modal with Theme Support
const DeleteConfirmModal = ({ patient, onConfirm, onCancel }) => {
  if (!patient) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Patient</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete patient{' '}
          <span className="font-semibold">
            {[patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" ")}
          </span>
          ? This will permanently remove the patient and all associated data.
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
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
          >
            Delete Patient
          </button>
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

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  // State for patient details popup
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { tenant } = useAuthStore();
  const router = useRouter();

  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Patients
  if (!canRead('Patients') && !isAdmin()) {
    return <PermissionDenied resource="Patients" action="read" />;
  }

  const { data, isLoading, refetch } = usePatients({
    tenantId: tenant?.id || "",
    q: search || undefined,
    page,
    limit: 10
  });

  const patients = data?.data || [];
  const pagination = data?.pagination;

  const deletePatient = usePatientDelete();

  const RemovePatient = async (id) => {
    // Check permission before attempting delete
    if (!canDelete('Patients') && !isAdmin()) {
      toast.error("You don't have permission to delete patients");
      return;
    }

    try {
      await deletePatient.mutateAsync(id);
      toast.success("Patient deleted successfully");
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete patient");
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "—";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (f, l) =>
    `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setIsPopupOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          patient={deleteConfirm}
          onConfirm={() => RemovePatient(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Patients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} patients registered
          </p>
        </div>

        {canCreate('Patients') && (
          <Link
            href="/dashboard/patients/new"
            className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Patient
          </Link>
        )}
      </div>

      {/* ================= SEARCH ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, MRN, phone or email..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">MRN</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Patient</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Age / Gender</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Phone</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">City</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Registered On</th>
                {(canUpdate('Patients') || canDelete('Patients')) && (
                  <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeleton key={i} columns={7} />
                ))
              ) : patients.length > 0 ? (
                patients.map((p) => (
                  <tr key={p?.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* MRN - Clickable */}
                    <td className="px-6 py-4">
                      <button
                        // onClick={() => handleViewDetails(p)}
                         onClick={()=>router.push(`/dashboard/orders?id=${p.mrn}`)}
                        className="text-[#1b4dff] dark:text-[#1b4dff] font-semibold hover:underline cursor-pointer"
                      >
                        {p.mrn}
                      </button>
                    </td>

                    {/* Patient */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1b4dff] dark:bg-[#1b4dff] rounded-full flex items-center justify-center text-white text-xs font-semibold shadow flex-shrink-0">
                          {getInitials(p.firstName, p.lastName)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {[p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")}
                          </div>
                          {p.email && <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{p.email}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Age / Gender */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {calculateAge(p.dateOfBirth)} yrs • {p.gender ? p.gender.charAt(0).toUpperCase() : '—'}
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap font-medium">
                      {p.phonePrimary || '—'}
                    </td>

                    {/* City */}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {p.city || '—'}
                    </td>

                    {/* Registered Date */}
                    <td className="px-6 py-4 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>

                    {/* Actions - View, Edit, Delete buttons */}
                    {(canUpdate('Patients') || canDelete('Patients')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Button */}
                          <button
                            // onClick={() => handleViewDetails(p)}
                            onClick={(e) => handleViewDetails(p, e)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Patient Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          {canUpdate('Patients') && (
                            <button
                              onClick={() => router.push(`/dashboard/patients/edit?id=${p.id}`)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Edit Patient"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          {canDelete('Patients') && (
                            <button
                              onClick={() => setDeleteConfirm(p)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete Patient"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {patients.length === 0 && !isLoading && (
          <div className="py-20 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 dark:text-gray-500 font-medium">No patients found</p>
            {canCreate('Patients') && (
              <Link href="/dashboard/patients/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                Add your first patient →
              </Link>
            )}
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {pagination && pagination?.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} patients
            </p>

            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-600 dark:text-gray-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Page {page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-40 transition text-gray-600 dark:text-gray-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Popup */}
      <PatientDetailsPopup
        patient={selectedPatient}
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedPatient(null);
        }}
        onViewSpecimens={(orderId) => {
          router.push(`#`);
        }}
      />
    </div>
  );
}