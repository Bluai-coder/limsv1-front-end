"use client";
import { useState, useEffect, useRef } from "react";
import {
  Camera,
  User,
  Package,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  Scan,
  Plus,
  Minus,
  Search,
  Loader2,
  QrCode,
  X,
  PlusCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";
import jsQR from "jsqr";

// Toast Notification Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-slide-up ${
        type === "success"
          ? "bg-green-600"
          : type === "error"
            ? "bg-red-600"
            : "bg-yellow-600"
      } text-white`}
    >
      {type === "success" ? (
        <CheckCircle size={18} />
      ) : type === "error" ? (
        <XCircle size={18} />
      ) : (
        <AlertCircle size={18} />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

// Compact QR Scanner Component (400x400px)
function CompactQrReader({ onScan, onError, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("starting");
  const [lastScan, setLastScan] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setStatus("error");
          onError?.(new Error("Camera not supported"));
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 800 },
            height: { ideal: 800 },
          },
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", true);
          await videoRef.current.play();
          setStatus("scanning");
          scanFrame();
        }
      } catch (err) {
        console.error("Camera error:", err);
        setStatus("error");
        onError?.(err);
      }
    };

    const scanFrame = () => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) {
        rafRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data !== lastScan) {
        setLastScan(code.data);
        onScan(code.data);
        drawBox(ctx, code.location);
        setTimeout(() => {
          setLastScan(null);
          if (active) rafRef.current = requestAnimationFrame(scanFrame);
        }, 1500);
        return;
      }

      rafRef.current = requestAnimationFrame(scanFrame);
    };

    function drawBox(ctx, location) {
      if (!location) return;
      ctx.beginPath();
      ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
      ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
      ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
      ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
      ctx.closePath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#10b981";
      ctx.stroke();
    }

    startCamera();

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onScan, onError]);

  return (
    <div
      className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isExpanded ? "fixed inset-4 z-50 rounded-xl" : "w-[400px] h-[400px]"
      }`}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {status === "scanning" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 relative">
            <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-emerald-400 rounded-tl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-emerald-400 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-emerald-400 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-emerald-400 rounded-br" />
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 animate-pulse" />
          </div>
        </div>
      )}

      {status === "starting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 p-4">
          <AlertCircle size={32} className="text-white mb-2" />
          <p className="text-white text-sm text-center">Camera unavailable</p>
        </div>
      )}

      {lastScan && (
        <div className="absolute bottom-0 inset-x-0 bg-emerald-500/95 p-2 text-center">
          <p className="text-white text-xs font-medium">✓ Scanned!</p>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-xl backdrop-blur-sm transition-all z-10"
      >
        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>

      <button
        onClick={onClose}
        className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-xl backdrop-blur-sm transition-all z-10"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default function ScanAddItemPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [encounterId, setEncounterId] = useState("");
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualSku, setManualSku] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [activeTab, setActiveTab] = useState("scan");
  const [newItem, setNewItem] = useState({
    sku: "",
    name: "",
    price: "",
    unit: "piece",
    stock: "",
    category: "Medication",
  });

  const searchRef = useRef(null);

  // Mock items database
  const [mockItems, setMockItems] = useState({
    "MED-AM-500": {
      id: "1",
      name: "Amoxicillin 500mg",
      unit: "capsule",
      stock: 120,
      price: 25.5,
      category: "Medication",
      dosage: "500mg",
      manufacturer: "GSK",
    },
    "SYR-INS-1": {
      id: "2",
      name: "Insulin Syringe 1mL",
      unit: "piece",
      stock: 45,
      price: 8.75,
      category: "Equipment",
      manufacturer: "BD",
    },
    "CTL-MOR-10": {
      id: "3",
      name: "Morphine Sulfate 10mg",
      unit: "vial",
      stock: 15,
      price: 125.0,
      category: "Controlled",
      dosage: "10mg",
      manufacturer: "PharmaCorp",
    },
    "SUP-MSK-01": {
      id: "4",
      name: "Surgical Mask",
      unit: "box",
      stock: 8,
      price: 45.0,
      category: "PPE",
      manufacturer: "3M",
    },
  });

  const allItems = Object.entries(mockItems).map(([sku, data]) => ({
    sku,
    ...data,
  }));

  // Handle USB scanner
  useEffect(() => {
    let buffer = "";
    let timer;

    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "Enter") {
        if (buffer.length > 0) {
          processScan(buffer);
          buffer = "";
        }
        return;
      }

      if (e.key.length === 1) {
        buffer += e.key;
        clearTimeout(timer);
        timer = setTimeout(() => {
          buffer = "";
        }, 200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const processScan = (scannedData) => {
    if (isProcessing) return;
    setIsProcessing(true);

    let sku = scannedData.trim().toUpperCase();
    try {
      const parsed = JSON.parse(scannedData);
      sku = parsed.sku || scannedData;
    } catch {
      // Not JSON
    }

    const item = mockItems[sku];
    if (!item) {
      showToast(`Item not found: ${sku}`, "error");
      setIsProcessing(false);
      return;
    }

    if (item.stock <= 0) {
      showToast(`${item.name} is out of stock!`, "error");
      setIsProcessing(false);
      return;
    }

    setScannedItems((prev) => {
      const exists = prev.findIndex((i) => i.sku === sku);
      if (exists >= 0) {
        const updated = [...prev];
        const newQuantity = updated[exists].quantity + 1;
        if (newQuantity > item.stock) {
          showToast(`Only ${item.stock} ${item.unit}(s) available`, "warning");
          setIsProcessing(false);
          return prev;
        }
        updated[exists].quantity = newQuantity;
        return updated;
      }
      return [
        ...prev,
        {
          sku,
          id: item.id,
          name: item.name,
          quantity: 1,
          price: item.price,
          unit: item.unit,
          stock: item.stock,
          dosage: item.dosage,
        },
      ];
    });

    showToast(`✓ ${item.name} added`, "success");
    setIsProcessing(false);
  };

  const handleCameraError = (error) => {
    console.error("Camera error:", error);
    showToast("Unable to access camera. Please check permissions.", "error");
    setScanning(false);
  };

  const handleScan = (data) => {
    if (data && !isProcessing) {
      processScan(data);
    }
  };

  const handleManualSearch = (value) => {
    setManualSku(value);
    if (value.length > 0) {
      const results = allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(value.toLowerCase()) ||
          item.sku.toLowerCase().includes(value.toLowerCase()),
      );
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const addFromSearch = (item) => {
    processScan(item.sku);
    setManualSku("");
    setShowSearchDropdown(false);
  };

  const handleAddNewItem = () => {
    if (!newItem.sku || !newItem.name || !newItem.price || !newItem.stock) {
      showToast("Please fill all required fields", "error");
      return;
    }

    const sku = newItem.sku.toUpperCase();

    if (mockItems[sku]) {
      showToast(`SKU ${sku} already exists!`, "error");
      return;
    }

    const newItemData = {
      id: String(Object.keys(mockItems).length + 1),
      name: newItem.name,
      unit: newItem.unit,
      stock: parseInt(newItem.stock),
      price: parseFloat(newItem.price),
      category: newItem.category,
      manufacturer: newItem.manufacturer || "Unknown",
    };

    setMockItems((prev) => ({ ...prev, [sku]: newItemData }));

    showToast(`✓ "${newItem.name}" added successfully!`, "success");

    setNewItem({
      sku: "",
      name: "",
      price: "",
      unit: "piece",
      stock: "",
      category: "Medication",
      manufacturer: "",
    });
    setShowAddItemModal(false);
  };

  const handleRemoveItem = (sku) => {
    setScannedItems((prev) => prev.filter((i) => i.sku !== sku));
    showToast("Item removed from cart", "success");
  };

  const handleUpdateQuantity = (sku, quantity) => {
    if (quantity <= 0) {
      handleRemoveItem(sku);
      return;
    }

    const item = scannedItems.find((i) => i.sku === sku);
    if (quantity > item.stock) {
      showToast(`Only ${item.stock} ${item.unit}(s) available`, "warning");
      return;
    }

    setScannedItems((prev) =>
      prev.map((i) => (i.sku === sku ? { ...i, quantity } : i)),
    );
  };

  const handleDispense = () => {
    if (!patientId || !patientName) {
      showToast("Please enter patient information", "error");
      return;
    }

    if (scannedItems.length === 0) {
      showToast("No items to dispense", "error");
      return;
    }

    const total = scannedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    showToast(
      `✓ Dispensed Successfully! Total: ₹${total.toFixed(2)}`,
      "success",
    );

    setScannedItems([]);
    setPatientId("");
    setPatientName("");
    setEncounterId("");
    setScanning(false);
  };

  const totalAmount = scannedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = scannedItems.reduce((sum, i) => sum + i.quantity, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Scan & Dispense
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quick medication dispensing system
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Add New Item
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm bg-white text-gray-700 rounded-xl border border-gray-200 hover:shadow-md transition-all flex items-center gap-2"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </div>
        </div>

        {/* Patient Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-xl">
              <User size={18} className="text-blue-600" />
            </div>
            Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient ID / MRN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encounter ID
              </label>
              <input
                type="text"
                value={encounterId}
                onChange={(e) => setEncounterId(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("scan")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "scan"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Camera size={16} />
              Scan QR/Barcode
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === "manual"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Search size={16} />
              Manual Entry
            </button>
          </div>

          <div className="p-6">
            {/* Scan Tab */}
            {activeTab === "scan" && (
              <div className="flex flex-col items-center justify-center">
                {!scanning ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-4">
                      <QrCode size={48} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Ready to Scan
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 text-center">
                      Position QR code or barcode in the scanner
                    </p>
                    <button
                      onClick={() => {
                        setScanning(true);
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Camera size={18} />
                      Start Camera
                    </button>
                  </div>
                ) : (
                  <>
                    <CompactQrReader
                      onScan={handleScan}
                      onError={handleCameraError}
                      onClose={() => setScanning(false)}
                    />
                    <p className="text-xs text-gray-500 mt-3">
                      Position QR code in the square
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Manual Tab - Fixed Dropdown Position */}
            {activeTab === "manual" && (
              <div className="relative" ref={searchRef}>
                <div className="relative z-10">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={manualSku}
                    onChange={(e) => handleManualSearch(e.target.value)}
                    onFocus={() => {
                      if (manualSku.length > 0 && searchResults.length > 0) {
                        setShowSearchDropdown(true);
                      }
                    }}
                    placeholder="Search by name, SKU, or barcode..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results Dropdown - Positioned below with proper spacing */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <>
                        <div className="sticky top-0 px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Found {searchResults.length} item
                            {searchResults.length !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {searchResults.map((item) => (
                          <button
                            key={item.sku}
                            onClick={() => addFromSearch(item)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                SKU: {item.sku}
                              </p>
                              {item.dosage && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Dosage: {item.dosage}
                                </p>
                              )}
                            </div>

                            <div className="text-right ml-4">
                              <p className="text-sm font-semibold text-gray-800">
                                ₹{item.price}
                              </p>
                              <p
                                className={`text-xs ${
                                  item.stock < 20
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }`}
                              >
                                Stock: {item.stock}
                              </p>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Package
                          size={32}
                          className="text-gray-300 mx-auto mb-2"
                        />
                        <p className="text-sm text-gray-500">No items found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try a different search term
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scanned Items List */}
        {scannedItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Package size={18} className="text-blue-600" />
                  Items to Dispense
                </h2>
                <span className="text-sm text-gray-500">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} • ₹
                  {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {scannedItems.map((item) => (
                <div
                  key={item.sku}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      <p className="font-medium text-gray-800">{item.name}</p>
                      {item.dosage && (
                        <span className="text-xs text-gray-500">
                          ({item.dosage})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500">
                      <span>SKU: {item.sku}</span>
                      <span>
                        ₹{item.price} / {item.unit}
                      </span>
                      <span className={item.stock < 20 ? "text-red-500" : ""}>
                        Stock: {item.stock}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.sku, item.quantity - 1)
                        }
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.sku, item.quantity + 1)
                        }
                        className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-semibold text-gray-800 w-24 text-right">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.sku)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <span className="text-lg font-semibold text-gray-800">
                  Total Amount:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDispense}
                  disabled={!patientId || scannedItems.length === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle size={20} />
                  Confirm Dispense
                </button>
                <button
                  onClick={() => setScannedItems([])}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Item Modal */}
        {showAddItemModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Add New Item
                </h2>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU / Barcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newItem.sku}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          sku: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g., MED-NEW-001"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                      placeholder="e.g., New Medicine 100mg"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem({ ...newItem, price: e.target.value })
                        }
                        placeholder="0.00"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={newItem.stock}
                        onChange={(e) =>
                          setNewItem({ ...newItem, stock: e.target.value })
                        }
                        placeholder="0"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        value={newItem.unit}
                        onChange={(e) =>
                          setNewItem({ ...newItem, unit: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>piece</option>
                        <option>box</option>
                        <option>vial</option>
                        <option>capsule</option>
                        <option>tablet</option>
                        <option>mL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option>Medication</option>
                        <option>Equipment</option>
                        <option>PPE</option>
                        <option>Controlled</option>
                        <option>Consumable</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacturer (Optional)
                    </label>
                    <input
                      type="text"
                      value={newItem.manufacturer}
                      onChange={(e) =>
                        setNewItem({ ...newItem, manufacturer: e.target.value })
                      }
                      placeholder="Manufacturer name"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleAddNewItem}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Add Item
                    </button>
                    <button
                      onClick={() => setShowAddItemModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
