import { useState } from "react";
import axios from "axios";

export default function InvoicePaymentModal({ invoice, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(invoice?.total_amount || 0);
  const [method, setMethod] = useState("card");

  const paymentMethods = [
    { id: "card", name: "Card", icon: "💳" },
    { id: "upi", name: "UPI", icon: "📱" },
    { id: "paypal", name: "PayPal", icon: "💰" },
    { id: "cash", name: "Cash", icon: "💵" },
  ];

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`/api/invoices/${invoice.id}/payments`, {
        method,
        amount,
      });

      if (response.data.success) {
        onSuccess?.(response.data.data);
        onClose();
      }
    } catch (error) {
      alert("Payment failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Make Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Invoice #{invoice?.invoice_number}</p>
          <p className="text-2xl font-bold text-blue-600">₹{amount}</p>
        </div>

        <div className="space-y-2 mb-4">
          {paymentMethods.map((pm) => (
            <button
              key={pm.id}
              onClick={() => setMethod(pm.id)}
              className={`w-full flex items-center p-3 border rounded-lg transition ${
                method === pm.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <span className="text-2xl mr-3">{pm.icon}</span>
              <span className="font-medium">{pm.name}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      </div>
    </div>
  );
}