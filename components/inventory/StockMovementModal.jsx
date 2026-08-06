import React, { useState } from "react";
import { X, ArrowDownToLine, ArrowUpFromLine, Scale } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function StockMovementModal({ item, type, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    reason: "",
    reference_number: "",
    lot_number: item?.lot_number || "",
    expiry_date: item?.expiry_date || "",
    cost_per_unit: item?.cost_per_unit || "",
  });

  const config = {
    RECEIVE: {
      title: "Receive Stock (Stock In)",
      icon: ArrowDownToLine,
      color: "text-green-600",
      btnColor: "bg-green-600 hover:bg-green-700",
      endpoint: `/inventory/${item?.id}/receive`,
      successMsg: "Stock received successfully",
    },
    CONSUME: {
      title: "Consume Stock (Stock Out)",
      icon: ArrowUpFromLine,
      color: "text-orange-600",
      btnColor: "bg-orange-600 hover:bg-orange-700",
      endpoint: `/inventory/${item?.id}/consume`,
      successMsg: "Stock consumed successfully",
    },
    ADJUST: {
      title: "Adjust Quantity (Audit)",
      icon: Scale,
      color: "text-blue-600",
      btnColor: "bg-blue-600 hover:bg-blue-700",
      endpoint: `/inventory/${item?.id}/adjust`,
      successMsg: "Quantity adjusted successfully",
    },
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quantity) {
      toast.error("Quantity is required");
      return;
    }
    
    // For Adjust, we use 'adjustment' key on backend instead of 'quantity'
    const payload = type === "ADJUST" 
      ? { adjustment: formData.quantity, reason: formData.reason }
      : { ...formData };

    try {
      setLoading(true);
      await api.post(currentConfig.endpoint, payload);
      toast.success(currentConfig.successMsg);
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-2 ${currentConfig.color}`} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentConfig.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Item: <span className="font-semibold text-gray-900 dark:text-white">{item?.item_name}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current Stock: <span className="font-semibold text-gray-900 dark:text-white">{item?.quantity} {item?.unit}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === "ADJUST" ? "Adjustment (+ or -)" : "Quantity"} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="quantity"
              required
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={type === "ADJUST" ? "e.g. -2 or 5" : "Enter quantity"}
            />
          </div>

          {type === "RECEIVE" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lot Number</label>
                <input
                  type="text"
                  name="lot_number"
                  value={formData.lot_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_per_unit"
                  value={formData.cost_per_unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason / Notes</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={type === "CONSUME" ? "e.g. Used for batch testing" : ""}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference Number (PO / Order)</label>
            <input
              type="text"
              name="reference_number"
              value={formData.reference_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded-md transition-colors flex items-center ${currentConfig.btnColor} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
