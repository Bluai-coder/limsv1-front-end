'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    Activity,
    Pencil,
    Trash2,
    Eye,
    X
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { useAuthStore } from '@/lib/auth-store';

// Delete Confirmation Modal Component with Theme Support
const DeleteConfirmModal = ({ hospital, onConfirm, onCancel }) => {
    if (!hospital) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Hospital</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                    </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Are you sure you want to delete hospital{' '}
                    <span className="font-semibold">{hospital.hospital_name}</span>?
                    This will permanently remove the hospital from the system.
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
                        Delete Hospital
                    </button>
                </div>
            </div>
        </div>
    );
};

// Loading Skeleton Component
const TableSkeleton = ({ columns = 5 }) => (
    <tr className="animate-pulse">
        {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-6 py-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </td>
        ))}
    </tr>
);

// Status badge component with theme support
const StatusBadge = ({ status }) => {
    const statusConfig = {
        active: { label: 'Active', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
        inactive: { label: 'Inactive', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' },
        suspended: { label: 'Suspended', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.inactive;

    return (
        <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${config.className}`}>
            {config.label}
        </span>
    );
};

// View Details Modal Component
const ViewHospitalModal = ({ hospital, onClose }) => {
    if (!hospital) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{hospital.hospital_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{hospital.email || 'No email'}</p>
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
                            <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{hospital.phone || '—'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                            <StatusBadge status={hospital.status} />
                        </div>
                        {hospital.address && (
                            <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {hospital.address.line1}, {hospital.address.city}, {hospital.address.state}, {hospital.address.country} - {hospital.address.pincode}
                                </p>
                            </div>
                        )}
                        {hospital.created_at && (
                            <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {new Date(hospital.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AllHospitalsAttachedCurrentLab() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [viewHospital, setViewHospital] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        currentPage: 1
    });

    // Use permission hook
    const {
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        isAdmin
    } = usePermissions();

    const { tenant } = useAuthStore();

    // Mock data for development/testing when API is not available
    const getMockHospitals = () => {
        return [
            {
                hospital_id: 1,
                hospital_name: "Yashoda Hospital & Research Centre",
                email: "yashoda.hospital@mail.com",
                phone: "9999999999",
                status: "active",
                address: {
                    line1: "12, Sarita Vihar",
                    city: "New Delhi",
                    state: "Delhi",
                    country: "India",
                    pincode: "110076"
                },
                created_at: "2025-12-29T05:23:43.090Z"
            },
            {
                hospital_id: 2,
                hospital_name: "Apollo Hospitals",
                email: "apollo.hospital@mail.com",
                phone: "8888888888",
                status: "active",
                address: {
                    line1: "21, Greams Lane",
                    city: "Chennai",
                    state: "Tamil Nadu",
                    country: "India",
                    pincode: "600006"
                },
                created_at: "2025-12-28T10:15:30.000Z"
            },
            {
                hospital_id: 3,
                hospital_name: "Fortis Memorial Research Institute",
                email: "fortis.hospital@mail.com",
                phone: "7777777777",
                status: "inactive",
                address: {
                    line1: "Sector 44",
                    city: "Gurugram",
                    state: "Haryana",
                    country: "India",
                    pincode: "122002"
                },
                created_at: "2025-12-27T15:45:20.000Z"
            }
        ];
    };

    // Fetch hospitals
    const fetchHospitals = async () => {
        if (!tenant?.id) {
            setLoading(false);
            setError('No lab tenant found. Please log in again.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const endpoint = `http://192.168.1.26:3000/api/bluhealth/labs/${tenant.id}/hospitals`;

            const response = await fetch(endpoint, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const hospitalData = await response.json();
            console.log('API Response:', hospitalData);

            if (hospitalData?.data?.hospitals) {
    
                // Hospitals set करें
                const hospitalsData = hospitalData.data.hospitals || [];
                setHospitals(hospitalsData);
                setPagination({
                    total: hospitalData.data.total_hospitals || hospitalsData.length,
                    totalPages: Math.ceil((hospitalData.data.total_hospitals || hospitalsData.length) / 10),
                    currentPage: page
                });
            } else {
                setHospitals([]);
                setPagination({
                    total: 0,
                    totalPages: 1,
                    currentPage: 1
                });
            }
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
            toast.error(error.message);
            setHospitals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenant?.id) {
            fetchHospitals();
        } else {
            // If no tenant, use mock data
            console.warn('No tenant found, using mock data');
            const mockData = getMockHospitals();
            setHospitals(mockData);
            setPagination({
                total: mockData.length,
                totalPages: 1,
                currentPage: 1
            });
            setLoading(false);
        }
    }, [tenant?.id, search, page]);


    const handleViewDetails = (hospital) => {
        setViewHospital(hospital);
    };

    return (
        <div className="space-y-6">
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <DeleteConfirmModal
                    hospital={deleteConfirm}
                    onConfirm={() => handleDelete(deleteConfirm.hospital_id)}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}

            {/* View Hospital Modal */}
            {viewHospital && (
                <ViewHospitalModal
                    hospital={viewHospital}
                    onClose={() => setViewHospital(null)}
                />
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Hospitals</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {pagination?.total || 0} hospitals attached to {tenant?.lab_name || 'current lab'}
                    </p>
                </div>

                {canCreate('Hospitals') && (
                    <Link
                        href="/dashboard/hospitals/new"
                        className="flex items-center gap-2 px-5 py-3 bg-[#1b4dff] hover:bg-[#1b4dff]/90 text-white rounded-2xl text-sm font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Hospital
                    </Link>
                )}
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-red-700 dark:text-red-400">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => fetchHospitals()}
                        className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* SEARCH */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search hospitals by name, email or phone..."
                        className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Hospital Name</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Email</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Phone</th>
                                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                                {(canUpdate('Hospitals') || canDelete('Hospitals')) && (
                                    <th className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableSkeleton key={i} columns={5} />
                                ))
                            ) : hospitals.length > 0 ? (
                                hospitals.map((hospital) => (
                                    <tr key={hospital.hospital_id || hospital.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        {/* NAME - Clickable */}
                                        <td className="px-6 py-4">
                                            <button
                                                // onClick={() => handleViewDetails(hospital)}
                                                onClick={()=>router.push(`/dashboard/hospitals/tests?hospitalId=${hospital.hospital_id}`)}

                                                className="font-medium text-gray-900 dark:text-white hover:text-[#1b4dff] dark:hover:text-[#1b4dff] transition text-left"
                                            >
                                                {hospital.hospital_name}
                                            </button>
                                        </td>

                                        {/* EMAIL */}
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {hospital.email || '—'}
                                        </td>

                                        {/* PHONE */}
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {hospital.phone || '—'}
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={hospital.status} />
                                        </td>

                                        {/* ACTIONS - View, Edit, Delete buttons */}
                                        {(canUpdate('Hospitals') || canDelete('Hospitals')) && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* View Button */}
                                                    <button
                                                        onClick={() => handleViewDetails(hospital)}
                                                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="View Hospital Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Edit Button */}
                                                    {/* {canUpdate('Hospitals') && (
                                                        <button
                                                            onClick={() => router.push(`/dashboard/hospitals/edit?id=${hospital.hospital_id || hospital.id}`)}
                                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                            title="Edit Hospital"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    )} */}

                                                    {/* Delete Button */}
                                                    {/* {canDelete('Hospitals') && (
                                                        <button
                                                            onClick={() => setDeleteConfirm(hospital)}
                                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                            title="Delete Hospital"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )} */}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <Activity className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-gray-400 dark:text-gray-500 font-medium">No hospitals found</p>
                                        {canCreate('Hospitals') && (
                                            <Link href="/dashboard/hospitals/new" className="text-[#1b4dff] text-sm mt-2 inline-block hover:underline">
                                                Add your first hospital →
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {Math.min((page - 1) * 10 + 1, pagination.total)}–{Math.min(page * 10, pagination.total)} of {pagination.total} hospitals
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
        </div>
    );
}