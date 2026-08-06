"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { api } from '@/lib/api';
import { toast } from "sonner";
import {
  Truck,
  Plus,
  Search,
  Trash2,
  Edit,
  RefreshCw,
  Mail,
  Phone,
  Star
} from "lucide-react";
import SupplierModal from "@/components/inventory/SupplierModal";

export default function SuppliersPage() {
  const { canCreate, isAdmin } = usePermissions();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [activeModal, setActiveModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all for client-side filtering
      const res = await api.get('/inventory-suppliers?limit=1000');
      setSuppliers(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = suppliers.filter((s) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return s.name.toLowerCase().includes(term) || 
           s.contact_person?.toLowerCase().includes(term) ||
           s.email?.toLowerCase().includes(term);
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await api.delete(`/inventory-suppliers/${id}`);
        toast.success("Supplier deleted");
        fetchSuppliers();
      } catch (err) {
        toast.error("Failed to delete supplier");
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Truck className="w-6 h-6 mr-2 text-blue-500" />
            Supplier Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage vendors and suppliers for your inventory.
          </p>
        </div>
        {(canCreate("Inventory") || isAdmin()) && (
          <button 
            onClick={() => { setSelectedSupplier(null); setActiveModal(true); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No suppliers found.</td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{supplier.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] truncate" title={supplier.address}>
                        {supplier.address || "No address provided"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300 font-medium">
                        {supplier.contact_person || 'N/A'}
                      </div>
                      <div className="flex flex-col mt-1 space-y-1">
                        {supplier.email && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" /> {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" /> {supplier.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(supplier.performance_rating || 3)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => { setSelectedSupplier(supplier); setActiveModal(true); }} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit Supplier"><Edit className="w-4 h-4 inline" /></button>
                      <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete Supplier"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => setActiveModal(false)}
          onSuccess={() => { setActiveModal(false); fetchSuppliers(); }}
        />
      )}
    </div>
  );
}
