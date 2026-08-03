'use client';
import { AlertCircle, RefreshCw } from 'lucide-react';
export default function QueryError({ error, onRetry, title = 'Failed to load data', className = '' }) {
  const message = error?.response?.data?.message || error?.message || 'An unexpected error occurred';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 ${className}`}>
      <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-800 dark:text-red-300 text-sm">{title}</p>
        <p className="text-red-600 dark:text-red-400 text-sm mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 whitespace-nowrap transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      )}
    </div>
  );
}
