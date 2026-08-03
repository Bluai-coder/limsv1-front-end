'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Plus, 
    Search, 
    Eye, 
    Trash2, 
    Edit,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    Package,
    Syringe,
    Droplet,
    Scissors,
    FlaskConical,
    Barcode,
    QrCode,
    Printer,
    Download,
    Scan,
    RefreshCw
} from 'lucide-react';
import { useWasteRecords, useWasteSummary, useDeleteWaste } from '@/hooks/use-waste';
import WasteStatusBadge from '@/components/waste/WasteStatusBadge';
import WasteTypeBadge from '@/components/waste/WasteTypeBadge';
import CreateWasteModal from '@/components/waste/CreateWasteModal';
import WasteDetailsModal from '@/components/waste/WasteDetailsModal';
import BarcodeScannerModal from '@/components/waste/BarcodeScannerModal';
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/permissions/usePermissions';

export default function WasteManagementPage() {
    const router = useRouter();
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        status: '',
        waste_type: '',
        from_date: '',
        to_date: '',
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [selectedWaste, setSelectedWaste] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteModalConfig, setDeleteModalConfig] = useState({ title: '', message: '', ids: [] });

    // RBAC Hooks
    const { canCreate, canDelete, isAdmin } = usePermissions();

    const { data, isLoading, error, refetch } = useWasteRecords(filters);
    const { data: summary, refetch: refetchSummary } = useWasteSummary();
    const deleteMutation = useDeleteWaste();
    const printRef = useRef();

    const handleDelete = (id) => {
        setDeleteModalConfig({
            title: 'Delete Waste Record',
            message: 'Are you sure you want to delete this waste record?',
            ids: [id]
        });
        setDeleteModalOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedRows.length === 0) {
            toast.warning('Please select at least one record to delete');
            return;
        }
        setDeleteModalConfig({
            title: 'Delete Waste Records',
            message: `Are you sure you want to delete ${selectedRows.length} waste records?`,
            ids: selectedRows
        });
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            for (const id of deleteModalConfig.ids) {
                await deleteMutation.mutateAsync(id);
            }
            toast.success(deleteModalConfig.ids.length > 1 ? 'Successfully deleted records' : 'Successfully deleted record');
            setSelectedRows([]);
            setIsSelectAll(false);
            setDeleteModalOpen(false);
            refetch();
            refetchSummary();
        } catch (error) {
            toast.error('Failed to delete record(s)');
        }
    };

    const handleSearch = (e) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const handleStatusFilter = (e) => {
        setFilters({ ...filters, status: e.target.value, page: 1 });
    };

    const handleTypeFilter = (e) => {
        setFilters({ ...filters, waste_type: e.target.value, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const handleViewDetails = (waste) => {
        setSelectedWaste(waste);
        setShowDetailsModal(true);
    };

    const handleScanSuccess = (waste) => {
        setSelectedWaste(waste);
        setShowDetailsModal(true);
        setShowScannerModal(false);
        toast.success(`Waste record found: ${waste.waste_barcode}`);
    };

    const handleSelectRow = (id) => {
        setSelectedRows(prev => 
            prev.includes(id) 
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (isSelectAll) {
            setSelectedRows([]);
        } else {
            setSelectedRows(data?.data?.map(w => w.id) || []);
        }
        setIsSelectAll(!isSelectAll);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        // Export logic
        const headers = ['Barcode', 'Type', 'Patient', 'Volume', 'Status', 'Generated'];
        const rows = data?.data?.map(w => [
            w.waste_barcode || 'N/A',
            w.waste_type || 'N/A',
            w.patient_name || 'N/A',
            w.volume_ml ? `${w.volume_ml} ml` : 'N/A',
            w.status || 'N/A',
            formatDate(w.generated_at)
        ]) || [];
        
        // Simple CSV export
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `waste-records-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Export successful!');
    };

    // Summary Cards Data
    const summaryCards = [
        {
            title: 'Total Waste',
            count: summary?.data?.total || 0,
            icon: BarChart3,
            color: 'blue',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            borderColor: 'border-blue-500',
        },
        {
            title: 'Segregated',
            count: summary?.data?.status_breakdown?.find(s => s.status === 'segregated')?.count || 0,
            icon: Clock,
            color: 'yellow',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            textColor: 'text-yellow-600 dark:text-yellow-400',
            borderColor: 'border-yellow-500',
        },
        {
            title: 'Treated',
            count: summary?.data?.status_breakdown?.find(s => s.status === 'treated')?.count || 0,
            icon: FlaskConical,
            color: 'purple',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
            borderColor: 'border-purple-500',
        },
        {
            title: 'Disposed',
            count: summary?.data?.status_breakdown?.find(s => s.status === 'disposed')?.count || 0,
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400',
            borderColor: 'border-green-500',
        },
        {
            title: 'Rejected',
            count: summary?.data?.status_breakdown?.find(s => s.status === 'rejected')?.count || 0,
            icon: XCircle,
            color: 'red',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            textColor: 'text-red-600 dark:text-red-400',
            borderColor: 'border-red-500',
        },
    ];

    const wasteTypes = [
        { value: 'liquid', label: 'Liquid', icon: Droplet },
        { value: 'solid', label: 'Solid', icon: Package },
        { value: 'sharps', label: 'Sharps', icon: Scissors },
        { value: 'pathological', label: 'Pathological', icon: Syringe },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-red-600 dark:text-red-400">Error loading waste records: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Waste Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track and manage biohazardous waste efficiently
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
                    {/* Barcode Scanner */}
                    <button
                        onClick={() => setShowScannerModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg shadow-purple-600/20 transition-all duration-200"
                    >
                        <Scan className="w-4 h-4" />
                        <span className="hidden sm:inline">Scan</span>
                    </button>

                    {/* Refresh */}
                    <button
                        onClick={() => {
                            refetch();
                            refetchSummary();
                            toast.success('Refreshed!');
                        }}
                        className="p-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>

                    {/* Export */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg shadow-green-600/20 transition-all duration-200"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    {/* Add */}
                    {/* RBAC Guard: Only users with Create permission can add waste */}
                    {(canCreate('Waste') || isAdmin()) && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg shadow-blue-600/20 transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Waste</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
                {summaryCards.map((card) => (
                    <div
                        key={card.title}
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 ${card.borderColor} hover:shadow-md transition-shadow`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {card.count}
                                </p>
                            </div>
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.textColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by patient, barcode..."
                            value={filters.search}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <select
                            value={filters.status}
                            onChange={handleStatusFilter}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="segregated">Segregated</option>
                            <option value="treated">Treated</option>
                            <option value="packaged">Packaged</option>
                            <option value="transported">Transported</option>
                            <option value="disposed">Disposed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filters.waste_type}
                            onChange={handleTypeFilter}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                        >
                            <option value="">All Types</option>
                            {wasteTypes.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={filters.from_date}
                            onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>
                    <div>
                        <input
                            type="date"
                            value={filters.to_date}
                            onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={isSelectAll}
                                        onChange={handleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Barcode</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Volume</th>
                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Generated</th>
                                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                        <p>No waste records found</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Create your first waste record →
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                data?.data?.map((waste) => (
                                    <tr key={waste.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                        <td className="px-4 sm:px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(waste.id)}
                                                onChange={() => handleSelectRow(waste.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {waste.waste_barcode || 'N/A'}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <WasteTypeBadge type={waste.waste_type} />
                                        </td>
                                        <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {waste.patient_name || 'N/A'}
                                        </td>
                                        <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {waste.volume_ml ? `${waste.volume_ml} ml` : 'N/A'}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4">
                                            <WasteStatusBadge status={waste.status} />
                                        </td>
                                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {formatDate(waste.generated_at)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(waste)}
                                                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {/* <button
                                                    onClick={() => router.push(`/waste/${waste.id}/edit`)}
                                                    className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button> */}
                                                
                                                {/* RBAC Guard: Only users with Delete permission can delete waste */}
                                                {(canDelete('Waste') || isAdmin()) && (
                                                <button
                                                    onClick={() => handleDelete(waste.id)}
                                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Delete"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Bulk Actions + Pagination */}
                {data?.data?.length > 0 && (
                    <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* RBAC Guard: Bulk delete requires Delete permission */}
                            {selectedRows.length > 0 && (canDelete('Waste') || isAdmin()) && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                                >
                                    Delete Selected ({selectedRows.length})
                                </button>
                            )}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedRows.length} selected
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(data.pagination.page - 1)}
                                disabled={!data.pagination.hasPrevPage}
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition dark:text-white"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                                Page {data.pagination.page} of {data.pagination.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(data.pagination.page + 1)}
                                disabled={!data.pagination.hasNextPage}
                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition dark:text-white"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateWasteModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        refetch();
                        refetchSummary();
                    }}
                />
            )}

            {showDetailsModal && selectedWaste && (
                <WasteDetailsModal
                    waste={selectedWaste}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedWaste(null);
                        refetch();
                        refetchSummary();
                    }}
                />
            )}

            {showScannerModal && (
                <BarcodeScannerModal
                    onClose={() => setShowScannerModal(false)}
                    onScanSuccess={handleScanSuccess}
                />
            )}

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={deleteModalConfig.title}
                message={deleteModalConfig.message}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
