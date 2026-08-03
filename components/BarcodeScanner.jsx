import { useRef, useState, useEffect } from "react";
import { useScanSpecimen } from "@/hooks/useScanSpecimen";
import { ScanLine, CheckCircle, XCircle, Keyboard } from "lucide-react";

export default function BarcodeScanner({ onScan, onError }) {
  const inputRef = useRef(null);
  const { mutate: scanSpecimen, isPending } = useScanSpecimen();
  
  const [status, setStatus] = useState('ready'); // ready, scanning, success, error
  const [message, setMessage] = useState('Scanner ready');
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Keep focus on the hidden input to capture wedge events
    const interval = setInterval(() => {
      if (document.activeElement !== inputRef.current && status === 'ready') {
        inputRef.current?.focus();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleScan = (e) => {
    if (e.key !== "Enter") return;

    const barcode = inputValue.trim();
    if (!barcode || isPending) return;

    setStatus('scanning');
    setMessage(`Processing ${barcode}...`);
    
    // Call props if provided, otherwise default to scanSpecimen
    if (onScan) {
      try {
        onScan(barcode);
        handleSuccess();
      } catch (err) {
        handleError(err);
      }
    } else {
      scanSpecimen(barcode, {
        onSuccess: () => handleSuccess(),
        onError: (err) => handleError(err),
      });
    }
  };

  const handleSuccess = () => {
    playSuccess();
    setStatus('success');
    setMessage('Code processed successfully!');
    setInputValue('');
    setTimeout(() => {
      setStatus('ready');
      setMessage('Scanner ready');
    }, 2000);
  };

  const handleError = (err) => {
    playError();
    setStatus('error');
    const msg = err?.response?.data?.message || err?.message || 'Error scanning code';
    setMessage(msg);
    if (onError) onError(err);
    setInputValue('');
    setTimeout(() => {
      setStatus('ready');
      setMessage('Scanner ready');
    }, 3000);
  };

  const playSuccess = () => {
    try { new Audio("/sounds/success.mp3").play(); } catch(e) {}
  };

  const playError = () => {
    try { new Audio("/sounds/error.mp3").play(); } catch(e) {}
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Status Bar */}
      <div className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
        status === 'ready' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
        status === 'scanning' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
        status === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
        'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        {status === 'ready' && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
        {status === 'scanning' && <ScanLine className="w-4 h-4 animate-pulse" />}
        {status === 'success' && <CheckCircle className="w-4 h-4" />}
        {status === 'error' && <XCircle className="w-4 h-4" />}
        {message}
      </div>

      {/* Input Area */}
      <div className="p-4 relative">
        <div className="relative flex items-center">
          <Keyboard className="absolute left-3 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            autoFocus
            placeholder="Scan barcode or type manually..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleScan}
            disabled={status === 'scanning'}
            className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-lg outline-none focus:ring-2 transition-all ${
              status === 'success' ? 'border-green-400 ring-green-200 bg-green-50/50' :
              status === 'error' ? 'border-red-400 ring-red-200 bg-red-50/50' :
              'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
            }`}
          />
        </div>
      </div>
    </div>
  );
}