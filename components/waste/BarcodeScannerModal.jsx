'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Scan, AlertTriangle, CheckCircle, Loader2, Camera, Keyboard } from 'lucide-react';
import { useScanWaste } from '@/hooks/use-waste';
import { toast } from 'sonner';
import QrReader from '@/components/QrReader';

export default function BarcodeScannerModal({ onClose, onScanSuccess }) {
    const [mode, setMode] = useState('usb'); // 'usb' | 'camera'
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

            // Auditory feedback for successful scan
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                if (ctx) {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.1);
                }
            } catch (e) {
                console.warn("Audio feedback skipped", e);
            }

            toast.success('Waste record found!');
            
            // Auto-close after delay if onScanSuccess provided
            if (onScanSuccess) {
                setTimeout(() => {
                    onScanSuccess(result.data);
                }, 1500);
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to scan barcode');
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
                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        <button
                            onClick={() => { setMode('usb'); setTimeout(() => inputRef.current?.focus(), 100); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition ${mode === 'usb' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <Keyboard className="w-4 h-4" />
                            USB Scanner
                        </button>
                        <button
                            onClick={() => setMode('camera')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition ${mode === 'camera' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            <Camera className="w-4 h-4" />
                            Camera
                        </button>
                    </div>

                    {mode === 'camera' ? (
                        <div className="relative rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 min-h-[300px]">
                            <QrReader
                                onScan={(data) => {
                                    setBarcode(data);
                                    handleScan(new Event('submit'));
                                }}
                                onError={(err) => setError(err.message)}
                            />
                            {/* Hardware-style Scanner Overlay */}
                            <div className="absolute inset-0 pointer-events-none border-4 border-black/10">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="border-2 border-green-500/50 w-3/4 h-3/4 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>
                                </div>
                                <style>{`
                                  @keyframes wasteLaserScan {
                                    0% { top: 10%; opacity: 0; }
                                    10% { opacity: 1; }
                                    90% { opacity: 1; }
                                    100% { top: 90%; opacity: 0; }
                                  }
                                  .waste-scanner-laser {
                                    position: absolute;
                                    left: 10%;
                                    width: 80%;
                                    height: 2px;
                                    background-color: #ef4444;
                                    box-shadow: 0 0 10px #ef4444, 0 0 20px #ef4444;
                                    animation: wasteLaserScan 2s infinite ease-in-out;
                                    z-index: 20;
                                  }
                                `}</style>
                                <div className="waste-scanner-laser"></div>
                            </div>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}

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