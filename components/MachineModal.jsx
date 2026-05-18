import { useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";

export default function MachineModal({ open, onClose, orderTestId }) {
    const [hl7, setHl7] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!hl7.trim()) {
            alert("Please enter HL7 data");
            return;
        }

        try {
            setLoading(true);

            await api.post("/msg/machine/hl7", {
                message: hl7,
                orderTestId,
            });

            alert("✅ Machine data processed");
            setHl7("");
            onClose();

        } catch (err) {
            console.error(err);
            alert("❌ Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">

                {/* HEADER */}
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                    Simulate Machine
                </h2>

                <p className="text-xs text-gray-500 mb-4 font-mono">
                    OrderTest: {orderTestId}
                </p>

                {/* INPUT */}
                <textarea
                    rows={6}
                    value={hl7}
                    onChange={(e) => setHl7(e.target.value)}
                    placeholder={`OBX|1|NM|HGB||13.5|g/dL
OBX|2|NM|WBC||7000|/µL`}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* LOAD SAMPLE */}
                <button
                    onClick={() =>
                        setHl7(`OBX|1|NM|HGB||13.5|g/dL
OBX|2|NM|WBC||7000|/µL`)
                    }
                    className="text-xs text-blue-600 mt-2 hover:underline"
                >
                    + Load sample
                </button>

                {/* ACTIONS */}
                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                </div>

            </div>
        </div>
    );
}