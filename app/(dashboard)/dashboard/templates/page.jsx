// app/tenant/templates/page.jsx
'use client';

import { useState } from 'react';
import {
    Plus, Edit, Trash2, Copy, Eye, Star,
    Loader2, Search, Filter, CheckCircle, XCircle,
    FileText, Layout, RefreshCw, ChevronDown, ChevronUp,
    AlertTriangle
} from 'lucide-react';
import { usetenantTemplates, usetenantTemplateStatistics, useDeletetenantTemplate, useSetDefaulttenantTemplate, useDuplicatetenantTemplate, useToggletenantTemplateActive } from '@/hooks/useTenantTemplatesForPdf';
import TenantTemplateModal from '@/components/TenantTemplateModal';
import TenantTemplatePreview from '@/components/TenantTemplatePreview';

// Delete Confirmation Modal Component
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, template, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Delete Template</h3>
                            <p className="text-red-100 text-sm">This action cannot be undone</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-700 dark:text-gray-300">
                            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{template?.name}</span>?
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            This will permanently remove this template from the system. All associated data will be lost.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Template
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function tenantTemplatesPage() {
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    // Hooks
    const { data: templatesData, isLoading, refetch } = usetenantTemplates({ search, type: filterType });
    const { data: statsData } = usetenantTemplateStatistics();
    const deleteTemplate = useDeletetenantTemplate();
    const setDefault = useSetDefaulttenantTemplate();
    const duplicateTemplate = useDuplicatetenantTemplate();
    const toggleActive = useToggletenantTemplateActive();

    const templates = templatesData?.data || [];
    const statistics = statsData?.data || { total: 0, active: 0, default: 0, byType: {} };

    const handleDeleteClick = (template) => {
        setTemplateToDelete(template);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (templateToDelete) {
            await deleteTemplate.mutate(templateToDelete.id);
            setDeleteModalOpen(false);
            setTemplateToDelete(null);
        }
    };

    const handleSetDefault = (id) => {
        setDefault.mutate(id);
    };

    const handleDuplicate = (id, name) => {
        duplicateTemplate.mutate({ id, name: `${name} (Copy)` });
    };

    const handleToggleActive = (id) => {
        toggleActive.mutate(id);
    };

    const handleEdit = (template) => {
        setSelectedTemplate(template);
        setShowEditModal(true);
    };

    const handlePreview = (template) => {
        setSelectedTemplate(template);
        setShowPreview(true);
    };

    const getTypeBadge = (type) => {
        const types = {
            laboratory: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            pathology: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            radiology: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            invoice: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
        };
        return types[type] || types.laboratory;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Report Templates
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Create and manage laboratory report templates
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Create Template
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Templates</div>
                            </div>
                            <FileText className="w-8 h-8 text-blue-500 opacity-50" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.active}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statistics.default}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Default</div>
                            </div>
                            <Star className="w-8 h-8 text-yellow-500 opacity-50" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statistics.byType?.laboratory || 0}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Lab Reports</div>
                            </div>
                            <Layout className="w-8 h-8 text-purple-500 opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search templates by name..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                            >
                                <Filter className="w-4 h-4" />
                                Filter
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                            <button
                                onClick={() => refetch()}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setFilterType('all')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition ${filterType === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    All Types
                                </button>
                                <button
                                    onClick={() => setFilterType('laboratory')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition ${filterType === 'laboratory'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Laboratory
                                </button>
                                <button
                                    onClick={() => setFilterType('pathology')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition ${filterType === 'pathology'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Pathology
                                </button>
                                <button
                                    onClick={() => setFilterType('radiology')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition ${filterType === 'radiology'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Radiology
                                </button>
                                <button
                                    onClick={() => setFilterType('invoice')}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition ${filterType === 'invoice'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Invoice
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Templates Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Template</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Version</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
                                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                                            <td className="px-6 py-4"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                                            <td className="px-6 py-4"><div className="flex justify-center gap-2"><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div><div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div></div></td>
                                        </tr>
                                    ))
                                ) : templates.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                            <p className="text-gray-500 dark:text-gray-400">No templates found</p>
                                            <button
                                                onClick={() => setShowCreateModal(true)}
                                                className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Create your first template →
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    templates.map((template) => (
                                        <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {template.is_default && (
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 dark:text-yellow-400" />
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{template.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {template.id?.slice(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getTypeBadge(template.type)}`}>
                                                    {template.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                v{template.version}
                                            </td>
                                            <td className="px-6 py-4">
                                                {template.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                                                        <XCircle className="w-3 h-3" /> Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    {!template.is_default && (
                                                        <button
                                                            onClick={() => handleSetDefault(template.id)}
                                                            className="p-1.5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded transition"
                                                            title="Set as Default"
                                                        >
                                                            <Star className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handlePreview(template)}
                                                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                                                        title="Preview"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(template)}
                                                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(template.id, template.name)}
                                                        className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition"
                                                        title="Duplicate"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(template.id)}
                                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                                                        title={template.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {template.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(template)}
                                                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TenantTemplateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                mode="create"
                onSuccess={() => {
                    setShowCreateModal(false);
                    refetch();
                }}
            />

            <TenantTemplateModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedTemplate(null);
                }}
                mode="edit"
                template={selectedTemplate}
                onSuccess={() => {
                    setShowEditModal(false);
                    setSelectedTemplate(null);
                    refetch();
                }}
            />

            <TenantTemplatePreview
                isOpen={showPreview}
                onClose={() => {
                    setShowPreview(false);
                    setSelectedTemplate(null);
                }}
                template={selectedTemplate}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setTemplateToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                template={templateToDelete}
                isDeleting={deleteTemplate.isPending}
            />
        </div>
    );
}