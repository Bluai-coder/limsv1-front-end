'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useResults } from '@/hooks/useResults';
import { usePermissions } from '@/hooks/permissions/usePermissions';
import { PermissionDenied } from '@/components/PermissionGuard';

export default function AllResults() {
  // Use permission hook
  const {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin
  } = usePermissions();

  // Check if user has read access to Results Entry
  if (!canRead('Results Entry')) {
    return <PermissionDenied resource="Results Entry" action="read" />;
  }
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const router = useRouter();

  const { data, isLoading } = useResults({
    q: search || undefined,
    page,
    limit,
  });

  const results = data?.data || [];
  const pagination = data?.pagination;

  const getFlagBadge = (flag) => {
    if (flag === "HIGH" || flag === "LOW") {
      return (
        <span className="px-3 py-1 text-xs rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          {flag || "NORMAL"}
        </span>
      );
    } else if (flag === "NORMAL") {
      return (
        <span className="px-3 py-1 text-xs rounded-full font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
          {flag || "NORMAL"}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs rounded-full font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        {flag || "NORMAL"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 space-y-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {pagination?.total ?? 0} total results
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm p-5">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by patient name, test or MRN..."
            className="w-full pl-14 pr-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1b4dff] text-base transition-colors duration-200"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Patient</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Test / Analyte</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Value</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Reference Range</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Flag</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : results.length > 0 ? (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {r.patientName || "—"}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{r.mrn}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{r.analyte}</div>
                      {r.testCode && <div className="text-xs text-gray-400 dark:text-gray-500">{r.testCode}</div>}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {r.value || "—"} <span className="text-gray-500 dark:text-gray-400">{r.unit}</span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {r.range || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {getFlagBadge(r.flag)}
                    </td>

                    <td className="px-6 py-4 text-sm capitalize text-gray-600 dark:text-gray-400">
                      {r.status || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => router.push(`/dashboard/results/${r.orderTestId}`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => window.open(`/dashboard/results/${r.orderTestId}/pdf`, '_blank')}
                          className="flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-400 dark:text-gray-500 font-medium">No results found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} results
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-gray-700 dark:text-gray-300"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}