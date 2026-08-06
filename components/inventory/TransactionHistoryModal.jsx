import React, { useState, useEffect } from "react";
import { X, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function TransactionHistoryModal({ item, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // The API supports pagination, sorting, etc. due to APIFeatures
        const res = await api.get(`/inventory/${item.id}/transactions?sort=-createdAt`);
        setTransactions(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    if (item?.id) {
      fetchTransactions();
    }
  }, [item?.id]);

  const getTransactionColor = (type) => {
    switch (type) {
      case "RECEIVE": return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "CONSUME": return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30";
      case "ADJUST": return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30";
      default: return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Transaction History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Audit ledger for: <span className="font-semibold text-gray-900 dark:text-gray-200">{item?.item_name}</span> (Lot: {item?.lot_number || 'N/A'})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
              <p>Loading audit ledger...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p>No transactions found for this item.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prev Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason / Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTransactionColor(tx.transaction_type)}`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${parseFloat(tx.quantity_changed) > 0 ? 'text-green-600 dark:text-green-400' : parseFloat(tx.quantity_changed) < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                        {parseFloat(tx.quantity_changed) > 0 ? '+' : ''}{tx.quantity_changed}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                        {tx.previous_quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                        {tx.new_quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={tx.reason || tx.reference_number}>
                        {tx.reason} {tx.reference_number && `(${tx.reference_number})`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {tx.user?.fullName || 'Unknown User'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
