"use client";

import React, { useState, useEffect } from "react";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { usePackages, useDeletePackage } from "@/hooks/use-packages";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Loader2, Package, Eye } from "lucide-react";
import Link from "next/link";

export default function PackagesPage() {
  const { canCreate, canUpdate, canDelete, isAdmin } = usePermissions();
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [packageToView, setPackageToView] = useState(null);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch packages
  const { data: response, isLoading, isError } = usePackages({
    page,
    limit,
    search: debouncedSearch
  });

  const packages = response?.data || [];
  // Backend returns totalPages; support both field names
  const pagination = {
    ...(response?.pagination || {}),
    total: response?.pagination?.total || 0,
    pages: response?.pagination?.totalPages || response?.pagination?.pages || 1,
  };

  // Delete mutation
  const deleteMutation = useDeletePackage();

  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;
    try {
      await deleteMutation.mutateAsync(packageToDelete.id);
      toast.success("Package deleted successfully");
      setDeleteModalOpen(false);
      setPackageToDelete(null);
    } catch (error) {
      toast.error("Failed to delete package");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Packages</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage panels and profiles</p>
        </div>
        {(canCreate('Packages') || isAdmin()) && (
          <Link 
            href="/dashboard/packages/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Package
          </Link>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search packages by name or code..." 
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}
        
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-900 dark:text-white font-medium">Failed to load packages</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please try again later</p>
          </div>
        )}

        {!isLoading && !isError && packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <Package className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-900 dark:text-white font-medium">No packages found</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Package Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price / Offer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {packages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{pkg.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Code: {pkg.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 max-w-xs">{pkg.description || '-'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {pkg.test_count || pkg.tests?.length || 0} tests
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">₹{Number(pkg.price).toFixed(2)}</div>
                      {pkg.offer_price && Number(pkg.offer_price) < Number(pkg.price) ? (
                        <>
                          <div className="text-xs text-green-600 dark:text-green-400">Offer: ₹{Number(pkg.offer_price).toFixed(2)}</div>
                          <div className="text-xs text-orange-500 dark:text-orange-400 font-medium">
                            {Math.round(((Number(pkg.price) - Number(pkg.offer_price)) / Number(pkg.price)) * 100)}% off
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-400 dark:text-gray-500">No discount</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                            <button 
                        onClick={() => { setPackageToView(pkg); setViewModalOpen(true); }}
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                      {(canUpdate('Packages') || isAdmin()) && (
                        <Link href={`/dashboard/packages/edit?id=${pkg.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <Edit className="w-4 h-4 inline" />
                        </Link>
                      )}
                      {(canDelete('Packages') || isAdmin()) && (
                        <button 
                          onClick={() => handleDeleteClick(pkg)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing page <span className="font-medium text-gray-900 dark:text-white">{page}</span> of <span className="font-medium text-gray-900 dark:text-white">{pagination.pages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Package Modal */}
      {viewModalOpen && packageToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6 m-4 animate-in fade-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{packageToView.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Code: {packageToView.code} | Price: ?{packageToView.price}</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">{packageToView.description || "No description provided."}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Included Tests ({packageToView.tests?.length || 0})</h4>
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Test Name</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Code</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {packageToView.tests?.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 text-gray-900 dark:text-white">{t.name}</td>
                          <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{t.code}</td>
                          <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{t.department}</td>
                        </tr>
                      ))}
                      {(!packageToView.tests || packageToView.tests.length === 0) && (
                        <tr>
                          <td colSpan="3" className="px-4 py-4 text-center text-gray-500">No tests assigned.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Package</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">{packageToDelete?.name}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

