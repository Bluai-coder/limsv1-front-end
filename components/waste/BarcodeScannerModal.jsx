'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Scan, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useScanWaste } from '@/hooks/useWaste';

export default function BarcodeScannerModal({ onClose, onScanSuccess }) {
    const [barcode, setBarcode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const [scannedWaste, setScannedWaste] = useState(null);
    const inputRef = useRef(null);

    const scanMutation = useScanWaste();

    useEffect(() => {
        // Auto-focus input on mount
        setTimeout(() => {
            inputRef.current?.focus();
        }, 300);
    }, []);

    const handleScan = async (e) => {
        e?.preventDefault();
        
        const barcodeToScan = barcode.trim();
        if (!barcodeToScan) {
            setError('Please enter or scan a barcode');
            return;
        }

        setIsScanning(true);
        setError('');
        setScannedWaste(null);

        try {
            const result = await scanMutation.mutateAsync(barcodeToScan);
            setScannedWaste(result.data);
            toast.success('Waste record found!');
            
            // Auto-close after delay if onScanSuccess provided
            if (onScanSuccess) {
                setTimeout(() => {
                    onScanSuccess(result.data);
                }, 1500);
            }
        } catch (err) {
            setError(err?.response?.data?.message);
            setScannedWaste(null);
        } finally {
            setIsScanning(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleScan(e);
        }
    };

    const handleManualEntry = () => {
        // For manual entry mode
        if (barcode.trim()) {
            handleScan();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Scan Barcode
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter or scan waste barcode
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Scanner Icon */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Scan className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
                        Use a barcode scanner or type the barcode manually
                    </p>

                    <form onSubmit={handleScan}>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter barcode (e.g., WST-2024-000001)"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isScanning}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition"
                            >
                                {isScanning ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Scan className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {scannedWaste && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Found!</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Barcode</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {scannedWaste.waste_barcode || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Type</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {scannedWaste.waste_type || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {scannedWaste.status || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Patient</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {scannedWaste.patient_name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Press Enter to scan or click the scan button
                        </p>
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => {
                                    setBarcode('');
                                    setError('');
                                    setScannedWaste(null);
                                    inputRef.current?.focus();
                                }}
                                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                Clear
                            </button>
                            {scannedWaste && onScanSuccess && (
                                <button
                                    onClick={() => onScanSuccess(scannedWaste)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                >
                                    View Details →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}