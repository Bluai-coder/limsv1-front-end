"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { api } from '@/lib/api';
import { toast } from "sonner";
import {
  Package, Plus, Search, Filter, AlertTriangle, Clock, Trash2, Edit, TrendingDown,
  RefreshCw, ArrowDownToLine, ArrowUpFromLine, Scale, History, Bell, ShoppingCart, Tags, Users
} from "lucide-react";
import StockMovementModal from "@/components/inventory/StockMovementModal";
import TransactionHistoryModal from "@/components/inventory/TransactionHistoryModal";
import InventoryItemModal from "@/components/inventory/InventoryItemModal";
import LotModal from "@/components/inventory/LotModal";
import PurchaseRequestModal from "@/components/inventory/PurchaseRequestModal";
import { useInventoryLots, usePurchaseRequests, useInventoryAlerts, useUpdateLotStatus, useApprovePurchaseRequest, useRejectPurchaseRequest, useMarkOrdered, useReceivePurchaseRequest } from "@/hooks/use-inventory";
import Link from "next/link";
import { format } from "date-fns";

export default function InventoryPage() {
  const { canCreate, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState("items"); // items, lots, prs, alerts
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals state
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory?limit=1000');
      setItems(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Derived stats
  const totalItems = items.length;
  const lowStock = items.filter(
    (i) => parseFloat(i.quantity) > 0 && parseFloat(i.quantity) <= parseFloat(i.reorder_level)
  ).length;
  const criticalStock = items.filter((i) => parseFloat(i.quantity) === 0).length;
  const expiringSoon = items.filter((i) => {
    if (!i.expiry_date) return false;
    const days = (new Date(i.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 30;
  }).length;

  const getStatusBadge = (item) => {
    const qty = parseFloat(item.quantity);
    const reorder = parseFloat(item.reorder_level);
    
    if (qty === 0) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Critical</span>;
    if (item.expiry_date) {
      const daysToExpiry = (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysToExpiry > 0 && daysToExpiry <= 30) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Expiring Soon</span>;
    }
    if (qty <= reorder) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Low Stock</span>;
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">In Stock</span>;
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase()) || 
                          item.supplier?.name?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === "All") return true;
    const qty = parseFloat(item.quantity);
    if (statusFilter === "Critical") return qty === 0;
    if (statusFilter === "Low Stock") return qty > 0 && qty <= parseFloat(item.reorder_level);
    if (statusFilter === "Expiring Soon") {
      if (!item.expiry_date) return false;
      const days = (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
      return days > 0 && days <= 30;
    }
    return true;
  });

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await api.delete(`/inventory/${id}`);
        toast.success("Item deleted");
        fetchInventory();
      } catch (err) {
        toast.error("Failed to delete item");
      }
    }
  };

  // ---------------------------------------------------------
  // Render sub-views (Lots, PRs, Alerts)
  // ---------------------------------------------------------
  const LotsTab = () => {
    const { data: lotsRes, isLoading } = useInventoryLots();
    const lots = lotsRes?.data?.data || [];
    const { mutate: updateLotStatus } = useUpdateLotStatus();
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto p-4">
        <h2 className="text-lg font-bold mb-4 dark:text-white">Lot Management</h2>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Item</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Lot #</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Expiry</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Supplier</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr> : lots.map(lot => (
              <tr key={lot.id} className="dark:text-gray-300">
                <td className="px-4 py-3">{lot.item?.item_name}</td>
                <td className="px-4 py-3">{lot.lot_number}</td>
                <td className="px-4 py-3">{lot.quantity} {lot.unit}</td>
                <td className="px-4 py-3">{lot.expiry_date ? format(new Date(lot.expiry_date), 'dd MMM yyyy') : '-'}</td>
                <td className="px-4 py-3">{lot.supplier?.name || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lot.status === 'active' ? 'bg-green-100 text-green-800' :
                    lot.status === 'quarantine' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lot.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {lot.status === 'active' && (
                    <button onClick={() => updateLotStatus({ id: lot.id, status: 'quarantine' })} className="text-amber-500 text-sm hover:underline">Quarantine</button>
                  )}
                  {(lot.status === 'active' || lot.status === 'quarantine') && (
                    <button onClick={() => updateLotStatus({ id: lot.id, status: 'expired' })} className="text-red-500 text-sm hover:underline">Expire</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const PRsTab = () => {
    const { data: prsRes, isLoading } = usePurchaseRequests();
    const prs = prsRes?.data?.data || [];
    const { mutate: approve } = useApprovePurchaseRequest();
    const { mutate: reject } = useRejectPurchaseRequest();
    const { mutate: markOrdered } = useMarkOrdered();
    const { mutate: receive } = useReceivePurchaseRequest();

    const getPRStatusColor = (status) => {
      const colors = {
        pending: 'bg-amber-100 text-amber-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        ordered: 'bg-blue-100 text-blue-800',
        received: 'bg-purple-100 text-purple-800',
        cancelled: 'bg-gray-100 text-gray-800'
      };
      return colors[status] || colors.pending;
    };

    const getPriorityColor = (p) => {
      const colors = { low: 'bg-gray-100', normal: 'bg-blue-100 text-blue-800', high: 'bg-orange-100 text-orange-800', urgent: 'bg-red-100 text-red-800' };
      return colors[p] || colors.normal;
    };

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold dark:text-white">Purchase Requests</h2>
          <button onClick={() => setActiveModal('PR_NEW')} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-2"/> Raise PR
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">PR #</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Item</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Priority</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Requested By</th>
              <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr> : prs.map(pr => (
              <tr key={pr.id} className="dark:text-gray-300">
                <td className="px-4 py-3 font-medium">{pr.pr_number}</td>
                <td className="px-4 py-3">{pr.item?.item_name}</td>
                <td className="px-4 py-3">{pr.requested_quantity} {pr.unit}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(pr.priority)}`}>{pr.priority}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${getPRStatusColor(pr.status)}`}>{pr.status}</span></td>
                <td className="px-4 py-3 text-sm">{pr.requestedBy?.fullName}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  {pr.status === 'pending' && isAdmin() && (
                    <>
                      <button onClick={() => approve({id: pr.id, data:{}})} className="text-green-500 hover:underline text-sm">Approve</button>
                      <button onClick={() => {
                        const reason = prompt("Rejection Reason:");
                        if(reason) reject({id: pr.id, data: {rejection_reason: reason}});
                      }} className="text-red-500 hover:underline text-sm">Reject</button>
                    </>
                  )}
                  {pr.status === 'approved' && isAdmin() && (
                    <button onClick={() => markOrdered(pr.id)} className="text-blue-500 hover:underline text-sm">Mark Ordered</button>
                  )}
                  {pr.status === 'ordered' && isAdmin() && (
                    <button onClick={() => {
                      const lot = prompt("Enter Lot Number:");
                      if(lot) receive({id: pr.id, data: {lot_number: lot}});
                    }} className="text-purple-500 hover:underline text-sm">Receive items</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const AlertsTab = () => {
    const { data: alertsRes, isLoading } = useInventoryAlerts();
    const alerts = alertsRes?.data || { lowStock: [], critical: [], expiringSoon: [], expired: [] };

    if (isLoading) return <div className="p-4">Loading alerts...</div>;

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-900 p-4">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 mr-2" /> Critical & Low Stock
          </h3>
          <ul className="space-y-2">
            {alerts.critical.map(i => (
              <li key={i.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-900/50">
                <span className="font-medium dark:text-gray-200">{i.item_name} (Supplier: {i.supplier?.name || '-'})</span>
                <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full font-bold">0 {i.unit} left</span>
              </li>
            ))}
            {alerts.lowStock.map(i => (
              <li key={i.id} className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-100 dark:border-amber-900/50">
                <span className="font-medium dark:text-gray-200">{i.item_name} (Supplier: {i.supplier?.name || '-'})</span>
                <span className="px-2 py-1 text-xs bg-amber-200 text-amber-800 rounded-full font-bold">{i.quantity} {i.unit} (Reorder: {i.reorder_level})</span>
              </li>
            ))}
            {alerts.critical.length === 0 && alerts.lowStock.length === 0 && <p className="text-gray-500">No stock alerts.</p>}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-orange-200 dark:border-orange-900 p-4">
          <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2" /> Expiring Soon
          </h3>
          <ul className="space-y-2">
            {alerts.expired.map(i => (
              <li key={i.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-900/50">
                <span className="font-medium dark:text-gray-200">{i.item_name} - {i.lot_number || 'N/A'}</span>
                <span className="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full font-bold">Expired on {format(new Date(i.expiry_date), 'dd MMM yyyy')}</span>
              </li>
            ))}
            {alerts.expiringSoon.map(i => (
              <li key={i.id} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-100 dark:border-orange-900/50">
                <span className="font-medium dark:text-gray-200">{i.item_name} - {i.lot_number || 'N/A'}</span>
                <span className="px-2 py-1 text-xs bg-orange-200 text-orange-800 rounded-full font-bold">Expires: {format(new Date(i.expiry_date), 'dd MMM yyyy')}</span>
              </li>
            ))}
            {alerts.expired.length === 0 && alerts.expiringSoon.length === 0 && <p className="text-gray-500">No expiry alerts.</p>}
          </ul>
        </div>
      </div>
    );
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Package className="w-6 h-6 mr-2 text-blue-500" />
            Inventory & Stock Supply
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Enterprise-grade inventory tracking with strict audit ledgers.
          </p>
        </div>
        {(canCreate("Inventory") || isAdmin()) && activeTab === 'items' && (
          <button 
            onClick={() => { setSelectedItem(null); setActiveModal('ITEM_NEW'); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Item
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items</div>
            <Package className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-amber-500 dark:text-amber-400">Low Stock</div>
            <TrendingDown className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{lowStock}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-orange-500 dark:text-orange-400">Expiring Soon</div>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{expiringSoon}</div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-red-500 dark:text-red-400">Critical Stock</div>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{criticalStock}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button onClick={() => setActiveTab('items')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'items' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}>
          <Package className="w-4 h-4 mr-2" /> Items
        </button>
        <button onClick={() => setActiveTab('lots')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'lots' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}>
          <Tags className="w-4 h-4 mr-2" /> Lots
        </button>
        <button onClick={() => setActiveTab('prs')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'prs' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}>
          <ShoppingCart className="w-4 h-4 mr-2" /> Purchase Requests
        </button>
        <Link href="/dashboard/inventory-suppliers" className={`flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400`}>
          <Users className="w-4 h-4 mr-2" /> Suppliers
        </Link>
        <button onClick={() => setActiveTab('alerts')} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'alerts' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}>
          <Bell className="w-4 h-4 mr-2" /> Alerts
          {(lowStock > 0 || criticalStock > 0 || expiringSoon > 0) && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{lowStock + criticalStock + expiringSoon}</span>
          )}
        </button>
      </div>

      {activeTab === 'lots' && <LotsTab />}
      {activeTab === 'prs' && <PRsTab />}
      {activeTab === 'alerts' && <AlertsTab />}

      {activeTab === 'items' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search items or suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Critical">Critical</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Expiring Soon">Expiring Soon</option>
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transactions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No items found.</td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.item_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <span className="capitalize">{item.category}</span>
                            {item.location && <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">Loc: {item.location}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-300">{item.supplier?.name || '-'}</div>
                          <div className="text-xs text-gray-500">Lot: {item.lot_number || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{item.quantity} {item.unit}</div>
                          <div className="text-xs text-gray-500">Min: {item.reorder_level}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button onClick={() => { setSelectedItem(item); setActiveModal('RECEIVE') }} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-md" title="Stock In"><ArrowDownToLine className="w-4 h-4" /></button>
                            <button onClick={() => { setSelectedItem(item); setActiveModal('CONSUME') }} className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40 rounded-md" title="Stock Out"><ArrowUpFromLine className="w-4 h-4" /></button>
                            <button onClick={() => { setSelectedItem(item); setActiveModal('ADJUST') }} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-md" title="Audit/Adjust"><Scale className="w-4 h-4" /></button>
                            <button onClick={() => { setSelectedItem(item); setActiveModal('ADD_LOT') }} className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 rounded-md" title="Add Lot"><Tags className="w-4 h-4" /></button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button onClick={() => { setSelectedItem(item); setActiveModal('HISTORY') }} className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300" title="Transaction Ledger"><History className="w-4 h-4 inline" /></button>
                          <button onClick={() => { setSelectedItem(item); setActiveModal('ITEM_EDIT') }} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit Item Info"><Edit className="w-4 h-4 inline" /></button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete Item"><Trash2 className="w-4 h-4 inline" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODALS */}
      {(activeModal === 'RECEIVE' || activeModal === 'CONSUME' || activeModal === 'ADJUST') && selectedItem && (
        <StockMovementModal 
          item={selectedItem} 
          type={activeModal}
          onClose={() => setActiveModal(null)} 
          onSuccess={() => { setActiveModal(null); fetchInventory(); }} 
        />
      )}

      {activeModal === 'HISTORY' && selectedItem && (
        <TransactionHistoryModal 
          item={selectedItem} 
          onClose={() => setActiveModal(null)} 
        />
      )}

      {(activeModal === 'ITEM_NEW' || activeModal === 'ITEM_EDIT') && (
        <InventoryItemModal
          item={activeModal === 'ITEM_EDIT' ? selectedItem : null}
          onClose={() => setActiveModal(null)}
          onSuccess={() => { setActiveModal(null); fetchInventory(); }}
        />
      )}

      {activeModal === 'ADD_LOT' && selectedItem && (
        <LotModal
          item={selectedItem}
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'PR_NEW' && (
        <PurchaseRequestModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
